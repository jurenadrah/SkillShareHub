import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StudentProfile from '../StudentProfile'
import { supabase } from '@/lib/supabase'
import { GoogleCalendarAPI } from '@/lib/googleCalendar'
import type { User } from '@supabase/supabase-js'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            // For chained queries
          })),
        })),
        order: jest.fn(() => ({
          // For direct order queries
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}))

// Mock Google Calendar API
jest.mock('@/lib/googleCalendar', () => ({
  GoogleCalendarAPI: {
    checkGoogleConnection: jest.fn(),
  },
}))

// Mock MyEvents component
jest.mock('@/app/components/MyEvents', () => {
  return function MockMyEvents({ userEvents, onEventRemoved, hasGoogleConnected }: any) {
    return (
      <div data-testid="my-events">
        <div data-testid="events-count">{userEvents.length}</div>
        <div data-testid="google-connected">{hasGoogleConnected.toString()}</div>
        {userEvents.map((event: any) => (
          <div key={event.id} data-testid={`event-${event.id}`}>
            {event.event.title}
            <button onClick={() => onEventRemoved(event.id)}>Remove</button>
          </div>
        ))}
      </div>
    )
  }
})

// Mock CalendarApp component
jest.mock('@/app/components/CalendarApp', () => {
  return function MockCalendarApp({ userEvents }: any) {
    return (
      <div data-testid="calendar-app">
        <div data-testid="calendar-events-count">{userEvents.length}</div>
      </div>
    )
  }
})

// Type the mocked functions
const mockedGetUser = jest.mocked(supabase.auth.getUser)
const mockedUpdateUser = jest.mocked(supabase.auth.updateUser)
const mockedSignInWithOAuth = jest.mocked(supabase.auth.signInWithOAuth)
const mockedFrom = jest.mocked(supabase.from)
const mockedStorageFrom = jest.mocked(supabase.storage.from)
const mockedCheckGoogleConnection = jest.mocked(GoogleCalendarAPI.checkGoogleConnection)

// Helper function to create mock user
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '123',
  email: 'test@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  identities: [],
  factors: [],
  ...overrides
})

// Helper function to create mock Uporabnik
const createMockUporabnik = (overrides = {}) => ({
  id: 1,
  ime: 'Test',
  priimek: 'User',
  email: 'test@example.com',
  bio: 'Test bio',
  profilna_slika: 'https://example.com/profile.jpg',
  tutor: false,
  ...overrides
})

// Helper function to create mock UserEvent
const createMockUserEvent = (overrides = {}) => ({
  id: 1,
  event_id: 1,
  google_calendar_event_id: 'google-123',
  created_at: '2023-01-01T00:00:00Z',
  event: {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date_time: '2023-12-01T10:00:00Z',
    end_date_time: '2023-12-01T11:00:00Z',
    lecturer: 'Test Lecturer',
    predmet: {
      naziv: 'Test Subject'
    }
  },
  ...overrides
})

