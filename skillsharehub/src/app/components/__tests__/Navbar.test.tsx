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

// Mock Supabase
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

const mockedGetUser = jest.mocked(supabase.auth.getUser)
const mockedOnAuthStateChange = jest.mocked(supabase.auth.onAuthStateChange)
const mockedSignOut = jest.mocked(supabase.auth.signOut)

jest.mock('../AuthForm', () => {
  return function MockAuthForm() {
    return <div data-testid="auth-form">Auth Form</div>
  }
})

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
  ...overrides,
})

const createMockAuthError = (message: string = 'Authentication failed'): AuthError => ({
  name: 'AuthError',
  message,
  status: 401,
} as AuthError)

const createMockSubscription = () => ({
  id: 'mock-subscription-id',
  callback: jest.fn(),
  unsubscribe: jest.fn(),
})

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any)
    mockedOnAuthStateChange.mockReturnValue({
      data: { subscription: createMockSubscription() },
    })
  })

  test('renders navbar with logo and shows login button when user is not authenticated', async () => {
    render(<Navbar />)

    expect(screen.getByAltText('Logo')).toBeInTheDocument()
    expect(screen.getByText('PRIJAVA / REGISTRACIJA')).toBeInTheDocument()

    expect(screen.getByText('MOJ PROFIL').tagName).toBe('SPAN')
    expect(screen.getByText('OBJAVE').tagName).toBe('SPAN')
    expect(screen.getByText('SPOROČILA').tagName).toBe('SPAN')
  })

  test('shows user email and logout button when user is authenticated', async () => {
    const mockUser = createMockUser()
    mockedGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as any)

    render(<Navbar />)

    await screen.findByText(`POZDRAVLJEN/A, ${mockUser.email}`)
    expect(screen.getByText('ODJAVA')).toBeInTheDocument()

    expect(screen.getByText('MOJ PROFIL').tagName).toBe('BUTTON')
    expect(screen.getByText('OBJAVE').tagName).toBe('BUTTON')
    expect(screen.getByText('SPOROČILA').tagName).toBe('BUTTON')
  })

  test('opens auth modal when login button is clicked', async () => {
    render(<Navbar />)

    fireEvent.click(screen.getByText('PRIJAVA / REGISTRACIJA'))

    await waitFor(() => {
      expect(screen.getByTestId('auth-form')).toBeInTheDocument()
    })
  })

  test('closes auth modal when close button is clicked', async () => {
    render(<Navbar />)

    fireEvent.click(screen.getByText('PRIJAVA / REGISTRACIJA'))

    const closeButton = await screen.findByTitle('Zapri')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('auth-form')).not.toBeInTheDocument()
    })
  })

  test('navigates to home when logo is clicked', () => {
    render(<Navbar />)

    const logoButton = screen.getByAltText('Logo').closest('button')
    fireEvent.click(logoButton!)

    expect(mockPush).toHaveBeenCalledWith('/')
  })

  test('calls signOut and navigates to home when logout button is clicked', async () => {
    const mockUser = createMockUser()
    mockedGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as any)
    mockedSignOut.mockResolvedValue({ error: null } as any)

    render(<Navbar />)

    const logoutButton = await screen.findByRole('button', { name: 'ODJAVA' })
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  test('navigates to posts when OBJAVE button is clicked by authenticated user', async () => {
    const mockUser = createMockUser()
    mockedGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as any)

    render(<Navbar />)

    const postsButton = await screen.findByRole('button', { name: 'OBJAVE' })
    fireEvent.click(postsButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/posts')
    })
  })

  test('navigates to messages when SPOROČILA button is clicked by authenticated user', async () => {
    const mockUser = createMockUser()
    mockedGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as any)

    render(<Navbar />)

    const messagesButton = await screen.findByRole('button', { name: 'SPOROČILA' })
    fireEvent.click(messagesButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dms')
    })
  })

  test('handles auth state change properly', async () => {
    const mockUser = createMockUser()
    render(<Navbar />)

    mockedGetUser.mockResolvedValue({ data: { user: mockUser }, error: null } as any)

    expect(mockedOnAuthStateChange).toHaveBeenCalled()

    const subscription = mockedOnAuthStateChange.mock.results[0].value.data.subscription
    expect(subscription.unsubscribe).toBeDefined()
    expect(typeof subscription.unsubscribe).toBe('function')
  })

  test('handles auth errors gracefully', async () => {
    const authError = createMockAuthError()
    mockedGetUser.mockResolvedValue({ data: { user: null }, error: authError } as any)

    render(<Navbar />)

    expect(screen.getByText('PRIJAVA / REGISTRACIJA')).toBeInTheDocument()

    expect(screen.getByText('MOJ PROFIL').tagName).toBe('SPAN')
    expect(screen.getByText('OBJAVE').tagName).toBe('SPAN')
    expect(screen.getByText('SPOROČILA').tagName).toBe('SPAN')
  })
})
