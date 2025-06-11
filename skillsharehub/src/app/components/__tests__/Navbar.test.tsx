import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Navbar from '../Navbar'
import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase with proper typing
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(),
        })),
      })),
    })),
  },
}))

// Type the mocked supabase methods using jest.mocked()
const mockedGetUser = jest.mocked(supabase.auth.getUser)
const mockedOnAuthStateChange = jest.mocked(supabase.auth.onAuthStateChange)
const mockedSignOut = jest.mocked(supabase.auth.signOut)

// Mock AuthForm component
jest.mock('../AuthForm', () => {
  return function MockAuthForm() {
    return <div data-testid="auth-form">Auth Form</div>
  }
})

// Helper function to create mock users
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

// Helper function to create mock auth error
const createMockAuthError = (message: string = 'Authentication failed'): AuthError => ({
  name: 'AuthError',
  message,
  status: 401,
} as AuthError)

// Mock subscription object
const createMockSubscription = () => ({
  id: 'mock-subscription-id',
  callback: jest.fn(),
  unsubscribe: jest.fn(),
})

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Default mock for auth state - user is null (not authenticated)
    mockedGetUser.mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    } as any)
    
    // Mock the auth state change listener with proper subscription type
    mockedOnAuthStateChange.mockReturnValue({
      data: { subscription: createMockSubscription() }
    })
  })

  test('renders navbar with logo and shows login button when user is not authenticated', async () => {
    render(<Navbar />)
    
    // Check if logo is present
    expect(screen.getByAltText('SkillShareHub Logo')).toBeInTheDocument()
    
    // Check if login button is present
    expect(screen.getByText('PRIJAVA / REGISTRACIJA')).toBeInTheDocument()
    
    // Check that user-only buttons are disabled
    expect(screen.getByText('MOJ PROFIL')).toHaveClass('text-gray-400')
    expect(screen.getByText('OBJAVE')).toHaveClass('text-gray-400')
    expect(screen.getByText('SPOROČILA')).toHaveClass('text-gray-400')
  })

  test('shows user email and logout button when user is authenticated', async () => {
    const mockUser = createMockUser()
    
    mockedGetUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    } as any)
    
    render(<Navbar />)
    
    await waitFor(() => {
      expect(screen.getByText('POZDRAVLJEN/A, test@example.com')).toBeInTheDocument()
      expect(screen.getByText('ODJAVA')).toBeInTheDocument()
    })
    
    // Check that user buttons are enabled
    expect(screen.getByText('MOJ PROFIL')).toHaveClass('text-blue-600')
    expect(screen.getByText('OBJAVE')).toHaveClass('text-blue-600')
    expect(screen.getByText('SPOROČILA')).toHaveClass('text-blue-600')
  })

  test('opens auth modal when login button is clicked', async () => {
    render(<Navbar />)
    
    const loginButton = screen.getByText('PRIJAVA / REGISTRACIJA')
    fireEvent.click(loginButton)
    
    // Check if auth modal is opened
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
  })

  test('closes auth modal when close button is clicked', async () => {
    render(<Navbar />)
    
    // Open modal
    const loginButton = screen.getByText('PRIJAVA / REGISTRACIJA')
    fireEvent.click(loginButton)
    
    // Close modal
    const closeButton = screen.getByTitle('Zapri')
    fireEvent.click(closeButton)
    
    // Check if modal is closed
    expect(screen.queryByTestId('auth-form')).not.toBeInTheDocument()
  })

  test('navigates to home when logo is clicked', () => {
    render(<Navbar />)
    
    const logoButton = screen.getByAltText('SkillShareHub Logo').closest('button')
    fireEvent.click(logoButton!)
    
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  test('calls signOut and navigates to home when logout button is clicked', async () => {
    const mockUser = createMockUser()
    
    mockedGetUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    } as any)
    mockedSignOut.mockResolvedValue({ error: null } as any)
    
    render(<Navbar />)
    
    await waitFor(() => {
      const logoutButton = screen.getByText('ODJAVA')
      fireEvent.click(logoutButton)
    })
    
    expect(mockedSignOut).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  test('navigates to posts when OBJAVE button is clicked by authenticated user', async () => {
    const mockUser = createMockUser()
    
    mockedGetUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    } as any)
    
    render(<Navbar />)
    
    // Wait for the component to be fully rendered with authenticated state
    await waitFor(() => {
      expect(screen.getByText('POZDRAVLJEN/A, test@example.com')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Wait for the button to be enabled
    await waitFor(() => {
      const postsButton = screen.getByText('OBJAVE')
      expect(postsButton).toHaveClass('text-blue-600')
      expect(postsButton).not.toHaveClass('text-gray-400')
    }, { timeout: 3000 })
    
    // Click the button
    const postsButton = screen.getByText('OBJAVE')
    fireEvent.click(postsButton)
    
    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/posts')
    }, { timeout: 3000 })
  })

  test('navigates to messages when SPOROČILA button is clicked by authenticated user', async () => {
    const mockUser = createMockUser()
    
    mockedGetUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    } as any)
    
    render(<Navbar />)
    
    // Wait for the component to be fully rendered with authenticated state
    await waitFor(() => {
      expect(screen.getByText('POZDRAVLJEN/A, test@example.com')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Wait for the button to be enabled
    await waitFor(() => {
      const messagesButton = screen.getByText('SPOROČILA')
      expect(messagesButton).toHaveClass('text-blue-600')
      expect(messagesButton).not.toHaveClass('text-gray-400')
    }, { timeout: 3000 })
    
    // Click the button
    const messagesButton = screen.getByText('SPOROČILA')
    fireEvent.click(messagesButton)
    
    // Wait for navigation to be called
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dms')
    }, { timeout: 3000 })
  })

  test('handles auth state change properly', async () => {
    const mockUser = createMockUser()
    
    render(<Navbar />)
    
    // Simulate auth state change by updating the mock
    mockedGetUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    } as any)
    
    // Verify that onAuthStateChange was called
    expect(mockedOnAuthStateChange).toHaveBeenCalled()
    
    // Verify that the subscription has an unsubscribe method
    const subscription = mockedOnAuthStateChange.mock.results[0].value.data.subscription
    expect(subscription.unsubscribe).toBeDefined()
    expect(typeof subscription.unsubscribe).toBe('function')
  })

  test('handles auth errors gracefully', async () => {
    // Create a proper AuthError object using the helper function
    const authError = createMockAuthError('Authentication failed')
    
    mockedGetUser.mockResolvedValue({ 
      data: { user: null }, 
      error: authError 
    } as any)
    
    render(<Navbar />)
    
    // Should still render the login button when there's an auth error
    expect(screen.getByText('PRIJAVA / REGISTRACIJA')).toBeInTheDocument()
    
    // User buttons should be disabled
    expect(screen.getByText('MOJ PROFIL')).toHaveClass('text-gray-400')
    expect(screen.getByText('OBJAVE')).toHaveClass('text-gray-400')
    expect(screen.getByText('SPOROČILA')).toHaveClass('text-gray-400')
  })
})