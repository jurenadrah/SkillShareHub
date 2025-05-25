'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GoogleCalendarAPI } from '@/lib/googleCalendar'

type UserEvent = {
  id: number
  event_id: number
  google_calendar_event_id: string | null
  created_at: string
  event: {
    id: number
    title: string
    description: string
    start_date_time: string
    end_date_time: string
    lecturer: string
    predmet?: {
      naziv: string
    }
  }
}

interface MyEventsProps {
  userEvents: UserEvent[]
  onEventRemoved: (userEventId: number) => void
  hasGoogleConnected: boolean
}

export default function MyEvents({ userEvents, onEventRemoved, hasGoogleConnected }: MyEventsProps) {
  const [leavingEvents, setLeavingEvents] = useState(new Set<number>())

  const handleLeaveEvent = async (userEventId: number, eventId: number, googleEventId: string | null) => {
    if (leavingEvents.has(userEventId)) return

    setLeavingEvents(prev => new Set([...prev, userEventId]))
    
    try {
      // Remove from Google Calendar if synced
      if (googleEventId && hasGoogleConnected) {
        try {
          await GoogleCalendarAPI.deleteEvent(googleEventId)
        } catch (googleError) {
          console.warn('Failed to remove from Google Calendar:', googleError)
          // Continue with local removal even if Google sync fails
        }
      }

      // Remove from UserEvents table
      const { error } = await supabase
        .from('UserEvents')
        .delete()
        .eq('id', userEventId)

      if (error) throw error

      // Notify parent component
      onEventRemoved(userEventId)

    } catch (error) {
      console.error('Error leaving event:', error)
    } finally {
      setLeavingEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(userEventId)
        return newSet
      })
    }
  }

  const formatEventDateTime = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime)
    const end = new Date(endDateTime)
    
    const dateStr = start.toLocaleDateString('sl-SI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeStr = `${start.toLocaleTimeString('sl-SI', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString('sl-SI', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
    
    return { dateStr, timeStr }
  }

  if (userEvents.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Ni dogodkov</h3>
        <p className="mt-1 text-sm text-gray-500">
          Pojdite na glavno stran in se pridružite dogodkom.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Ogled urnika
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {userEvents.map((userEvent) => {
        const { dateStr, timeStr } = formatEventDateTime(
          userEvent.event.start_date_time,
          userEvent.event.end_date_time
        )
        const isLeaving = leavingEvents.has(userEvent.id)
        
        return (
          <div
            key={userEvent.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {userEvent.event.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {userEvent.event.description}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Predavatelj:</strong> {userEvent.event.lecturer}
                </p>
                {userEvent.event.predmet && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Predmet:</strong> {userEvent.event.predmet.naziv}
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>{dateStr}</p>
                  <p>{timeStr}</p>
                </div>
                
                {/* Google Calendar sync status */}
                <div className="flex items-center mt-2">
                  {userEvent.google_calendar_event_id ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sinhroniziran z Google
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      Samo lokalno
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleLeaveEvent(
                  userEvent.id, 
                  userEvent.event.id, 
                  userEvent.google_calendar_event_id
                )}
                disabled={isLeaving}
                className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                  isLeaving
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {isLeaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500 mr-1"></div>
                    Odstranjujem...
                  </div>
                ) : (
                  'Odstrani'
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}