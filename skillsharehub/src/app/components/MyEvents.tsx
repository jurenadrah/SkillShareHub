'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    fk_id_uporabnik?: {
      ime: string
      priimek?: string
      zoom_link?: string
    } | null
    predmet?: {
      naziv: string
    }
  }
}

type EventDetail = {
  id: number
  title: string
  description: string
  start_date_time: string
  end_date_time: string
  lecturer: string
  fk_id_uporabnik?: {
    ime: string
    priimek?: string
    zoom_link?: string
  } | null
  predmet?: {
    naziv: string
  }
}

interface MyEventsProps {
  userEvents: UserEvent[]
  onEventRemoved: (userEventId: number) => void
  hasGoogleConnected: boolean
}

export default function MyEvents({ userEvents, onEventRemoved, hasGoogleConnected }: MyEventsProps) {
  const [leavingEvents, setLeavingEvents] = useState(new Set<number>())
  const [messages, setMessages] = useState(new Map<number, { type: 'success' | 'error' | 'info', text: string }>())
  const [eventDetails, setEventDetails] = useState<Map<number, EventDetail>>(new Map())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userPoints, setUserPoints] = useState<number | null>(null)

  // Modal state
  const [modalEvent, setModalEvent] = useState<UserEvent | null>(null)

  // Update current time more frequently for better accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Helperji za marker "že plačano"
  const setAlreadyPaid = (userId: number, eventId: number) => {
    const key = `event_paid_${userId}_${eventId}`
    typeof window !== 'undefined' && localStorage.setItem(key, 'true')
  }
  const clearAlreadyPaid = (userId: number, eventId: number) => {
    const key = `event_paid_${userId}_${eventId}`
    typeof window !== 'undefined' && localStorage.removeItem(key)
  }
  

  // Fetch user points
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('Uporabniki')
          .select('tocke')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          setUserPoints(data.tocke)
        }
      } catch (error) {
        console.error('Error fetching user points:', error)
      }
    }

    fetchUserPoints()
  }, [])

  // Fetch detailed event information for each event
  useEffect(() => {
    const fetchEventDetails = async () => {
      const detailsMap = new Map()
      for (const userEvent of userEvents) {
        try {
          const { data, error } = await supabase
            .from('Event')
            .select(`
              *,
              fk_id_uporabnik:Uporabniki!fk_id_uporabnik (
                ime,
                priimek,
                zoom_link
              )
            `)
            .eq('id', userEvent.event.id)
            .single()
          if (!error && data) {
            detailsMap.set(userEvent.event.id, data)
          }
        } catch (error) {
          console.error('Error fetching event details:', error)
        }
      }
      setEventDetails(detailsMap)
    }
    if (userEvents.length > 0) {
      fetchEventDetails()
    }
  }, [userEvents])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return
    const body = document.body
    if (modalEvent) {
      body.classList.add('overflow-hidden')
    } else {
      body.classList.remove('overflow-hidden')
    }
    return () => {
      body.classList.remove('overflow-hidden')
    }
  }, [modalEvent])

  // Check if event has ended
  const hasEventEnded = (endDateTime: string) => {
    const eventEnd = new Date(endDateTime)
    return currentTime > eventEnd
  }

  // Check if event has started
  const hasEventStarted = (startDateTime: string) => {
    const eventStart = new Date(startDateTime)
    return currentTime >= eventStart
  }

  // Get event status
  const getEventStatus = (startDateTime: string, endDateTime: string) => {
    if (hasEventEnded(endDateTime)) {
      return { status: 'ended', text: 'Končan', color: 'bg-gray-100 text-gray-800' }
    }
    if (hasEventStarted(startDateTime)) {
      return { status: 'ongoing', text: 'V teku', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { status: 'upcoming', text: 'Prihajajoči', color: 'bg-blue-100 text-blue-800' }
  }

  // Check if meeting button should be shown (15 minutes before start time until event ends)
  const shouldShowMeetingButton = (startDateTime: string, endDateTime: string) => {
    const eventStart = new Date(startDateTime)
    const eventEnd = new Date(endDateTime)
    const fifteenMinutesBefore = new Date(eventStart.getTime() - 15 * 60 * 1000)
    return currentTime >= fifteenMinutesBefore && currentTime <= eventEnd
  }

  // Check if points can be refunded (more than 15 minutes before event start)
  const canRefundPoints = (startDateTime: string) => {
    const eventStart = new Date(startDateTime)
    const fifteenMinutesBefore = new Date(eventStart.getTime() - 15 * 60 * 1000)
    return currentTime < fifteenMinutesBefore
  }

  // Get zoom link for the event
  const getZoomLink = (userEvent: UserEvent) => {
    const eventDetail = eventDetails.get(userEvent.event.id)
    return eventDetail?.fk_id_uporabnik?.zoom_link ||
      userEvent.event.fk_id_uporabnik?.zoom_link
  }

  // Refresh Google token
  const refreshGoogleToken = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      return data.session?.provider_token || null
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return null
    }
  }

  // Get valid Google token
  const getValidGoogleToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let accessToken = session?.provider_token
      if (!accessToken) {
        accessToken = await refreshGoogleToken()
        return accessToken
      }
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        if (!response.ok) {
          accessToken = await refreshGoogleToken()
        }
      } catch {
        accessToken = await refreshGoogleToken()
      }
      return accessToken
    } catch (error) {
      console.error('Error getting valid token:', error)
      return null
    }
  }

  // Refund points to user
