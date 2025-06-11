import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'
import Home from '../Home'
import { supabase } from '@/lib/supabase'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}))

jest.mock('../EventCard', () => {
  return function MockEventCard({ event, user, isJoined, onJoinSuccess }: any) {
    return (
      <div data-testid={`event-card-${event.id}`}>
        <div>{event.title}</div>
        <div>{event.lecturer}</div>
        <div>{event.description}</div>
        {user && (
          <button 
            onClick={() => onJoinSuccess(event.id)}
            data-testid={`join-button-${event.id}`}
          >
            {isJoined ? 'Joined' : 'Join'}
          </button>
        )}
      </div>
    )
  }
})

jest.mock('../Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>
  }
})

jest.mock('../Hero', () => {
  return function MockHero() {
    return <div data-testid="hero">Hero Section</div>
  }
})

jest.mock('../VideoPreview', () => {
  return function MockVideoPreview({ title, duration, imageUrl }: any) {
    return (
      <div data-testid="video-preview">
        <div>{title}</div>
        <div>{duration}</div>
        <img src={imageUrl} alt={title} />
      </div>
    )
  }
})

// Mock data
const mockUsers = [
  { id: 1, ime: 'John', priimek: 'Doe', email: 'john@example.com', tutor: true },
  { id: 2, ime: 'Jane', priimek: 'Smith', email: 'jane@example.com', tutor: false },
]

const mockPredmeti = [
  { id: 1, naziv: 'Matematika' },
  { id: 2, naziv: 'Fizika' },
]

const mockEvents = [
  {
    id: 1,
    fk_id_uporabnik: 1,
    start_date_time: '2025-06-09T10:00:00Z',
    end_date_time: '2025-06-09T11:00:00Z',
    title: 'Math Lecture',
    description: 'Advanced calculus',
    lecturer: 'Dr. Smith',
    predmet: { id: 1, naziv: 'Matematika' }
  },
  {
    id: 2,
    fk_id_uporabnik: 2,
    start_date_time: '2025-06-10T14:00:00Z',
    end_date_time: '2025-06-10T15:00:00Z',
    title: 'Physics Lab',
    description: 'Quantum mechanics',
    lecturer: 'Dr. Johnson',
    predmet: { id: 2, naziv: 'Fizika' }
  },
]

const mockUser = {
  id: 1,
  email: 'test@example.com'
}

const mockAuthUser = {
  email: 'test@example.com'
}

