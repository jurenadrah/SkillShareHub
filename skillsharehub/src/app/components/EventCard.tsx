'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [showModal, setShowModal] = useState(false)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  
// Helper: preveri v localStorage, ali je uporabnik že plačal za ta dogodek
const checkIfAlreadyPaid = () => {
  if (!user) return false
  const key = `event_paid_${user.id}_${event.id}`
  return localStorage.getItem(key) === 'true'
}

// Ob prijavi shrani
const setAlreadyPaid = () => {
  if (!user) return
  const key = `event_paid_${user.id}_${event.id}`
  localStorage.setItem(key, 'true')
}

// Ob izbrisu (leave) - če je "V teku", pusti v localStorage!
const clearAlreadyPaid = () => {
  if (!user) return
  const key = `event_paid_${user.id}_${event.id}`
  localStorage.removeItem(key)
}

  // Update current time every minute for better accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const body = document.body;

    if (showModal) {
      body.classList.add('overflow-hidden');
    } else {
      body.classList.remove('overflow-hidden');
    }

    return () => {
      body.classList.remove('overflow-hidden');
    };
  }, [showModal]);

  // Fetch user points when component mounts
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return
      
      try {
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
  }, [user])

  // Check if event has ended
  const hasEventEnded = () => {
    const eventEnd = new Date(event.end_date_time)
    return currentTime > eventEnd
  }

  // Check if event has started
  const hasEventStarted = () => {
    const eventStart = new Date(event.start_date_time)
    return currentTime >= eventStart
  }

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

  // Deduct points from user
  const deductPoints = async (userId: number, points: number = 5): Promise<boolean> => {
    try {
      const { data: currentUser, error: fetchError } = await supabase
        .from('Uporabniki')
        .select('tocke')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      const newPoints = Math.max(0, (currentUser.tocke || 0) - points)

      const { error: updateError } = await supabase
        .from('Uporabniki')
        .update({ tocke: newPoints })
        .eq('id', userId)

      if (updateError) throw updateError

      setUserPoints(newPoints)
      return true
    } catch (error) {
      console.error('Error deducting points:', error)
      return false
    }
  }

  // Get event status
  const getEventStatus = () => {
    if (hasEventEnded()) {
      return { status: 'ended', text: 'Končan', color: 'bg-gray-100 text-gray-800' }
    }
    if (hasEventStarted()) {
      return { status: 'ongoing', text: 'V teku', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { status: 'upcoming', text: 'Prihajajoči', color: 'bg-blue-100 text-blue-800' }
  }

  const eventStatus = getEventStatus()

  // Check if this is a rejoin scenario (ongoing event, already paid, not currently joined)
  const isRejoinScenario = () => {
    return !isJoined && eventStatus.status === 'ongoing' && checkIfAlreadyPaid()
  }

  // Get button configuration based on current state
  const getButtonConfig = () => {
    if (isJoined) {
      return {
        text: (
          <div className="flex items-center justify-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Pridružen
          </div>
        ),
        className: 'bg-green-100 text-green-700 border border-green-300 cursor-default',
        disabled: true
      }
    }

    if (isJoining) {
      return {
        text: (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
            Dodajam...
          </div>
        ),
        className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
        disabled: true
      }
    }

    if (hasEventEnded()) {
      return {
        text: 'Dogodek se je končal',
        className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
        disabled: true
      }
    }

    if (isRejoinScenario()) {
      return {
        text: 'Ponovno se pridruži (brezplačno)',
        className: 'bg-blue-500 text-white hover:bg-blue-600',
        disabled: false
      }
    }

    if (userPoints !== null && userPoints < 5) {
      return {
        text: 'Premalo točk (potrebno 5)',
        className: 'bg-gray-100 text-gray-500 cursor-not-allowed',
        disabled: true
      }
    }

    return {
      text: 'Pridruži se (5 točk)',
      className: 'bg-orange-500 text-white hover:bg-orange-600',
      disabled: false
    }
  }

const handleJoinEvent = async () => {
  if (!user || isJoining) return

  setIsJoining(true)
  setMessage(null)

  try {
    if (isJoined) {
      setMessage({ type: 'info', text: 'Že ste pridruženi temu dogodku' })
      return
    }

    if (hasEventEnded()) {
      setMessage({ type: 'error', text: 'Ta dogodek se je že končal' })
      return
    }

    // *** KLJUČNA LOGIKA ***
    let skipPointsDeduction = false
    if (checkIfAlreadyPaid() && eventStatus.status === 'ongoing') {
      skipPointsDeduction = true
    }

    if (!skipPointsDeduction) {
      if (userPoints !== null && userPoints < 5) {
        setMessage({ type: 'error', text: 'Nimate dovolj točk za pridružitev dogodku (potrebno je 5 točk)' })
        return
      }
      const pointsDeducted = await deductPoints(user.id, 5)
      if (!pointsDeducted) {
        setMessage({ type: 'error', text: 'Napaka pri odštevanju točk' })
        return
      }
    }

    // VSTAVI v UserEvents
    const { error: insertError } = await supabase
      .from('UserEvents')
      .insert([{
        user_id: user.id,
        event_id: event.id
      }])

    if (insertError) {
      if (!skipPointsDeduction) {
        // Če je šlo kaj narobe, vrni točke ...
        await supabase
          .from('Uporabniki')
          .update({ tocke: userPoints })
          .eq('id', user.id)
        setUserPoints(userPoints)
      }
      throw insertError
    }

    if (!skipPointsDeduction) {
      setAlreadyPaid() // Označi kot plačano samo če je bilo plačano
    }

      // Try to sync with Google Calendar if connected
      let googleEventId = null
      let syncMessage = skipPointsDeduction 
        ? 'Ponovno dodano v osebni koledar!' 
        : 'Dodano v osebni koledar! (-5 točk)'

      try {
        const hasGoogleConnected = await checkGoogleConnection()
        
        if (hasGoogleConnected) {
          googleEventId = await syncWithGoogleCalendar(event)
          syncMessage = skipPointsDeduction 
            ? 'Ponovno dodano v osebni in Google koledar!' 
            : 'Dodano v osebni in Google koledar! (-5 točk)'
        }
      } catch (googleError: any) {
        console.error('Google Calendar sync failed:', googleError)
        
        if (googleError.message === 'GOOGLE_AUTH_EXPIRED' || googleError.message === 'GOOGLE_NOT_CONNECTED') {
          syncMessage = skipPointsDeduction 
            ? 'Ponovno dodano lokalno. Google povezava je potekla - prosimo, ponovno se povežite z Google računom.'
            : 'Dodano lokalno. Google povezava je potekla - prosimo, ponovno se povežite z Google računom. (-5 točk)'
          setMessage({ type: 'error', text: syncMessage })
        } else if (googleError.message === 'GOOGLE_REFRESH_TOKEN_MISSING') {
          syncMessage = skipPointsDeduction 
            ? 'Ponovno dodano lokalno. Za Google sinhronizacijo se prosimo ponovno povežite z Google računom.'
            : 'Dodano lokalno. Za Google sinhronizacijo se prosimo ponovno povežite z Google računom. (-5 točk)'
          setMessage({ type: 'error', text: syncMessage })
        } else {
          syncMessage = skipPointsDeduction 
            ? 'Ponovno dodano v osebni koledar, vendar ni uspelo sinhronizirati z Google Calendar'
            : 'Dodano v osebni koledar, vendar ni uspelo sinhronizirati z Google Calendar (-5 točk)'
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

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <>
      <div className={`mb-3 bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow ${
        hasEventEnded() ? 'border-gray-400 opacity-75' : 'border-orange-400'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <p 
            className="font-semibold text-gray-800 mb-1 cursor-pointer hover:text-orange-600 hover:underline transition-colors duration-200 select-none flex-1"
            onClick={openModal}
            title="Kliknite za prikaz podrobnosti"
          >
            {event.title}
          </p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ml-2 ${eventStatus.color}`}>
            {eventStatus.text}
          </span>
        </div>
      
        <div className="text-sm italic text-gray-700 mb-2">
          <p className="text-sm italic text-gray-700 mb-2 flex flex-wrap gap-x-1">
            <span className="font-medium whitespace-nowrap">Predavatelj:</span>
            <span className="whitespace-normal break-words">
              {
                (eventDetails?.fk_id_uporabnik
                  ? `${eventDetails.fk_id_uporabnik.ime ?? ''} ${eventDetails.fk_id_uporabnik.priimek ?? ''}`.trim()
                  : event.fk_id_uporabnik
                  ? `${event.fk_id_uporabnik.ime ?? ''} ${event.fk_id_uporabnik.priimek ?? ''}`.trim()
                  : eventDetails?.lecturer || event.lecturer
                )
              }
            </span>
          </p>
        </div>
        
        <div className="flex flex-col justify-between items-center mb-3">
          {event.predmet_naziv && (
            <span className="text-xs bg-orange-100 px-2 py-1 rounded">
              {event.predmet_naziv}
            </span>
          )}
          <div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {formatTime(event.start_date_time)} - {formatTime(event.end_date_time)}
            </span>
          </div>
        </div>

        {/* User Points Display */}
        {user && userPoints !== null && (
          <div className="mb-2 text-xs text-gray-600">
            Vaše točke: {userPoints}
          </div>
        )}

        {/* Join/Joined Button */}
        {user && (
          <div className="space-y-2">
            <button
              onClick={handleJoinEvent}
              disabled={buttonConfig.disabled}
              className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${buttonConfig.className}`}
            >
              {buttonConfig.text}
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

      {/* Modal with Framer Motion */}
      <AnimatePresence>
        {showModal && (
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
              onClick={(e) => e.stopPropagation()}
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
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${eventStatus.color}`}>
                      {eventStatus.text}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Naslov:</h4>
                    <p className="text-gray-800">{event.title}</p>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Opis:</h4>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                  
                  {/* Lecturer */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Predavatelj:</h4>
                    <p className="text-gray-600">
                      {eventDetails?.fk_id_uporabnik
                        ? `${eventDetails.fk_id_uporabnik.ime ?? ''} ${eventDetails.fk_id_uporabnik.priimek ?? ''}`.trim()
                        : event.fk_id_uporabnik
                        ? `${event.fk_id_uporabnik.ime ?? ''} ${event.fk_id_uporabnik.priimek ?? ''}`.trim()
                        : eventDetails?.lecturer || event.lecturer
                      }
                    </p>
                  </div>
                  
                  {/* Time */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Čas:</h4>
                    <p className="text-gray-600">
                      {formatTime(event.start_date_time)} - {formatTime(event.end_date_time)}
                    </p>
                  </div>
                  
                  {/* Subject */}
                  {event.predmet_naziv && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Predmet:</h4>
                      <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {event.predmet_naziv}
                      </span>
                    </div>
                  )}

                  {/* Points Cost */}
                  {!hasEventEnded() && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Cena:</h4>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        isRejoinScenario() 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {isRejoinScenario() ? 'Brezplačno (že plačano)' : '5 točk'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Join Button in Modal */}
                {user && !hasEventEnded() && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    {userPoints !== null && (
                      <div className="mb-3 text-sm text-gray-600">
                        Vaše točke: {userPoints}
                      </div>
                    )}
                    <button
                      onClick={handleJoinEvent}
                      disabled={buttonConfig.disabled}
                      className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${buttonConfig.className}`}
                    >
                      {buttonConfig.text}
                    </button>
                    
                    {/* Message in Modal */}
                    {message && (
                      <div className={`mt-3 text-xs p-3 rounded ${
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

                {/* Event ended message */}
                {hasEventEnded() && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-center text-gray-500">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Ta dogodek se je že končal</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}