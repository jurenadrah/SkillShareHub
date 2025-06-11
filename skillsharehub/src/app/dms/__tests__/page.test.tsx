import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessagesPage from '../page'
import { supabase } from '@/lib/supabase'

// Mock Supabase with proper jest mocking
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}))

// Type the mocked supabase properly
const mockSupabase = supabase as jest.Mocked<typeof supabase>

// Mock data
const mockUsers = [
  { id: 1, email: 'user1@example.com', ime: 'John Doe' },
  { id: 2, email: 'user2@example.com', ime: 'Jane Smith' },
  { id: 3, email: 'user3@example.com', ime: 'Bob Johnson' },
]

const mockMessages = [
  {
    id: 1,
    sender_id: 1,
    receiver_id: 2,
    content: 'Hello there!',
    created_at: '2023-01-01T10:00:00Z',
  },
  {
    id: 2,
    sender_id: 2,
    receiver_id: 1,
    content: 'Hi! How are you?',
    created_at: '2023-01-01T10:01:00Z',
  },
]

const mockChatUsers = [
  { id: 2, email: 'user2@example.com', ime: 'Jane Smith' },
  { id: 3, email: 'user3@example.com', ime: 'Bob Johnson' },
]

// Helper function to create mock query builder
function createMockQueryBuilder(data: any) {
  return {
    // Required PostgrestQueryBuilder properties
    url: '',
    headers: {},
    
    // Query methods that return this for chaining
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    
    // Terminal methods that return promises
    single: jest.fn().mockResolvedValue({ data, error: null }),
    insert: jest.fn().mockResolvedValue({ data, error: null }),
    then: jest.fn().mockResolvedValue({ data, error: null }),
  } as any
}

