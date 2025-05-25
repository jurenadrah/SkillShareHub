'use client'

import { useEffect, useMemo, useState } from 'react'
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import '@schedule-x/theme-default/dist/index.css'
import { motion, AnimatePresence } from 'framer-motion'

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

interface CalendarAppProps {
  userEvents: UserEvent[]
}

function CalendarApp({ userEvents }: CalendarAppProps) {
  const [modalView, setModalView] = useState<'week' | 'day' | null>(null)

  const eventsService = useState(() => createEventsServicePlugin())[0]

  const calendarEvents = useMemo(() => {
    const formatDateTime = (isoString: string) => {
      const date = new Date(isoString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    return userEvents.map((ue) => ({
      id: ue.id.toString(),
      title: ue.event.title,
      start: formatDateTime(ue.event.start_date_time),
      end: formatDateTime(ue.event.end_date_time),
      description: ue.event.description,
    }))
  }, [userEvents])

  const mainCalendar = useNextCalendarApp({
    views: [createViewMonthGrid()],
    events: calendarEvents,
    plugins: [eventsService],
    callbacks: {
      onRender: () => eventsService.getAll(),
    },
  })

  const modalWeekCalendar = useNextCalendarApp({
    views: [createViewWeek()],
    events: calendarEvents,
    plugins: [createEventsServicePlugin()],
  })

  const modalDayCalendar = useNextCalendarApp({
    views: [createViewDay()],
    events: calendarEvents,
    plugins: [createEventsServicePlugin()],
  })

  useEffect(() => {
    eventsService.set(calendarEvents)
  }, [calendarEvents, eventsService])

  const closeModal = () => setModalView(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
  }

  return (
    <div className="w-full">
      {/* View Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setModalView('week')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Tedenski pogled
        </button>
        <button
          onClick={() => setModalView('day')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Dnevni pogled
        </button>
      </div>

      {/* Main Calendar */}
      <div className="calendar-main">
        <ScheduleXCalendar calendarApp={mainCalendar} />
      </div>

      {/* Modal with Framer Motion */}
      <AnimatePresence>
        {modalView && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/10 backdrop-blur-lg"
            onClick={closeModal}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="text-lg font-semibold">
                  {modalView === 'week' ? 'Tedenski pogled' : 'Dnevni pogled'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Zapri"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] calendar-modal">
                {modalView === 'week' && (
                  <ScheduleXCalendar calendarApp={modalWeekCalendar} />
                )}
                {modalView === 'day' && (
                  <ScheduleXCalendar calendarApp={modalDayCalendar} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .calendar-main .sx-react-calendar-wrapper {
          height: 500px;
        }
        .calendar-modal .sx-react-calendar-wrapper {
          height: 600px;
        }
      `}</style>
    </div>
  )
}

export default CalendarApp
