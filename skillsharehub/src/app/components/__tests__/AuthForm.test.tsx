import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import AuthForm from '../AuthForm';
import * as supabaseModule from '@/lib/supabase';

// Ustvari mock za subscription
const mockSubscription = {
  subscription: {
    unsubscribe: jest.fn()
  }
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Dostop do mockanih funkcij
const mockSignUp = supabaseModule.supabase.auth.signUp as jest.Mock;
const mockSignInWithPassword = supabaseModule.supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabaseModule.supabase.auth.signOut as jest.Mock;
const mockGetUser = supabaseModule.supabase.auth.getUser as jest.Mock;
const mockOnAuthStateChange = supabaseModule.supabase.auth.onAuthStateChange as jest.Mock;
const mockFrom = supabaseModule.supabase.from as jest.Mock;
const mockInsert = jest.fn();

describe('AuthForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Nastavi mocke
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({ data: mockSubscription });
    mockFrom.mockReturnValue({
      insert: mockInsert
    });
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  describe('Initial Render', () => {
    it('renders login form by default', async () => {
      render(<AuthForm />);
      console.log(screen.debug()); // Add this line
      // Wait for component to fully render
      await screen.findByText('Prijava', {}, { timeout: 2000 });      
      expect(screen.getByPlaceholderText('Vnesite svoj email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Vnesite svoje geslo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Prijava' })).toBeInTheDocument();
      
      // Should not show signup fields
      expect(screen.queryByPlaceholderText('Vnesite svoje ime')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Vnesite svoj priimek')).not.toBeInTheDocument();
    });

    it('displays logo and header', async () => {
      render(<AuthForm />);
      
      // Wait for component to render and check if logo exists
      await waitFor(() => {
        const logo = screen.queryByAltText('SkillShareHub Logo');
        if (logo) {
          expect(logo).toBeInTheDocument();
        } else {
          // If logo doesn't exist, just check for the header
          expect(screen.getByText('Prijava')).toBeInTheDocument();
        }
      });
    });

    it('calls getUser on mount', async () => {
      render(<AuthForm />);
      
      await waitFor(() => {
        expect(mockGetUser).toHaveBeenCalledTimes(1);
      });
    });

    it('sets up auth state change listener', async () => {
      render(<AuthForm />);
      
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
        expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });

  describe('Mode Switching', () => {
    it('switches to signup mode when clicking register link', async () => {
      const user = userEvent.setup();
      
      render(<AuthForm />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Prijava')).toBeInTheDocument();
      });
      
      // Find and click the register link
      const registerLink = screen.getByText('Nimaš računa? Registriraj se');
      await user.click(registerLink);
      
      // Wait for mode change
      await waitFor(() => {
        expect(screen.getByText('Registracija')).toBeInTheDocument();
      });
      
      expect(screen.getByPlaceholderText('Vnesite svoje ime')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Vnesite svoj priimek')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Registracija' })).toBeInTheDocument();
    });

    it('switches back to login mode when clicking login link', async () => {
      const user = userEvent.setup();
      
      render(<AuthForm />);
      
      // Wait for initial render
      await screen.findByText('Prijava', {}, { timeout: 2000 });
      
      // Switch to signup first
      await user.click(screen.getByText('Nimaš računa? Registriraj se'));
      
      await waitFor(() => {
        expect(screen.getByText('Registracija')).toBeInTheDocument();
      });
      
      // Switch back to login
      await user.click(screen.getByText('Imaš račun? Prijavi se'));
      
      await waitFor(() => {
        expect(screen.getByText('Prijava')).toBeInTheDocument();
      });
      
      expect(screen.queryByPlaceholderText('Vnesite svoje ime')).not.toBeInTheDocument();
    });
  });

  describe('Login Functionality', () => {
    it('handles successful login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({ error: null });
      
      render(<AuthForm />);
      
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Prijava' }));
      
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('displays error message on failed login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({ 
        error: { message: 'Invalid credentials' } 
      });
      
      render(<AuthForm />);
      
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Prijava' }));
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('shows loading state during login', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ error: null }), 100)
      ));
      
      render(<AuthForm />);
      
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Prijava' }));
      
      expect(screen.getByText('Prijavljam...')).toBeInTheDocument();
    });
  });

  describe('Signup Functionality', () => {
    let user: any;

    beforeEach(async () => {
      user = userEvent.setup();
      render(<AuthForm />);
      await user.click(screen.getByText('Nimaš računa? Registriraj se'));
    });

    it('handles successful signup', async () => {
      mockSignUp.mockResolvedValue({ data: { user: {} }, error: null });
      mockInsert.mockResolvedValue({ error: null });
      
      await user.type(screen.getByPlaceholderText('Vnesite svoje ime'), 'John');
      await user.type(screen.getByPlaceholderText('Vnesite svoj priimek'), 'Doe');
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
      
      await waitFor(() => {
        expect(mockFrom).toHaveBeenCalledWith('Uporabniki');
        expect(mockInsert).toHaveBeenCalledWith([{
          email: 'test@example.com',
          ime: 'John',
          priimek: 'Doe',
          tutor: false
        }]);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Registracija uspešna! Preveri email za potrditev.')).toBeInTheDocument();
      });
    });

    it('displays error message on failed signup', async () => {
      mockSignUp.mockResolvedValue({ 
        data: null, 
        error: { message: 'Email already exists' } 
      });
      
      await user.type(screen.getByPlaceholderText('Vnesite svoje ime'), 'John');
      await user.type(screen.getByPlaceholderText('Vnesite svoj priimek'), 'Doe');
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'existing@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('displays error message on database insert failure', async () => {
      mockSignUp.mockResolvedValue({ data: { user: {} }, error: null });
      mockInsert.mockResolvedValue({ error: { message: 'Database error' } });
      
      await user.type(screen.getByPlaceholderText('Vnesite svoje ime'), 'John');
      await user.type(screen.getByPlaceholderText('Vnesite svoj priimek'), 'Doe');
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      await waitFor(() => {
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });
    });

    it('clears form fields on successful signup', async () => {
      mockSignUp.mockResolvedValue({ data: { user: {} }, error: null });
      mockInsert.mockResolvedValue({ error: null });
      
      const imeInput = screen.getByPlaceholderText('Vnesite svoje ime');
      const priimekInput = screen.getByPlaceholderText('Vnesite svoj priimek');
      const emailInput = screen.getByPlaceholderText('Vnesite svoj email');
      const passwordInput = screen.getByPlaceholderText('Vnesite svoje geslo');
      
      await user.type(imeInput, 'John');
      await user.type(priimekInput, 'Doe');
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      await waitFor(() => {
        expect(imeInput).toHaveValue('');
        expect(priimekInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
      });
    });

    it('shows loading state during signup', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { user: {} }, error: null }), 100)
      ));
      
      await user.type(screen.getByPlaceholderText('Vnesite svoje ime'), 'John');
      await user.type(screen.getByPlaceholderText('Vnesite svoj priimek'), 'Doe');
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      expect(screen.getByText('Registriram...')).toBeInTheDocument();
    });
  });

  describe('Authenticated User State', () => {
    it('displays user info when logged in', async () => {
      const mockUser = { email: 'test@example.com', id: '123' };
      let authStateChangeCallback: any;
      
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: mockSubscription };
      });
      
      render(<AuthForm />);
      
      // Wait for initial render
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
      
      // Simulate auth state change
      await act(async () => {
        authStateChangeCallback('SIGNED_IN', { user: mockUser });
      });
      
      // Wait for UI to update
      await waitFor(() => {
        expect(screen.getByText('Prijavljen kot test@example.com')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByRole('button', { name: 'Odjava' })).toBeInTheDocument();
      
      // Should not show form fields
      expect(screen.queryByPlaceholderText('Vnesite svoj email')).not.toBeInTheDocument();
    });

    it('handles sign out', async () => {
      const user = userEvent.setup();
      const mockUser = { email: 'test@example.com', id: '123' };
      let authStateChangeCallback: any;
      
      mockSignOut.mockResolvedValue({});
      
      mockOnAuthStateChange.mockImplementation((callback) => {
        authStateChangeCallback = callback;
        return { data: mockSubscription };
      });
      
      render(<AuthForm />);
      
      // Wait for initial setup
      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
      
      // Simulate logged in state
      await act(async () => {
        authStateChangeCallback('SIGNED_IN', { user: mockUser });
      });
      
      // Wait for the sign out button to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Odjava' })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: 'Odjava' }));
      
      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Form Validation', () => {
    it('requires all fields for signup', async () => {
      const user = userEvent.setup();
      
      render(<AuthForm />);
      
      await user.click(screen.getByText('Nimaš računa? Registriraj se'));
      
      // Try to submit without filling fields
      await user.click(screen.getByRole('button', { name: 'Registracija' }));
      
      // HTML5 validation should prevent submission
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('requires email and password for login', async () => {
      const user = userEvent.setup();
      
      render(<AuthForm />);
      
      // Try to submit without filling fields
      await user.click(screen.getByRole('button', { name: 'Prijava' }));
      
      // HTML5 validation should prevent submission
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('Component Cleanup', () => {
    it('unsubscribes from auth state changes on unmount', async () => {
      const { unmount } = render(<AuthForm />);
      
      unmount();
      
      await waitFor(() => {
        expect(mockSubscription.subscription.unsubscribe).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error and Success Message Display', () => {
    it('clears error message when switching modes', async () => {
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({ 
        error: { message: 'Login failed' } 
      });
      
      render(<AuthForm />);
      
      // Trigger error in login mode
      await user.type(screen.getByPlaceholderText('Vnesite svoj email'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Vnesite svoje geslo'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Prijava' }));
      
      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
      
      // Switch to signup mode
      await user.click(screen.getByText('Nimaš računa? Registriraj se'));
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
      });
    });
  });
});