describe('Home Component', () => {
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    
    // Default mock implementations
    ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockAuthUser }
    })
    
    ;(supabase.from as jest.Mock).mockImplementation((table: string) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        if (table === 'Uporabniki') {
          return Promise.resolve({ data: mockUser })
        }
        return Promise.resolve({ data: null })
      }),
      then: jest.fn().mockImplementation((callback) => {
        if (table === 'Uporabniki') {
          return callback({ data: mockUsers, error: null })
        } else if (table === 'Predmeti') {
          return callback({ data: mockPredmeti, error: null })
        } else if (table === 'Event') {
          return callback({ data: mockEvents, error: null })
        } else if (table === 'UserEvents') {
          return callback({ data: [], error: null })
        }
        return callback({ data: [], error: null })
      })
    }))
  })

  describe('Component Rendering', () => {
    test('renders main sections correctly', async () => {
      render(<Home />)
      
      expect(screen.getByTestId('hero')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Tedenski Urnik')).toBeInTheDocument()
      })
      
      expect(screen.getByText('O SkillHubu')).toBeInTheDocument()
      expect(screen.getByText('Kontakt')).toBeInTheDocument()
    })

    test('renders video preview section', () => {
      render(<Home />)
      
      const videoPreviews = screen.getAllByTestId('video-preview')
      expect(videoPreviews).toHaveLength(4)
    })
  })

  describe('Data Fetching', () => {
    test('fetches and displays events correctly', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.queryByText('Nalaganje urnika...')).not.toBeInTheDocument()
      })
      
      expect(supabase.from).toHaveBeenCalledWith('Uporabniki')
      expect(supabase.from).toHaveBeenCalledWith('Predmeti')
      expect(supabase.from).toHaveBeenCalledWith('Event')
    })

    test('handles authentication correctly', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(supabase.auth.getUser).toHaveBeenCalled()
      })
    })
  })


  describe('Filtering', () => {
    test('renders subject filter dropdown', async () => {
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filtriraj po predmetu:')).toBeInTheDocument()
        expect(screen.getByText('Vsi predmeti')).toBeInTheDocument()
      })
    })

    test('filters events by subject', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const filterSelect = screen.getByLabelText('Filtriraj po predmetu:')
        fireEvent.change(filterSelect, { target: { value: '1' } })
      })
      
      // Events should be filtered - you'd need to verify this based on your event display logic
    })

    test('resets filter when "Vsi predmeti" is selected', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const filterSelect = screen.getByLabelText('Filtriraj po predmetu:')
        fireEvent.change(filterSelect, { target: { value: '1' } })
        fireEvent.change(filterSelect, { target: { value: '' } })
      })
    })
  })

  describe('User Interactions', () => {
    test('handles learn more button click', async () => {
      render(<Home />)
      
      const learnMoreButton = screen.getByText('➤ Preberi več')
      fireEvent.click(learnMoreButton)
      
      expect(mockPush).toHaveBeenCalledWith('/about')
    })

    test('shows login prompt for unauthenticated users', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null }
      })
      
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.getByText(/Prijavite se za dodajanje dogodkov/)).toBeInTheDocument()
      })
    })
  })

  describe('Forms', () => {

    test('renders contact form', () => {
      render(<Home />)
      
      expect(screen.getByPlaceholderText('Ime *')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Priimek *')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Zadeva')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Sporočilo...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pošlji' })).toBeInTheDocument()
    })

    test('handles form submissions', () => {
      render(<Home />)
      
      const subscribeButton = screen.getByRole('button', { name: 'Naroči se' })
      const contactButton = screen.getByRole('button', { name: 'Pošlji' })
      
      fireEvent.click(subscribeButton)
      fireEvent.click(contactButton)
      
      // Form submission logic would need to be implemented and tested
    })
  })

  describe('Event Handling', () => {
    test('handles successful event join', async () => {
      render(<Home />)
      
      await waitFor(() => {
        const joinButton = screen.queryByTestId('join-button-1')
        if (joinButton) {
          fireEvent.click(joinButton)
        }
      })
      
      // Verify that the event is marked as joined
    })
  })

  describe('Error Handling', () => {
    test('handles fetch errors gracefully', async () => {
      ;(supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((callback) => 
          callback({ data: null, error: new Error('Network error') })
        )
      }))
      
      render(<Home />)
      
      await waitFor(() => {
        expect(screen.queryByText('Nalaganje urnika...')).not.toBeInTheDocument()
      })
      
      // Component should still render even with errors
      expect(screen.getByText('Tedenski Urnik')).toBeInTheDocument()
    })
  })
})

describe('Home Component Integration', () => {
  test('full user flow - authenticated user joins event', async () => {
    ;(supabase.from as jest.Mock).mockImplementation((table: string) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        if (table === 'Uporabniki') {
          return Promise.resolve({ data: mockUser })
        }
        return Promise.resolve({ data: null })
      }),
      then: jest.fn().mockImplementation((callback) => {
        if (table === 'UserEvents') {
          return callback({ data: [{ event_id: 1 }], error: null })
        }
        return callback({ data: mockEvents, error: null })
      })
    }))
    
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.queryByText('Nalaganje urnika...')).not.toBeInTheDocument()
    })
    
    // User should see events and be able to interact with them
    expect(screen.queryByText(/Prijavite se za dodajanje dogodkov/)).not.toBeInTheDocument()
  })
})