describe('StudentProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
    
    // Default mocks
    mockedGetUser.mockResolvedValue({ 
      data: { user: createMockUser() }, 
      error: null 
    } as any)
    
    mockedCheckGoogleConnection.mockResolvedValue(false)
    
    // Mock successful profile fetch
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: createMockUporabnik(),
          error: null
        })
      })
    })
    
    // Mock successful events fetch
    const mockEventsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [createMockUserEvent()],
          error: null
        })
      })
    })
    
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'Uporabniki') {
        return { select: mockSelect } as any
      } else if (table === 'UserEvents') {
        return { select: mockEventsSelect } as any
      }
      return { select: jest.fn() } as any
    })
  })

  afterEach(() => {
    (console.error as jest.Mock).mockRestore()
  })

  test('renders loading state initially', () => {
    render(<StudentProfile />)
    expect(screen.getByText('Nalaganje...')).toBeInTheDocument()
  })

  test('renders profile information when loaded', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Profil učenca')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Test bio')).toBeInTheDocument()
    })
  })

  test('shows not logged in message when user is null', async () => {
    mockedGetUser.mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    } as any)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Uporabnik ni prijavljen.')).toBeInTheDocument()
    })
  })

  test('enters edit mode when edit button is clicked', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    expect(screen.getByText('Shrani spremembe')).toBeInTheDocument()
    expect(screen.getByText('Prekliči')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument()
  })

  test('cancels edit mode when cancel button is clicked', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const cancelButton = screen.getByText('Prekliči')
    fireEvent.click(cancelButton)
    
    expect(screen.getByText('Uredi profil')).toBeInTheDocument()
    expect(screen.queryByText('Shrani spremembe')).not.toBeInTheDocument()
  })

  test('updates profile successfully', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    })
    
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'Uporabniki' && mockUpdate.mock.calls.length === 0) {
        // First call is for fetching, second for updating
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createMockUporabnik(),
                error: null
              })
            })
          }),
          update: mockUpdate
        } as any
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [createMockUserEvent()],
              error: null
            })
          })
        })
      } as any
    })
    
    mockedUpdateUser.mockResolvedValue({ error: null } as any)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const emailInput = screen.getByDisplayValue('test@example.com')
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } })
    
    const saveButton = screen.getByText('Shrani spremembe')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Profil uspešno posodobljen!')).toBeInTheDocument()
    })
  })

  test('shows validation error for invalid email', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const emailInput = screen.getByDisplayValue('test@example.com')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const saveButton = screen.getByText('Shrani spremembe')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Prosimo vnesi veljaven email.')).toBeInTheDocument()
    })
  })

  test('handles profile update error', async () => {
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ 
        error: { message: 'Database error' } 
      })
    })
    
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'Uporabniki') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createMockUporabnik(),
                error: null
              })
            })
          }),
          update: mockUpdate
        } as any
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [createMockUserEvent()],
              error: null
            })
          })
        })
      } as any
    })
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const saveButton = screen.getByText('Shrani spremembe')
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Napaka pri posodabljanju profila: Database error')).toBeInTheDocument()
    })
  })

  test('shows Google connection button when not connected', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('+ Poveži Google račun')).toBeInTheDocument()
    })
  })

  test('shows Google connected status when connected and valid', async () => {
    mockedGetUser.mockResolvedValue({ 
      data: { 
        user: createMockUser({
          app_metadata: { providers: ['google'] }
        })
      }, 
      error: null 
    } as any)
    
    mockedCheckGoogleConnection.mockResolvedValue(true)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Google račun povezan in aktiven')).toBeInTheDocument()
    })
  })

  test('shows Google refresh button when connection needs refresh', async () => {
    mockedGetUser.mockResolvedValue({ 
      data: { 
        user: createMockUser({
          app_metadata: { providers: ['google'] }
        })
      }, 
      error: null 
    } as any)
    
    mockedCheckGoogleConnection.mockResolvedValue(false)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Google račun potrebuje osvežitev')).toBeInTheDocument()
      expect(screen.getByText('Osveži Google povezavo')).toBeInTheDocument()
    })
  })

  test('initiates Google OAuth when connect button is clicked', async () => {
    mockedSignInWithOAuth.mockResolvedValue({ error: null } as any)
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true
    })
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const connectButton = screen.getByText('+ Poveži Google račun')
      fireEvent.click(connectButton)
    })
    
    const confirmButton = screen.getByText('Poveži')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockedSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'https://skill-share-hub-skillsharehubs-projects-a282906b.vercel.app/profil',
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
    })
  })

  test('handles Google OAuth error', async () => {
    mockedSignInWithOAuth.mockResolvedValue({ 
      error: { message: 'OAuth error' } 
    } as any)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const connectButton = screen.getByText('+ Poveži Google račun')
      fireEvent.click(connectButton)
    })
    
    const confirmButton = screen.getByText('Poveži')
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(screen.getByText('Napaka pri povezavi Google računa: OAuth error')).toBeInTheDocument()
    })
  })

  test('displays user events in list view', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByTestId('my-events')).toBeInTheDocument()
      expect(screen.getByTestId('events-count')).toHaveTextContent('1')
      expect(screen.getByTestId('event-1')).toHaveTextContent('Test Event')
    })
  })

  test('switches to calendar view when calendar button is clicked', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const calendarButton = screen.getByText('Koledar')
      fireEvent.click(calendarButton)
    })
    
    expect(screen.getByTestId('calendar-app')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-events-count')).toHaveTextContent('1')
  })

  test('switches back to list view when list button is clicked', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const calendarButton = screen.getByText('Koledar')
      fireEvent.click(calendarButton)
    })
    
    const listButton = screen.getByText('Seznam')
    fireEvent.click(listButton)
    
    expect(screen.getByTestId('my-events')).toBeInTheDocument()
    expect(screen.queryByTestId('calendar-app')).not.toBeInTheDocument()
  })

  test('handles event removal', async () => {
    render(<StudentProfile />)
    
    await waitFor(() => {
      const removeButton = screen.getByText('Remove')
      fireEvent.click(removeButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Dogodek uspešno odstranjen iz koledarja!')).toBeInTheDocument()
    })
  })

  test('handles image upload', async () => {
    const mockUpload = jest.fn().mockResolvedValue({ error: null })
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/new-image.jpg' }
    })
    
    mockedStorageFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    } as any)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const fileInput = screen.getByLabelText(/izberi sliko/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
      expect(mockGetPublicUrl).toHaveBeenCalled()
    })
  })

  test('handles image upload error', async () => {
    const mockUpload = jest.fn().mockResolvedValue({ 
      error: { message: 'Upload failed' } 
    })
    
    mockedStorageFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn()
    } as any)
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      const editButton = screen.getByText('Uredi profil')
      fireEvent.click(editButton)
    })
    
    const fileInput = screen.getByLabelText(/izberi sliko/i)
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(screen.getByText('Napaka pri nalaganju slike: Upload failed')).toBeInTheDocument()
    })
  })

  test('shows no profile image placeholder when no image is set', async () => {
    const mockUporabnikWithoutImage = createMockUporabnik({ profilna_slika: null })
    
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockUporabnikWithoutImage,
          error: null
        })
      })
    })
    
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'Uporabniki') {
        return { select: mockSelect } as any
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        })
      } as any
    })
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Ni slike')).toBeInTheDocument()
    })
  })

  test('handles events loading error', async () => {
    const mockEventsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Events fetch error' }
        })
      })
    })
    
    mockedFrom.mockImplementation((table: string) => {
      if (table === 'Uporabniki') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: createMockUporabnik(),
                error: null
              })
            })
          })
        } as any
      } else if (table === 'UserEvents') {
        return { select: mockEventsSelect } as any
      }
      return { select: jest.fn() } as any
    })
    
    render(<StudentProfile />)
    
    await waitFor(() => {
      expect(screen.getByText('Napaka pri nalaganju dogodkov.')).toBeInTheDocument()
    })
  })
})