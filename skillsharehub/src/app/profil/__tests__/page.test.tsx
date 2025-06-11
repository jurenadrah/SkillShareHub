import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ProfilPage from '../page';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock components
jest.mock('@/app/components/StudentProfile', () => () => <div>Student Profile</div>);
jest.mock('@/app/components/TutorProfile', () => () => <div>Tutor Profile</div>);

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

describe('ProfilPage', () => {
  const push = jest.fn();
  const mockUser = {
    id: 1,
    ime: 'Test',
    priimek: 'User',
    email: 'test@example.com',
    tutor: false
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.spyOn(console, 'error').mockImplementation(() => {})
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore()
  });

  it('redirects to login if user is not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });

    render(<ProfilPage />);
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login'));
  });

  it('displays loading initially and then shows profile', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { email: mockUser.email } }, error: null });
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockUser, error: null }) }) })
    });

    render(<ProfilPage />);

    expect(screen.getByText('Nalaganje...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Profil - Test User')).toBeInTheDocument();
      expect(screen.getByText('Student Profile')).toBeInTheDocument();
    });
  });

  it('displays error if user data cannot be loaded', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { email: mockUser.email } }, error: null });
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: true }) }) })
    });

    render(<ProfilPage />);
    await waitFor(() => {
      expect(screen.getByText('Napaka pri nalaganju profila.')).toBeInTheDocument();
    });
  });

  it('toggles user role when button is clicked', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { email: mockUser.email } }, error: null });
    (supabase.from as jest.Mock).mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { ...mockUser }, error: null }) }) }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) })
    });

    render(<ProfilPage />);

    await waitFor(() => screen.getByText('Student Profile'));

    const toggleButton = screen.getByText('Zamenjaj vlogo');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Tutor Profile')).toBeInTheDocument();
    });
  });
});