const refundPoints = async (userId: number, points: number = 5): Promise<boolean> => {
  try {
    // Fetch current points
    const { data: currentUser, error: fetchError } = await supabase
      .from('Uporabniki')
      .select('tocke')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const newPoints = (currentUser.tocke || 0) + points;

    const { error: updateError } = await supabase
      .from('Uporabniki')
      .update({ tocke: newPoints })
      .eq('id', userId);

    if (updateError) throw updateError;

    setUserPoints(newPoints); // Optional: update local state
    return true;
  } catch (error) {
    console.error('Error refunding points:', error);
    return false;
  }
};
  const setMessage = (userEventId: number, message: { type: 'success' | 'error' | 'info', text: string } | null) => {
    setMessages(prev => {
      const newMessages = new Map(prev)
      if (message) {
        newMessages.set(userEventId, message)
      } else {
        newMessages.delete(userEventId)
      }
      return newMessages
    })
    if (message) {
      setTimeout(() => {
        setMessages(prev => {
          const newMessages = new Map(prev)
          newMessages.delete(userEventId)
          return newMessages
        })
      }, 5000)
    }
  }

const handleLeaveEvent = async (userEventId: number, eventId: number, googleEventId: string | null, startDateTime: string) => {
  if (leavingEvents.has(userEventId)) return;
  setLeavingEvents(prev => new Set([...prev, userEventId]));
  setMessage(userEventId, null);

  try {
    // 1. Get the currently authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('User not found');

    // 2. Get the numeric user id from your Uporabniki table using the email
    const { data: dbUser, error: userError } = await supabase
      .from('Uporabniki')
      .select('id, tocke')
      .eq('email', authUser.email)
      .single();

    if (userError || !dbUser) throw new Error('DB user not found');
    const userId = dbUser.id; // This is the int8 database id

    const canRefund = canRefundPoints(startDateTime);
      
      let googleRemovalSuccess = true
      let googleRemovalMessage = ''
      if (googleEventId && hasGoogleConnected) {
        try {
          const accessToken = await getValidGoogleToken()
          if (!accessToken) {
            googleRemovalSuccess = false
            googleRemovalMessage = 'Google povezava ni veljavna - dogodek ostaja v Google Calendar'
          } else {
            await GoogleCalendarAPI.deleteEvent(googleEventId, accessToken)
            googleRemovalMessage = 'Odstranjen iz Google Calendar'
          }
        } catch (googleError) {
          googleRemovalSuccess = false
          // Try to get a new token if unauthorized
          const status = (googleError as { status?: number })?.status
          if (status === 401) {
            try {
              const newToken = await refreshGoogleToken()
              if (newToken) {
                await GoogleCalendarAPI.deleteEvent(googleEventId, newToken)
                googleRemovalSuccess = true
                googleRemovalMessage = 'Odstranjen iz Google Calendar'
              } else {
                googleRemovalMessage = 'Google povezava je potekla - dogodek ostaja v Google Calendar'
              }
            } catch {
              googleRemovalMessage = 'Napaka pri odstranitvi iz Google Calendar'
            }
          } else {
            googleRemovalMessage = 'Napaka pri odstranitvi iz Google Calendar'
          }
        }
      }


    // 3. Remove from UserEvents
    const { error } = await supabase
      .from('UserEvents')
      .delete()
      .eq('id', userEventId);
    if (error) throw error;

    const status = getEventStatus(startDateTime, userEvents.find(ev => ev.id === userEventId)?.event.end_date_time || '')
    if (status.status === 'ongoing') {
      // Če je še v teku, pusti marker!
      setAlreadyPaid(userId, eventId)
    } else {
      // Če ni več v teku, odstrani marker (ni več relevantno)
      clearAlreadyPaid(userId, eventId)
    }

    // 4. Refund points if eligible
    let pointsMessage = '';
    if (canRefund) {
      const pointsRefunded = await refundPoints(userId, 5);
      pointsMessage = pointsRefunded ? ' (+5 točk)' : ' (napaka pri vračanju točk)';
    } else {
      pointsMessage = ' (brez vračila točk - prepozno)';
    }

    onEventRemoved(userEventId);

    setMessage(userEventId, {
      type: 'success',
      text: `Dogodek uspešno odstranjen iz osebnega koledarja${pointsMessage}`
    });

    

      if (googleEventId && hasGoogleConnected) {
        if (googleRemovalSuccess) {
          setMessage(userEventId, {
            type: 'success',
            text: `Dogodek uspešno odstranjen iz osebnega in Google koledarja${pointsMessage}`
          })
        } else {
          setMessage(userEventId, {
            type: 'info',
            text: `Dogodek odstranjen iz osebnega koledarja. ${googleRemovalMessage}${pointsMessage}`
          })
        }
      } else {
        setMessage(userEventId, {
          type: 'success',
          text: `Dogodek uspešno odstranjen iz osebnega koledarja${pointsMessage}`
        })
      }
  } catch (error) {
    console.error('Error leaving event:', error);
    setMessage(userEventId, {
      type: 'error',
      text: 'Napaka pri odstranitvi dogodka'
    });
  } finally {
    setLeavingEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(userEventId);
      return newSet;
    });
  }
};

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

  const closeModal = () => setModalEvent(null)

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
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
    <>
      {/* User Points Display */}
      {userPoints !== null && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-blue-700 font-medium">Vaše točke: {userPoints}</span>
          </div>
        </div>
      )}

      {/* Modal with Framer Motion */}
      <AnimatePresence>
        {modalEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Podrobnosti dogodka
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                  title="Zapri"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(80vh-80px)]">
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Status:</h4>
                    {(() => {
                      const status = getEventStatus(modalEvent.event.start_date_time, modalEvent.event.end_date_time)
                      return (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${status.color}`}>
                          {status.text}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Naslov:</h4>
                    <p className="text-gray-800">{modalEvent.event.title}</p>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Opis:</h4>
                    <p className="text-gray-600 leading-relaxed">{modalEvent.event.description}</p>
                  </div>
                  
                  {/* Lecturer */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Predavatelj:</h4>
                    <p className="text-gray-600">
                      {(() => {
                        const eventDetail = eventDetails.get(modalEvent.event.id)
                        if (eventDetail?.fk_id_uporabnik) {
                          return `${eventDetail.fk_id_uporabnik.ime ?? ''} ${eventDetail.fk_id_uporabnik.priimek ?? ''}`.trim()
                        } else if (modalEvent.event.fk_id_uporabnik) {
                          return `${modalEvent.event.fk_id_uporabnik.ime ?? ''} ${modalEvent.event.fk_id_uporabnik.priimek ?? ''}`.trim()
                        } else {
                          return eventDetail?.lecturer || modalEvent.event.lecturer
                        }
                      })()}
                    </p>
                  </div>
                  
                  {/* Time */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Čas:</h4>
                    <p className="text-gray-600">
                      {formatEventDateTime(modalEvent.event.start_date_time, modalEvent.event.end_date_time).dateStr}
                      <br />
                      {formatEventDateTime(modalEvent.event.start_date_time, modalEvent.event.end_date_time).timeStr}
                    </p>
                  </div>
                  
                  {/* Subject */}
                  {modalEvent.event.predmet && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Predmet:</h4>
                      <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {modalEvent.event.predmet.naziv}
                      </span>
                    </div>
                  )}

                  {/* Points Refund Info */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Vračilo točk:</h4>
                    {canRefundPoints(modalEvent.event.start_date_time) ? (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        Možno (+5 točk)
                      </span>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        Ni možno (prepozno)
                      </span>
                    )}
                  </div>
                  
                  {/* Meeting Button */}
                  {(() => {
                    const zoomLink = getZoomLink(modalEvent)
                    const showMeetingButton = shouldShowMeetingButton(
                      modalEvent.event.start_date_time,
                      modalEvent.event.end_date_time
                    )
                    if (showMeetingButton && zoomLink) {
                      return (
                        <div className="mt-4">
                          <a
                            href={zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            Pridruži se srečanju
                          </a>
                        </div>
                      )
                    }
                    return null
                  })()}
                  
                  {/* Google Sync Status */}
                  <div className="flex items-center">
                    {modalEvent.google_calendar_event_id ? (
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {userEvents.map((userEvent) => {
          const { dateStr, timeStr } = formatEventDateTime(
            userEvent.event.start_date_time,
            userEvent.event.end_date_time
          )
          const isLeaving = leavingEvents.has(userEvent.id)
          const currentMessage = messages.get(userEvent.id)
          const eventDetail = eventDetails.get(userEvent.event.id)
          const zoomLink = getZoomLink(userEvent)
          const showMeetingButton = shouldShowMeetingButton(
            userEvent.event.start_date_time,
            userEvent.event.end_date_time
          )
          const canRefund = canRefundPoints(userEvent.event.start_date_time)
          const eventStatus = getEventStatus(userEvent.event.start_date_time, userEvent.event.end_date_time)

          return (
            <div
              key={userEvent.id}
              className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                hasEventEnded(userEvent.event.end_date_time) ? 'opacity-75' : ''
              }`}
              onClick={() => setModalEvent(userEvent)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-orange-600 hover:underline transition-colors duration-200 select-none flex-1">
                      {userEvent.event.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ml-2 ${eventStatus.color}`}>
                      {eventStatus.text}
                    </span>
                  </div>
                 
                  <p className="text-sm italic text-gray-700 mb-2">
                    <strong>Predavatelj: </strong>
                    {
                      (eventDetail?.fk_id_uporabnik
                        ? `${eventDetail.fk_id_uporabnik.ime ?? ''} ${eventDetail.fk_id_uporabnik.priimek ?? ''}`.trim()
                        : userEvent.event.fk_id_uporabnik
                        ? `${userEvent.event.fk_id_uporabnik.ime ?? ''} ${userEvent.event.fk_id_uporabnik.priimek ?? ''}`.trim()
                        : eventDetail?.lecturer || userEvent.event.lecturer
                      )
                    }
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
                  
                  {/* Points refund indicator */}
                  <div className="mt-2">
                    {canRefund ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Vračilo točk možno
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Brez vračila točk
                      </span>
                    )}
                  </div>

                  {showMeetingButton && zoomLink && (
                    <div className="mt-3">
                      <a
                        href={zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Pridruži se srečanju
                      </a>
                    </div>
                  )}
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
                  {currentMessage && (
                    <div className={`mt-2 text-xs p-2 rounded ${
                      currentMessage.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : currentMessage.type === 'error'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {currentMessage.text}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleLeaveEvent(
                      userEvent.id,
                      userEvent.event.id,
                      userEvent.google_calendar_event_id,
                      userEvent.event.start_date_time
                    )
                  }}
                  disabled={isLeaving}
                  className={`ml-4 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isLeaving
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  title={canRefund ? 'Odstrani in dobi 5 točk nazaj' : 'Odstrani (brez vračila točk)'}
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
    </>
  )
}