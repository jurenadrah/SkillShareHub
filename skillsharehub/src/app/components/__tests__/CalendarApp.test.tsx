import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CalendarApp from '../CalendarApp'

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

// Mock the external dependencies
const mockEventsService = {
  getAll: jest.fn(() => []),
  set: jest.fn(),
}

jest.mock('@schedule-x/react', () => ({
  useNextCalendarApp: jest.fn(() => ({
    id: 'mock-calendar',
    views: [],
    events: [],
  })),
  ScheduleXCalendar: ({ calendarApp }: any) => (
    <div data-testid="schedule-x-calendar" data-calendar-id={calendarApp?.id}>
      Mock Calendar Component
    </div>
  ),
}))

jest.mock('@schedule-x/calendar', () => ({
  createViewDay: jest.fn(() => ({ name: 'day' })),
  createViewMonthGrid: jest.fn(() => ({ name: 'month' })),
  createViewWeek: jest.fn(() => ({ name: 'week' })),
}))

jest.mock('@schedule-x/events-service', () => ({
  createEventsServicePlugin: jest.fn(() => mockEventsService),
}))

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, onKeyDown, ...props }: any) => (
      <div onClick={onClick} onKeyDown={onKeyDown} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}))

// Mock CSS import
jest.mock('@schedule-x/theme-default/dist/index.css', () => ({}))

const mockUserEvents: UserEvent[] = [
  {
    id: 1,
    event_id: 101,
    google_calendar_event_id: 'google123',
    created_at: '2024-01-01T10:00:00Z',
    event: {
      id: 101,
      title: 'Test Event 1',
      description: 'Test Description 1',
      start_date_time: '2024-01-15T09:00:00Z',
      end_date_time: '2024-01-15T10:00:00Z',
      lecturer: 'Dr. Smith',
      predmet: {
        naziv: 'Mathematics',
      },
    },
  },
  {
    id: 2,
    event_id: 102,
    google_calendar_event_id: null,
    created_at: '2024-01-02T11:00:00Z',
    event: {
      id: 102,
      title: 'Test Event 2',
      description: 'Test Description 2',
      start_date_time: '2024-01-16T14:30:00Z',
      end_date_time: '2024-01-16T15:30:00Z',
      lecturer: 'Prof. Johnson',
    },
  },
]

