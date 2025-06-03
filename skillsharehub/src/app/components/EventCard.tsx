'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GoogleCalendarAPI } from '@/lib/googleCalendar'

type Event = {
  id: number
  fk_id_uporabnik: {
    ime: string
    priimek?: string
  } | null
  day_of_week: string
  start_date_time: string
  end_date_time: string
  title: string
  description: string
  lecturer: string
  fk_id_predmet?: number
  predmet_naziv?: string
}

type User = {
  id: number
  email: string
}

interface EventCardProps {
  event: Event
  user: User | null
  isJoined: boolean
  onJoinSuccess: (eventId: number) => void
}

export default function EventCard({ event, user, isJoined, onJoinSuccess }: EventCardProps) {
  const [isJoining, setIsJoining] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('sl-SI', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const [eventDetails, setEventDetails] = useState<Event | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('Event')
        .select(`
          *,
          fk_id_uporabnik (
            ime,
            priimek
          )
        `)
        .eq('id', event.id)
        .single()
      if (!error) setEventDetails(data)
    }
    fetchEvent()
  }, [event.id])

  // Check if user has Google connected
  const checkGoogleConnection = async (): Promise<boolean> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const hasGoogleProvider = authUser?.app_metadata?.providers?.includes('google') || false
      
      if (!hasGoogleProvider) return false
      
      // Check if we have valid tokens
      return await GoogleCalendarAPI.checkGoogleConnection()
    } catch (error) {
      return false
    }
  }

  // Sync with Google Calendar
  const syncWithGoogleCalendar = async (event: Event): Promise<string> => {
    const googleEvent = {
      summary: event.title,
      description: `${event.description}\n\nPredavatelj: ${event.lecturer}`,
      start: {
        dateTime: event.start_date_time,
        timeZone: 'Europe/Ljubljana'
      },
      end: {
        dateTime: event.end_date_time,
        timeZone: 'Europe/Ljubljana'
      },
      source: {
        title: 'SkillShareHub',
        url: window.location.origin
      }
    }

    console.log('Attempting Google Calendar sync', { event })
    return await GoogleCalendarAPI.createEvent(googleEvent)
  }

  const handleJoinEvent = async () => {
    if (!user || isJoining) return

    setIsJoining(true)
    setMessage(null)
    
    try {
      // Check if already joined
      if (isJoined) {
        setMessage({ type: 'info', text: 'Že ste pridruženi temu dogodku' })
        return
      }

      // Insert into UserEvents table first
      const { error: insertError } = await supabase
        .from('UserEvents')
        .insert([{
          user_id: user.id,
          event_id: event.id
        }])

      if (insertError) throw insertError

      // Try to sync with Google Calendar if connected
      let googleEventId = null
      let syncMessage = 'Dodano v osebni koledar!'

      try {
        const hasGoogleConnected = await checkGoogleConnection()
        
        if (hasGoogleConnected) {
          googleEventId = await syncWithGoogleCalendar(event)
          syncMessage = 'Dodano v osebni in Google koledar!'
        }
      } catch (googleError: any) {
        console.error('Google Calendar sync failed:', googleError)
        
        if (googleError.message === 'GOOGLE_AUTH_EXPIRED' || googleError.message === 'GOOGLE_NOT_CONNECTED') {
          syncMessage = 'Dodano lokalno. Google povezava je potekla - prosimo, ponovno se povežite z Google računom.'
          setMessage({ type: 'error', text: syncMessage })
        } else if (googleError.message === 'GOOGLE_REFRESH_TOKEN_MISSING') {
          syncMessage = 'Dodano lokalno. Za Google sinhronizacijo se prosimo ponovno povežite z Google računom.'
          setMessage({ type: 'error', text: syncMessage })
        } else {
          syncMessage = 'Dodano v osebni koledar, vendar ni uspelo sinhronizirati z Google Calendar'
          setMessage({ type: 'info', text: syncMessage })
        }
      }

      // Update Google Calendar event ID if successful
      if (googleEventId) {
        await supabase
          .from('UserEvents')
          .update({ google_calendar_event_id: googleEventId })
          .eq('user_id', user.id)
          .eq('event_id', event.id)
      }

      // Notify parent component
      onJoinSuccess(event.id)
      
      if (!message) {
        setMessage({ type: 'success', text: syncMessage })
      }

    } catch (error) {
      console.error('Error joining event:', error)
      setMessage({ type: 'error', text: 'Napaka pri dodajanju dogodka' })
    } finally {
      setIsJoining(false)

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
  }

  return (
    <div className="mb-3 bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-shadow">
      <p className="font-semibold text-gray-800 mb-1" title={event.description}>
        {event.title}
      </p>
      {/*<p className="text-sm text-gray-600 mb-2">{event.description}</p>*/}
      <div className="text-sm italic text-gray-700 mb-2">
        <p className="text-sm italic text-gray-700 mb-2">
          Predavatelj: <br />
          {
            (eventDetails?.fk_id_uporabnik
              ? `${eventDetails.fk_id_uporabnik.ime ?? ''} ${eventDetails.fk_id_uporabnik.priimek ?? ''}`.trim()
              : event.fk_id_uporabnik
              ? `${event.fk_id_uporabnik.ime ?? ''} ${event.fk_id_uporabnik.priimek ?? ''}`.trim()
              : eventDetails?.lecturer || event.lecturer
            )
          }        
          </p>
      </div>
      
      <div className="flex flex-col justify-between items-center mb-3">
        <div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {formatTime(event.start_date_time)} - {formatTime(event.end_date_time)}
          </span>
        </div>
        {event.predmet_naziv && (
          <span className="text-xs bg-orange-100 px-2 py-1 rounded">
            {event.predmet_naziv}
          </span>
        )}
      </div>

      {/* Join/Joined Button */}
      {user && (
        <div className="space-y-2">
          <button
            onClick={handleJoinEvent}
            disabled={isJoining || isJoined}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
              isJoined
                ? 'bg-green-100 text-green-700 border border-green-300 cursor-default'
                : isJoining
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                Dodajam...
              </div>
            ) : isJoined ? (
              <div className="flex items-center justify-center">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pridružen
              </div>
            ) : (
              'Pridruži se'
            )}
          </button>
          
          {/* Message */}
          {message && (
            <div className={`text-xs p-2 rounded ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      )}
    </div>
  )
}