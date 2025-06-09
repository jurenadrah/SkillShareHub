import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import EventCard from '@/app/components/EventCard'
import { supabase } from '@/lib/supabase'
import { GoogleCalendarAPI } from '@/lib/googleCalendar'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}))

jest.mock('@/lib/googleCalendar', () => ({
  GoogleCalendarAPI: {
    checkGoogleConnection: jest.fn(),
    createEvent: jest.fn()
  }
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock data
const mockEvent = {
  id: 1,
  fk_id_uporabnik: {
    ime: 'John',
    priimek: 'Doe'
  },
  day_of_week: 'Monday',
  start_date_time: '2025-06-10T10:00:00Z',
  end_date_time: '2025-06-10T11:00:00Z',
  title: 'Test Event',
  description: 'Test event description',
  lecturer: 'John Doe',
  fk_id_predmet: 1,
  predmet_naziv: 'Mathematics'
}

const mockUser = {
  id: 1,
  email: 'test@example.com'
}

const mockOnJoinSuccess = jest.fn()

// Mock Supabase responses
const mockSupabaseResponse = (data: any, error: any = null) => ({
  data,
  error,
  single: jest.fn().mockResolvedValue({ data, error })
})

describe('EventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Default Supabase mocks
    const mockFrom = jest.fn()
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { tocke: 10 },
            error: null
          })
        })
      }),
      insert: jest.fn().mockReturnValue({
        error: null
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          error: null
        })
      })
    })
    ;(supabase.from as jest.Mock).mockReturnValue(mockFrom())
  })

  describe('Rendering', () => {
    it('renders event card with basic information', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Test event description')).not.toBeVisible() // Should be in modal
      expect(screen.getByText(/Predavatelj:/)).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Mathematics')).toBeInTheDocument()
    })

    it('displays event status correctly for upcoming events', () => {
      const futureEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_date_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
      }

      render(
        <EventCard
          event={futureEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Prihajajoči')).toBeInTheDocument()
    })

    it('displays event status correctly for ended events', () => {
      const pastEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end_date_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }

      render(
        <EventCard
          event={pastEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Končan')).toBeInTheDocument()
      expect(screen.getByText('Dogodek se je končal')).toBeInTheDocument()
    })

    it('displays ongoing status correctly', () => {
      const ongoingEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 minutes ago
        end_date_time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Ends in 30 minutes
      }

      render(
        <EventCard
          event={ongoingEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('V teku')).toBeInTheDocument()
    })
  })

  describe('User Points and Join Button', () => {
    it('displays user points when user is logged in', async () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Vaše točke: 10')).toBeInTheDocument()
      })
    })

    it('shows correct button text for non-joined events', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Pridruži se (5 točk)')).toBeInTheDocument()
    })

    it('shows correct button text for joined events', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={true}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Pridružen')).toBeInTheDocument()
    })

    it('disables join button when user has insufficient points', async () => {
      const mockFromWithLowPoints = jest.fn()
      mockFromWithLowPoints.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { tocke: 3 },
              error: null
            })
          })
        })
      })
      ;(supabase.from as jest.Mock).mockReturnValue(mockFromWithLowPoints())

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Premalo točk (potrebno 5)')).toBeInTheDocument()
      })
    })
  })

  describe('Join Event Functionality', () => {
    it('successfully joins an event', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockUpdate = jest.fn().mockResolvedValue({ error: null })
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { tocke: 10 },
            error: null
          })
        })
      })

      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'UserEvents') {
          return { insert: mockInsert }
        }
        if (table === 'Uporabniki') {
          return {
            select: mockSelect,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue(mockUpdate)
            })
          }
        }
        return {
          select: mockSelect,
          insert: mockInsert,
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue(mockUpdate)
          })
        }
      })
      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([{
          user_id: mockUser.id,
          event_id: mockEvent.id
        }])
        expect(mockOnJoinSuccess).toHaveBeenCalledWith(mockEvent.id)
      })
    })

    it('handles rejoin scenario for ongoing events', async () => {
      mockLocalStorage.getItem.mockReturnValue('true') // Already paid
      
      const ongoingEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        end_date_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      render(
        <EventCard
          event={ongoingEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(screen.getByText('Ponovno se pridruži (brezplačno)')).toBeInTheDocument()
    })

    it('prevents joining when already joined', async () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={true}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinedButton = screen.getByText('Pridružen')
      expect(joinedButton).toBeDisabled()
    })

    it('prevents joining ended events', () => {
      const pastEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        end_date_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }

      render(
        <EventCard
          event={pastEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const endedButton = screen.getByText('Dogodek se je končal')
      expect(endedButton).toBeDisabled()
    })
  })

  describe('Modal Functionality', () => {
    it('opens modal when clicking on event title', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const eventTitle = screen.getByText('Test Event')
      fireEvent.click(eventTitle)

      expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument()
      expect(screen.getByText('Test event description')).toBeInTheDocument()
    })

    it('closes modal when clicking close button', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      // Open modal
      fireEvent.click(screen.getByText('Test Event'))
      expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument()

      // Close modal
      fireEvent.click(screen.getByText('×'))
      expect(screen.queryByText('Podrobnosti dogodka')).not.toBeInTheDocument()
    })

    it('closes modal when pressing Escape key', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      // Open modal
      fireEvent.click(screen.getByText('Test Event'))
      expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument()

      // Press Escape
      fireEvent.keyDown(screen.getByText('Podrobnosti dogodka').closest('[tabindex="-1"]')!, {
        key: 'Escape',
        code: 'Escape'
      })
      
      expect(screen.queryByText('Podrobnosti dogodka')).not.toBeInTheDocument()
    })
  })

  describe('Google Calendar Integration', () => {
    it('syncs with Google Calendar when connected', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            app_metadata: {
              providers: ['google']
            }
          }
        }
      })
      ;(GoogleCalendarAPI.checkGoogleConnection as jest.Mock).mockResolvedValue(true)
      ;(GoogleCalendarAPI.createEvent as jest.Mock).mockResolvedValue('google-event-id')

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      const mockUpdate = jest.fn().mockResolvedValue({ error: null })
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'UserEvents') {
          return {
            insert: mockInsert,
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue(mockUpdate)
              })
            })
          }
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { tocke: 10 },
                error: null
              })
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue(mockUpdate)
          })
        }
      })
      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(GoogleCalendarAPI.createEvent).toHaveBeenCalled()
        expect(screen.getByText(/Dodano v osebni in Google koledar!/)).toBeInTheDocument()
      })
    })

    it('handles Google Calendar sync failure gracefully', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            app_metadata: {
              providers: ['google']
            }
          }
        }
      })
      ;(GoogleCalendarAPI.checkGoogleConnection as jest.Mock).mockResolvedValue(true)
      ;(GoogleCalendarAPI.createEvent as jest.Mock).mockRejectedValue(new Error('Sync failed'))

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(screen.getByText(/ni uspelo sinhronizirati z Google Calendar/)).toBeInTheDocument()
      })
    })
  })

  describe('LocalStorage Integration', () => {
    it('checks localStorage for payment status', () => {
      mockLocalStorage.getItem.mockReturnValue('true')
      
      const ongoingEvent = {
        ...mockEvent,
        start_date_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        end_date_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      render(
        <EventCard
          event={ongoingEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`event_paid_${mockUser.id}_${mockEvent.id}`)
    })

    it('sets payment status in localStorage after successful join', async () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `event_paid_${mockUser.id}_${mockEvent.id}`,
          'true'
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when join fails', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ 
        error: { message: 'Database error' }
      })
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'UserEvents') {
          return { insert: mockInsert }
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { tocke: 10 },
                error: null
              })
            })
          })
        }
      })
      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      await waitFor(() => {
        expect(screen.getByText('Napaka pri dodajanju dogodka')).toBeInTheDocument()
      })
    })

    it('shows loading state during join process', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void
      const mockInsert = jest.fn().mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve
        })
      )
      
      const mockFrom = jest.fn().mockImplementation((table) => {
        if (table === 'UserEvents') {
          return { insert: mockInsert }
        }
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { tocke: 10 },
                error: null
              })
            })
          })
        }
      })
      ;(supabase.from as jest.Mock).mockImplementation(mockFrom)

      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      const joinButton = screen.getByText('Pridruži se (5 točk)')
      fireEvent.click(joinButton)

      // Should show loading state
      expect(screen.getByText('Dodajam...')).toBeInTheDocument()

      // Resolve the promise
      act(() => {
        resolvePromise!({ error: null })
      })

      await waitFor(() => {
        expect(screen.queryByText('Dodajam...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Time Formatting', () => {
    it('formats time correctly in Slovenian locale', () => {
      render(
        <EventCard
          event={mockEvent}
          user={mockUser}
          isJoined={false}
          onJoinSuccess={mockOnJoinSuccess}
        />
      )

      // The exact format depends on the browser's Intl implementation
      // but we can check that some time format is displayed
      expect(screen.getByText(/\d{1,2}:\d{2} - \d{1,2}:\d{2}/)).toBeInTheDocument()
    })
  })
})