describe('CalendarApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the main calendar component', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      const calendars = screen.getAllByTestId('schedule-x-calendar')
      expect(calendars).toHaveLength(1) // Only main calendar should be visible initially
    })

    it('renders view toggle buttons', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      expect(screen.getByText('Tedenski pogled')).toBeInTheDocument()
      expect(screen.getByText('Dnevni pogled')).toBeInTheDocument()
    })

    it('renders with empty events array', () => {
      render(<CalendarApp userEvents={[]} />)
      
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
      expect(screen.getByText('Tedenski pogled')).toBeInTheDocument()
      expect(screen.getByText('Dnevni pogled')).toBeInTheDocument()
    })
  })

  describe('Modal Functionality', () => {
    it('opens week view modal when week button is clicked', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      const weekButton = screen.getByText('Tedenski pogled')
      fireEvent.click(weekButton)

      // Check for modal header which indicates modal is open
      expect(screen.getByRole('heading', { name: 'Tedenski pogled' })).toBeInTheDocument()
      expect(screen.getByLabelText('Zapri')).toBeInTheDocument()
    })

    it('opens day view modal when day button is clicked', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      const dayButton = screen.getByText('Dnevni pogled')
      fireEvent.click(dayButton)

      // Check for modal header which indicates modal is open
      expect(screen.getByRole('heading', { name: 'Dnevni pogled' })).toBeInTheDocument()
      expect(screen.getByLabelText('Zapri')).toBeInTheDocument()
    })

    it('closes modal when close button is clicked', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      // Open modal first
      const weekButton = screen.getByText('Tedenski pogled')
      fireEvent.click(weekButton)
      
      expect(screen.getByRole('heading', { name: 'Tedenski pogled' })).toBeInTheDocument()

      // Close modal
      const closeButton = screen.getByLabelText('Zapri')
      fireEvent.click(closeButton)

      // Modal should be closed
      expect(screen.queryByRole('heading', { name: 'Tedenski pogled' })).not.toBeInTheDocument()
    })

    it('closes modal when backdrop is clicked', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      // Open modal first
      const weekButton = screen.getByText('Tedenski pogled')
      fireEvent.click(weekButton)
      
      expect(screen.getByRole('heading', { name: 'Tedenski pogled' })).toBeInTheDocument()

      // Find and click the backdrop (the outer modal div)
      const backdrop = screen.getByRole('heading', { name: 'Tedenski pogled' }).closest('[tabindex="-1"]')
      if (backdrop) {
        fireEvent.click(backdrop)
        expect(screen.queryByRole('heading', { name: 'Tedenski pogled' })).not.toBeInTheDocument()
      }
    })

    it('closes modal when Escape key is pressed', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      // Open modal first
      const weekButton = screen.getByText('Tedenski pogled')
      fireEvent.click(weekButton)
      
      expect(screen.getByRole('heading', { name: 'Tedenski pogled' })).toBeInTheDocument()

      // Press Escape on the modal element
      const modalElement = screen.getByRole('heading', { name: 'Tedenski pogled' }).closest('[tabindex="-1"]')
      if (modalElement) {
        fireEvent.keyDown(modalElement, { key: 'Escape' })
        expect(screen.queryByRole('heading', { name: 'Tedenski pogled' })).not.toBeInTheDocument()
      }
    })
  })

  describe('Event Data Processing', () => {
    it('processes user events correctly', () => {
      const mockUseNextCalendarApp = jest.requireMock('@schedule-x/react').useNextCalendarApp
      
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      // Check if useNextCalendarApp was called with processed events
      expect(mockUseNextCalendarApp).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              title: 'Test Event 1',
              start: '2024-01-15 09:00',
              end: '2024-01-15 10:00',
              description: 'Test Description 1',
            }),
            expect.objectContaining({
              id: '2',
              title: 'Test Event 2',
              start: '2024-01-16 14:30',
              end: '2024-01-16 15:30',
              description: 'Test Description 2',
            }),
          ]),
        })
      )
    })

    it('handles events without predmet field', () => {
      const eventsWithoutPredmet = [mockUserEvents[1]] // Second event doesn't have predmet
      
      render(<CalendarApp userEvents={eventsWithoutPredmet} />)
      
      // Should render without errors
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      // Test with a specific date to verify formatting
      const testEvent: UserEvent = {
        id: 3,
        event_id: 103,
        google_calendar_event_id: null,
        created_at: '2024-01-01T00:00:00Z',
        event: {
          id: 103,
          title: 'Date Format Test',
          description: 'Testing date formatting',
          start_date_time: '2024-12-25T08:30:00Z',
          end_date_time: '2024-12-25T10:15:00Z',
          lecturer: 'Test Lecturer',
        },
      }

      const mockUseNextCalendarApp = jest.requireMock('@schedule-x/react').useNextCalendarApp
      
      render(<CalendarApp userEvents={[testEvent]} />)
      
      expect(mockUseNextCalendarApp).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              start: '2024-12-25 08:30',
              end: '2024-12-25 10:15',
            }),
          ]),
        })
      )
    })
  })

  describe('Component Props', () => {
    it('accepts and handles userEvents prop correctly', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })

    it('updates when userEvents prop changes', () => {
      const { rerender } = render(<CalendarApp userEvents={[]} />)
      
      rerender(<CalendarApp userEvents={mockUserEvents} />)
      
      expect(screen.getByTestId('schedule-x-calendar')).toBeInTheDocument()
    })
  })

  describe('Button Styling and Interaction', () => {
    it('applies correct CSS classes to buttons', () => {
      render(<CalendarApp userEvents={mockUserEvents} />)
      
      const weekButton = screen.getByText('Tedenski pogled')
      const dayButton = screen.getByText('Dnevni pogled')
      
      expect(weekButton).toHaveClass('px-4', 'py-2', 'bg-blue-600', 'text-white', 'rounded')
      expect(dayButton).toHaveClass('px-4', 'py-2', 'bg-green-600', 'text-white', 'rounded')
    })
  })
})