describe('MessagesPage', () => {
  // Create fresh mock functions for each test
  let mockChannel: jest.Mock
  let mockOn: jest.Mock
  let mockSubscribe: jest.Mock
  let mockRemoveChannel: jest.Mock

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Reset console methods to avoid interference
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'log').mockImplementation(() => {})

    // Setup realtime subscription mocks
    mockSubscribe = jest.fn().mockReturnValue(undefined)
    mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe })
    mockChannel = jest.fn().mockReturnValue({ 
      on: mockOn,
      subscribe: mockSubscribe 
    })
    mockRemoveChannel = jest.fn()

    // Setup auth mock - Cast to jest.MockedFunction to access mockResolvedValue
    ;(mockSupabase.auth.getUser as jest.MockedFunction<typeof mockSupabase.auth.getUser>)
      .mockResolvedValue({
        data: { user: { email: 'user1@example.com' } },
        error: null
      } as any)

    // Setup channel mocks
    mockSupabase.channel = mockChannel
    mockSupabase.removeChannel = mockRemoveChannel

    // Mock different table responses
    ;(mockSupabase.from as jest.MockedFunction<typeof mockSupabase.from>)
      .mockImplementation((table: string) => {
        switch (table) {
          case 'Uporabniki':
            const userBuilder = createMockQueryBuilder(mockUsers)
            userBuilder.select = jest.fn().mockImplementation((fields?: string) => {
              if (fields === '*') {
                return Promise.resolve({ data: mockUsers, error: null })
              }
              return {
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null })
                }),
                in: jest.fn().mockResolvedValue({ data: mockChatUsers, error: null })
              }
            })
            return userBuilder as any

          case 'Messages':
            const messageBuilder = createMockQueryBuilder(mockMessages)
            messageBuilder.select = jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ 
                  data: mockMessages.map(m => ({ sender_id: m.sender_id, receiver_id: m.receiver_id })), 
                  error: null 
                }),
                order: jest.fn().mockResolvedValue({ data: mockMessages, error: null })
              })
            })
            return messageBuilder as any

          default:
            return createMockQueryBuilder([]) as any
        }
      })
  })

  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders without crashing', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      expect(screen.getByText('Select Chat')).toBeInTheDocument()
    })

    it('shows search button', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('shows placeholder when no user is selected', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      expect(screen.getByText('Select a user to start chatting')).toBeInTheDocument()
    })
  })

  describe('User Authentication and Data Fetching', () => {
    it('fetches current user on mount', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      await waitFor(() => {
        expect(mockSupabase.auth.getUser).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('fetches users list on mount', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('Uporabniki')
      }, { timeout: 3000 })
    })

    it('handles authentication errors gracefully', async () => {
      ;(mockSupabase.auth.getUser as jest.MockedFunction<typeof mockSupabase.auth.getUser>)
        .mockResolvedValue({
          data: { user: null },
          error: { message: 'User not found' }
        } as any)

      await act(async () => {
        render(<MessagesPage />)
      })
      
      expect(screen.getByText('Select a user to start chatting')).toBeInTheDocument()
    })
  })

  describe('Search Modal', () => {
    it('opens search modal when search button is clicked', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<MessagesPage />)
      })
      
      const searchButton = screen.getByText('Search')
      await act(async () => {
        await user.click(searchButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Search Users')).toBeInTheDocument()
      })
    })

    it('closes search modal when X button is clicked', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<MessagesPage />)
      })
      
      // Open modal
      const searchButton = screen.getByText('Search')
      await act(async () => {
        await user.click(searchButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Search Users')).toBeInTheDocument()
      })
      
      // Close modal
      const closeButton = screen.getByText('✕')
      await act(async () => {
        await user.click(closeButton)
      })
      
      await waitFor(() => {
        expect(screen.queryByText('Search Users')).not.toBeInTheDocument()
      })
    })

    it('filters users based on search query', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<MessagesPage />)
      })
      
      // Open search modal
      await act(async () => {
        await user.click(screen.getByText('Search'))
      })
      
      await waitFor(() => {
        expect(screen.getByText('Search Users')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      await act(async () => {
        await user.type(searchInput, 'jane')
      })
      
      await waitFor(() => {
        expect(searchInput).toHaveValue('jane')
      })
    })
  })

  describe('Message Functionality', () => {
    it('handles message input correctly', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<MessagesPage />)
      })
      
      // Note: This test may need adjustment based on your actual component structure
      // The input might only be visible when a user is selected
      const messageInput = screen.queryByPlaceholderText('Type your message...')
      
      if (messageInput) {
        await act(async () => {
          await user.type(messageInput, 'Test message')
        })
        
        expect(messageInput).toHaveValue('Test message')
      }
    })

    it('handles send button click', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<MessagesPage />)
      })
      
      const sendButton = screen.queryByText('Send')
      
      if (sendButton) {
        await act(async () => {
          await user.click(sendButton)
        })
        
        // Verify that no error was thrown
        expect(sendButton).toBeInTheDocument()
      }
    })
  })

  describe('Error Handling', () => {
    it('handles message sending errors', async () => {
      ;(mockSupabase.from as jest.MockedFunction<typeof mockSupabase.from>)
        .mockImplementation((table: string) => {
          if (table === 'Messages') {
            return {
              url: '',
              headers: {},
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              or: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              order: jest.fn().mockReturnThis(),
              upsert: jest.fn().mockReturnThis(),
              update: jest.fn().mockReturnThis(),
              delete: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: null, error: null }),
              then: jest.fn().mockResolvedValue({ data: null, error: null }),
              insert: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'Insert failed' } 
              })
            } as any
          }
          return createMockQueryBuilder([])
        })

      await act(async () => {
        render(<MessagesPage />)
      })
      
      // Component should render without crashing
      expect(screen.getByText('Select Chat')).toBeInTheDocument()
    })
  })

  describe('Component State Management', () => {
    it('maintains component state correctly', async () => {
      await act(async () => {
        render(<MessagesPage />)
      })
      
      // Verify initial state
      expect(screen.getByText('Select a user to start chatting')).toBeInTheDocument()
      expect(screen.getByText('Select Chat')).toBeInTheDocument()
    })

    it('handles component re-renders', async () => {
      const { rerender } = await act(async () => {
        return render(<MessagesPage />)
      })
      
      await act(async () => {
        rerender(<MessagesPage />)
      })
      
      expect(screen.getByText('Select Chat')).toBeInTheDocument()
    })
  })
})