import { supabase } from '@/lib/supabase'

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_at?: number
}

export class GoogleCalendarAPI {
  private static readonly BASE_URL = 'https://www.googleapis.com/calendar/v3'

  // Get fresh access token using refresh token
  private static async getValidAccessToken(): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token) {
        throw new Error('GOOGLE_NOT_CONNECTED')
      }

      // Check if we have refresh token in provider_refresh_token
      const refreshToken = session.provider_refresh_token
      
      if (!refreshToken) {
        throw new Error('GOOGLE_REFRESH_TOKEN_MISSING')
      }

      // Check if current access token is still valid (if expires info available)
      const accessToken = session.provider_token
      
      // Try using current token first
      try {
        const testResponse = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        
        if (testResponse.ok) {
          return accessToken // Current token is still valid
        }
      } catch (e) {
        console.log('Current token invalid, refreshing...')
      }

      // Refresh the token
      const newTokens = await this.refreshAccessToken(refreshToken)
      
      // Update session with new tokens
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })

      return newTokens.access_token
    } catch (error) {
      console.error('Error getting valid access token:', error)
      throw error
    }
  }

  // Refresh Google access token using refresh token
  private static async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!, // This needs to be in environment variables
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Token refresh failed:', errorData)
      throw new Error('GOOGLE_REFRESH_FAILED')
    }

    const data = await response.json()
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token, // May not be present in refresh response
      expires_at: Date.now() + (data.expires_in * 1000)
    }
  }

  static async createEvent(event: any, retryCount = 0): Promise<string> {
    try {
      const accessToken = await this.getValidAccessToken()
      
      const response = await fetch(`${this.BASE_URL}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        if (response.status === 401 && retryCount === 0) {
          // Token might be expired, try refreshing once more
          console.log('401 error, forcing token refresh...')
          // Force refresh by clearing current session cache
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.provider_refresh_token) {
            const newTokens = await this.refreshAccessToken(session.provider_refresh_token)
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            })
            return this.createEvent(event, retryCount + 1)
          }
        }
        
        const errorData = await response.json().catch(() => ({}))
        throw {
          status: response.status,
          message: errorData.error?.message || 'Failed to create event',
          error: errorData
        }
      }

      const data = await response.json()
      return data.id
    } catch (error: any) {
      if (error.message === 'GOOGLE_NOT_CONNECTED') {
        throw new Error('GOOGLE_AUTH_EXPIRED')
      }
      throw error
    }
  }

static async deleteEvent(eventId: string, accessToken: string, retryCount = 0): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (!response.ok && response.status !== 404) {
        if (response.status === 401 && retryCount === 0) {
          // Token might be expired, try refreshing once more
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.provider_refresh_token) {
            const newTokens = await this.refreshAccessToken(session.provider_refresh_token)
            await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            })
            return this.deleteEvent(eventId, accessToken, retryCount + 1)
          }
        }

        const errorData = await response.json().catch(() => ({}))
        throw {
          status: response.status,
          message: errorData.error?.message || 'Failed to delete event',
          error: errorData
        }
      }
    } catch (error: any) {
      if (error.message === 'GOOGLE_NOT_CONNECTED') {
        throw new Error('GOOGLE_AUTH_EXPIRED')
      }
      throw error
    }
  }

  // Check if user has valid Google connection
  static async checkGoogleConnection(): Promise<boolean> {
    try {
      await this.getValidAccessToken()
      return true
    } catch (error) {
      return false
    }
  }
}