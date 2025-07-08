import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '@/components/AuthForm'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    error: jest.fn(),
    success: jest.fn(),
  }
}))

// Mock the auth module
jest.mock('@/lib/supabase', () => ({
  auth: {
    signInWithMagicLink: jest.fn(),
    signInWithOtp: jest.fn(),
    signUpWithOtp: jest.fn(),
  }
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
      div: ({ children }: { children: any }) => <div>{children}</div>,
      button: ({ children, onClick, disabled }: { children: any, onClick: any, disabled: any }) => <button onClick={onClick} disabled={disabled}>{children}</button>,
    },
    AnimatePresence: ({ children }: { children: any }) => <div>{children}</div>,
}));

describe('AuthForm', () => {
  const { auth } = require('@/lib/supabase')
  const toast = require('react-hot-toast').default

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign-in form by default', () => {
    render(<AuthForm />);
    expect(screen.getByText('Join the community of forward-thinking leaders')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your-email@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Magic Link' })).toBeInTheDocument();
  });

  it('switches to sign-up view when "Create one" is clicked', () => {
    render(<AuthForm />);
    fireEvent.click(screen.getByText('Create one'));
    expect(screen.getByText('Get started with your leadership journal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your-email@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up & Get Magic Link' })).toBeInTheDocument();
  });

  it('calls the signInWithOtp function on sign-in', async () => {
    (auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });
    render(<AuthForm />);
    
    fireEvent.change(screen.getByPlaceholderText('your-email@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Magic Link' }));

    await waitFor(() => {
      expect(auth.signInWithOtp).toHaveBeenCalledWith('test@example.com');
      expect(toast.success).toHaveBeenCalledWith('Magic link sent! Check your email to sign in.', expect.any(Object));
    });
  });

  it('calls the signUpWithOtp function on sign-up', async () => {
    (auth.signUpWithOtp as jest.Mock).mockResolvedValue({ error: null });
    render(<AuthForm />);
    fireEvent.click(screen.getByText('Create one'));

    fireEvent.change(screen.getByPlaceholderText('your-email@example.com'), { target: { value: 'new-user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up & Get Magic Link' }));

    await waitFor(() => {
      expect(auth.signUpWithOtp).toHaveBeenCalledWith('new-user@example.com');
      expect(toast.success).toHaveBeenCalledWith('Welcome! Check your email for the magic link to get started.', expect.any(Object));
    });
  });

  it('shows an error toast if sign-in fails', async () => {
    (auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: { message: 'Invalid email' } });
    render(<AuthForm />);

    fireEvent.change(screen.getByPlaceholderText('your-email@example.com'), { target: { value: 'invalid@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send Magic Link' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to send magic link: Invalid email', expect.any(Object));
    });
  });
}) 