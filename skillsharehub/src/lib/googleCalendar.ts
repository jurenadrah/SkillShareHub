import { supabase } from './supabase'

export interface GoogleCalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  source?: {
    title: string
    url: string
  }
}

export class GoogleCalendarAPI {
  private static async getAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) {
      throw new Error('No Google access token available')
    }
    return session.provider_token
  }

  // Accept accessToken as an optional argument
  static async createEvent(event: GoogleCalendarEvent, accessToken?: string): Promise<string> {
    // Use the provided token or fetch it if not provided
    if (!accessToken) {
      accessToken = await this.getAccessToken()
    }

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to create Google Calendar event: ${error.error?.message || 'Unknown error'}`)
    }

    const result = await response.json()
    return result.id
  }

  static async deleteEvent(eventId: string): Promise<void> {
    const accessToken = await this.getAccessToken()
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok && response.status !== 404) {
      const error = await response.json()
      throw new Error(`Failed to delete Google Calendar event: ${error.error?.message || 'Unknown error'}`)
    }
  }
}