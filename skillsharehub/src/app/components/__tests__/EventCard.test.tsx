import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EventCard from '../EventCard'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { tocke: 10 }, error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => Promise.resolve({ error: null }))
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { app_metadata: { providers: ['google'] } } }
      }))
    }
  }
}))

jest.mock('@/lib/googleCalendar', () => ({
  GoogleCalendarAPI: {
    checkGoogleConnection: jest.fn(() => Promise.resolve(true)),
    createEvent: jest.fn(() => Promise.resolve('google-event-id'))
  }
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('EventCard', () => {
  const mockEvent = {
    id: 1,
    fk_id_uporabnik: {
      ime: 'Janez',
      priimek: 'Novak'
    },
    day_of_week: 'Monday',
    start_date_time: '2025-06-15T10:00:00',
    end_date_time: '2025-06-15T11:00:00',
    title: 'Test Event',
    description: 'Test event description',
    lecturer: 'Test Lecturer',
    fk_id_predmet: 1,
    predmet_naziv: 'Test Subject'
  }

  const mockUser = {
    id: 1,
    email: 'test@example.com'
  }

  const mockProps = {
    event: mockEvent,
    user: mockUser,
    isJoined: false,
    onJoinSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    localStorageMock.getItem.mockReturnValue(null)
  })
  
  afterEach(() => {
    (console.error as jest.Mock).mockRestore()
  })

  test('renders event card with basic information', () => {
    render(<EventCard {...mockProps} />)
    
    expect(screen.getByText('Test Event')).toBeInTheDocument()
    expect(screen.getByText(/Predavatelj:/)).toBeInTheDocument()
    expect(screen.getByText('Janez Novak')).toBeInTheDocument()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    expect(screen.getByText('Prihajajoči')).toBeInTheDocument()
  })

  test('shows "Pridružen" when user is already joined', () => {
    render(<EventCard {...mockProps} isJoined={true} />)
    
    expect(screen.getByText('Pridružen')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('shows "Pridruži se (5 točk)" when user can join', async () => {
    render(<EventCard {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Pridruži se (5 točk)')).toBeInTheDocument()
    })
  })

  test('shows insufficient points message when user has less than 5 points', async () => {
    // Mock supabase to return user with 3 points
    const { supabase } = require('@/lib/supabase')
    supabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { tocke: 3 }, error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
      update: jest.fn(() => Promise.resolve({ error: null }))
    })

    render(<EventCard {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Premalo točk (potrebno 5)')).toBeInTheDocument()
    })
  })

  test('shows ended status for past events', () => {
    const pastEvent = {
      ...mockEvent,
      start_date_time: '2025-06-01T10:00:00',
      end_date_time: '2025-06-01T11:00:00'
    }

    render(<EventCard {...mockProps} event={pastEvent} />)
    
    expect(screen.getByText('Končan')).toBeInTheDocument()
    expect(screen.getByText('Dogodek se je končal')).toBeInTheDocument()
  })

  test('shows rejoin option for ongoing events that were already paid', () => {
    const ongoingEvent = {
      ...mockEvent,
      start_date_time: '2025-06-11T09:00:00',
      end_date_time: '2025-06-11T23:00:00'
    }

    // Mock localStorage to return that event was already paid
    localStorageMock.getItem.mockReturnValue('true')

    render(<EventCard {...mockProps} event={ongoingEvent} />)
    
    expect(screen.getByText('V teku')).toBeInTheDocument()
    expect(screen.getByText('Ponovno se pridruži (brezplačno)')).toBeInTheDocument()
  })

  test('opens modal when clicking on event title', () => {
    render(<EventCard {...mockProps} />)
    
    fireEvent.click(screen.getByText('Test Event'))
    
    expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument()
    expect(screen.getByText('Test event description')).toBeInTheDocument()
  })

  test('closes modal when clicking close button', () => {
    render(<EventCard {...mockProps} />)
    
    // Open modal
    fireEvent.click(screen.getByText('Test Event'))
    expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument()
    
    // Close modal
    fireEvent.click(screen.getByText('×'))
    expect(screen.queryByText('Podrobnosti dogodka')).not.toBeInTheDocument()
  })

  test('displays correct time format', () => {
    render(<EventCard {...mockProps} />)
    
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
  })

  test('handles user without points gracefully', () => {
    render(<EventCard {...mockProps} user={null} />)
    
    expect(screen.queryByText('Pridruži se (5 točk)')).not.toBeInTheDocument()
    expect(screen.queryByText(/Vaše točke:/)).not.toBeInTheDocument()
  })

  test('displays lecturer name fallback when user data is not available', () => {
    const eventWithoutUser = {
      ...mockEvent,
      fk_id_uporabnik: null
    }

    render(<EventCard {...mockProps} event={eventWithoutUser} />)
    
    expect(screen.getByText('Test Lecturer')).toBeInTheDocument()
  })

  test('disables join button while processing', async () => {
    const { supabase } = require('@/lib/supabase')
    
    // Mock slow database response
    const mockInsert = jest.fn(() => new Promise(resolve => 
      setTimeout(() => resolve({ error: null }), 1000)
    ))
    const mockSelect = jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { tocke: 10 }, error: null }))
      }))
    }))
    
    supabase.from.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: jest.fn(() => Promise.resolve({ error: null }))
    })

    render(<EventCard {...mockProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('Pridruži se (5 točk)')).toBeInTheDocument()
    })

    const joinButton = screen.getByText('Pridruži se (5 točk)')
    fireEvent.click(joinButton)

    // Check if button shows loading state
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })
})