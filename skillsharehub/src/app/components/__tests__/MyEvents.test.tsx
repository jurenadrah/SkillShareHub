import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyEvents from '../MyEvents';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

// Mock Google Calendar API
jest.mock('@/lib/googleCalendar', () => ({
  GoogleCalendarAPI: {
    deleteEvent: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('MyEvents Component', () => {
  const mockUserEvents = [
    {
      id: 1,
      event_id: 101,
      google_calendar_event_id: 'google123',
      created_at: '2024-01-01T10:00:00Z',
      event: {
        id: 101,
        title: 'Test Event',
        description: 'Test Description',
        start_date_time: '2024-12-25T14:00:00Z',
        end_date_time: '2024-12-25T15:00:00Z',
        lecturer: 'John Doe',
        fk_id_uporabnik: {
          ime: 'John',
          priimek: 'Doe',
          zoom_link: 'https://zoom.us/test',
        } as {
          ime: string;
          priimek?: string;
          zoom_link?: string;
        },
        predmet: {
          naziv: 'Test Subject',
        },
      },
    },
  ];

  const defaultProps = {
    userEvents: mockUserEvents,
    onEventRemoved: jest.fn(),
    hasGoogleConnected: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current time to a predictable value
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-12-25T13:00:00Z')); // 1 hour before event
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders empty state when no events', () => {
    render(<MyEvents {...defaultProps} userEvents={[]} />);
    
    expect(screen.getByText('Ni dogodkov')).toBeInTheDocument();
    expect(screen.getByText('Pojdite na glavno stran in se pridružite dogodkom.')).toBeInTheDocument();
    expect(screen.getByText('Ogled urnika')).toBeInTheDocument();
  });

  test('renders events list correctly', () => {
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Predavatelj:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Predmet:', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
  });

  test('shows correct event status', () => {
    render(<MyEvents {...defaultProps} />);
    
    // Event is upcoming (current time is 1 hour before)
    expect(screen.getByText('Prihajajoči')).toBeInTheDocument();
  });

  test('shows meeting button when event is within 15 minutes', () => {
    // Set time to 10 minutes before event start
    jest.setSystemTime(new Date('2024-12-25T13:50:00Z'));
    
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('Pridruži se srečanju')).toBeInTheDocument();
  });

  test('shows points refund indicator correctly', () => {
    render(<MyEvents {...defaultProps} />);
    
    // Should show refund possible since we're more than 15 minutes before
    expect(screen.getByText('Vračilo točk možno')).toBeInTheDocument();
  });

  test('shows no refund when too close to event', () => {
    // Set time to 5 minutes before event start
    jest.setSystemTime(new Date('2024-12-25T13:55:00Z'));
    
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('Brez vračila točk')).toBeInTheDocument();
  });

  test('shows Google sync status', () => {
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('Sinhroniziran z Google')).toBeInTheDocument();
  });

  test('shows local only status when no Google event ID', () => {
    const eventsWithoutGoogle = [{
      ...mockUserEvents[0],
      google_calendar_event_id: null,
    }];
    
    render(<MyEvents {...defaultProps} userEvents={eventsWithoutGoogle} />);
    
    expect(screen.getByText('Samo lokalno')).toBeInTheDocument();
  });

  test('opens modal when clicking on event', () => {
    render(<MyEvents {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Test Event'));
    
    expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument();
  });

  test('closes modal when clicking close button', () => {
    render(<MyEvents {...defaultProps} />);
    
    // Open modal
    fireEvent.click(screen.getByText('Test Event'));
    expect(screen.getByText('Podrobnosti dogodka')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByTitle('Zapri'));
    expect(screen.queryByText('Podrobnosti dogodka')).not.toBeInTheDocument();
  });

  test('disables remove button while removing', () => {
    render(<MyEvents {...defaultProps} />);
    
    const removeButton = screen.getByText('Odstrani');
    fireEvent.click(removeButton);
    
    expect(screen.getByText('Odstranjujem...')).toBeInTheDocument();
  });

  test('shows ended status for past events', () => {
    // Set time to after event end
    jest.setSystemTime(new Date('2024-12-25T16:00:00Z'));
    
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('Končan')).toBeInTheDocument();
  });

  test('shows ongoing status for current events', () => {
    // Set time to during event
    jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
    
    render(<MyEvents {...defaultProps} />);
    
    expect(screen.getByText('V teku')).toBeInTheDocument();
  });

  test('handles events without zoom link', () => {
    const eventsWithoutZoom = [{
      ...mockUserEvents[0],
      event: {
        ...mockUserEvents[0].event,
        fk_id_uporabnik: {
          ...mockUserEvents[0].event.fk_id_uporabnik,
          zoom_link: undefined, // Changed from null to undefined
        },
      },
    }];
    
    // Set time to show meeting button period
    jest.setSystemTime(new Date('2024-12-25T13:50:00Z'));
    
    render(<MyEvents {...defaultProps} userEvents={eventsWithoutZoom} />);
    
    expect(screen.queryByText('Pridruži se srečanju')).not.toBeInTheDocument();
  });
});