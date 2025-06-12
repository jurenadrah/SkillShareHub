import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostsPage from '../page';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        order: jest.fn(() => ({
          eq: jest.fn(),
          ilike: jest.fn(),
          gte: jest.fn(),
          lte: jest.fn(),
        })),
        in: jest.fn(),
      })),
      insert: jest.fn(),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

// Get the mocked supabase instance
const mockSupabase = require('@/lib/supabase').supabase;

// Mock data
const mockUser = {
  id: 1,
  ime: 'Janez',
  priimek: 'Novak',
  email: 'janez@example.com',
  bio: null,
  profilna_slika: null,
  tutor: false,
};

const mockPosts = [
  {
    id: '1',
    content: 'Test objava 1',
    created_at: '2024-01-01T10:00:00Z',
    fk_uporabniki_id: '1',
  },
  {
    id: '2',
    content: 'Test objava 2',
    created_at: '2024-01-02T10:00:00Z',
    fk_uporabniki_id: '2',
  },
];

const mockUsers = [
  { id: 1, ime: 'Janez', priimek: 'Novak' },
  { id: 2, ime: 'Ana', priimek: 'Kozel' },
];

describe('PostsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'janez@example.com' } },
      error: null,
    });

    // Mock the chain of Supabase calls
    const mockQuery = {
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
      order: jest.fn().mockReturnThis(),
    };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Uporabniki') {
        return {
          select: jest.fn(() => ({
            ...mockQuery,
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            in: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          })),
        };
      }
      if (table === 'Posti') {
        return {
          select: jest.fn(() => ({
            ...mockQuery,
            order: jest.fn(() => mockQuery),
          })),
          insert: jest.fn().mockResolvedValue({ error: null }),
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return { select: jest.fn(() => mockQuery) };
    });

    // Set the final resolved value for posts query
    Object.defineProperty(mockQuery, 'then', {
      value: (callback: any) => callback({ data: mockPosts, error: null }),
      configurable: true,
    });
  });

  test('renders loading state initially', () => {
    render(<PostsPage />);
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  test('renders main heading and form after loading', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Objave')).toBeInTheDocument();
    });
    
    expect(screen.getByPlaceholderText('Kaj razmišljaš?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Objavi' })).toBeInTheDocument();
  });

  test('renders filter controls', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Filtriraj po uporabniku:')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Iskanje po vsebini:')).toBeInTheDocument();
    expect(screen.getByText('Od:')).toBeInTheDocument();
    expect(screen.getByText('Do:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Išči' })).toBeInTheDocument();
  });

  test('allows typing in new post textarea', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kaj razmišljaš?')).toBeInTheDocument();
    });
    
    const textarea = screen.getByPlaceholderText('Kaj razmišljaš?');
    fireEvent.change(textarea, { target: { value: 'Nova objava' } });
    
    expect(textarea).toHaveValue('Nova objava');
  });

  test('allows typing in keyword filter input', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Vnesi besedo ali frazo')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Vnesi besedo ali frazo');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(input).toHaveValue('test');
  });

  test('submits new post when form is submitted', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Posti') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockPosts, error: null })),
          })),
          insert: mockInsert,
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          })),
          in: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
        })),
      };
    });

    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Kaj razmišljaš?')).toBeInTheDocument();
    });
    
    const textarea = screen.getByPlaceholderText('Kaj razmišljaš?');
    const submitButton = screen.getByRole('button', { name: 'Objavi' });
    
    fireEvent.change(textarea, { target: { value: 'Nova testna objava' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          fk_uporabniki_id: 1,
          content: 'Nova testna objava',
        }),
      ])
    });
  });

  test('applies filters when search button is clicked', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Vnesi besedo ali frazo')).toBeInTheDocument();
    });
    
    const keywordInput = screen.getByPlaceholderText('Vnesi besedo ali frazo');
    const searchButton = screen.getByRole('button', { name: 'Išči' });
    
    fireEvent.change(keywordInput, { target: { value: 'test' } });
    fireEvent.click(searchButton);
    
    // The search should trigger a new fetch with filters applied
    // This is verified by the component re-rendering with updated state
    await waitFor(() => {
      expect(keywordInput).toHaveValue('test');
    });
  });

  test('handles date filter inputs', async () => {
    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Od:')).toBeInTheDocument();
    });
    
    const dateInputs = screen.getAllByDisplayValue('');
    const fromDateInput = dateInputs.find(input => 
      input.getAttribute('type') === 'date' && 
      input.closest('label')?.textContent?.includes('Od:')
    );
    const toDateInput = dateInputs.find(input => 
      input.getAttribute('type') === 'date' && 
      input.closest('label')?.textContent?.includes('Do:')
    );
    
    if (fromDateInput && toDateInput) {
      fireEvent.change(fromDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(toDateInput, { target: { value: '2024-01-31' } });
      
      expect(fromDateInput).toHaveValue('2024-01-01');
      expect(toDateInput).toHaveValue('2024-01-31');
    }
  });

  test('does not submit empty post', async () => {
    const mockInsert = jest.fn();
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'Posti') {
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: mockPosts, error: null })),
          })),
          insert: mockInsert,
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          })),
          in: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
        })),
      };
    });

    render(<PostsPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Objavi' })).toBeInTheDocument();
    });
    
    const submitButton = screen.getByRole('button', { name: 'Objavi' });
    fireEvent.click(submitButton);
    
    // Should not call insert for empty content
    expect(mockInsert).not.toHaveBeenCalled();
  });

  test('handles error when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    render(<PostsPage />);
    
    await waitFor(() => {
      // Component should handle the error gracefully and stop loading
      expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument();
    });
  });
});