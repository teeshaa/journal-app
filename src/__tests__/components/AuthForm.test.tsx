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
    signInWithMagicLink: jest.fn()
  }
}))

describe('AuthForm', () => {
  const { auth } = require('@/lib/supabase')
  const toast = require('react-hot-toast').default

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the initial form correctly', () => {
    render(<AuthForm />)
    
    expect(screen.getByText('Welcome to Next Iteration')).toBeInTheDocument()
    expect(screen.getByText('Sign in with your email to begin your leadership growth journey')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument()
  })

  it('validates email input correctly', async () => {
    render(<AuthForm />)
    
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    // Test empty email
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter your email address')
    })

    // Test invalid email
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address')
    })
  })

  it('sends magic link successfully', async () => {
    auth.signInWithMagicLink.mockResolvedValue({ error: null })
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(auth.signInWithMagicLink).toHaveBeenCalledWith('test@example.com')
      expect(toast.success).toHaveBeenCalledWith('🎉 Magic link sent! Check your email', expect.any(Object))
    })
  })

  it('handles authentication errors gracefully', async () => {
    const errorMessage = 'Authentication failed'
    auth.signInWithMagicLink.mockRejectedValue(new Error(errorMessage))
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('shows success state after sending magic link', async () => {
    auth.signInWithMagicLink.mockResolvedValue({ error: null })
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Check your email!')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText(/We've sent a magic link to/)).toBeInTheDocument()
    })
  })

  it('allows user to use different email from success state', async () => {
    auth.signInWithMagicLink.mockResolvedValue({ error: null })
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    // Send initial magic link
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Check your email!')).toBeInTheDocument()
    })
    
    // Click "Use a different email"
    const differentEmailButton = screen.getByText('Use a different email')
    fireEvent.click(differentEmailButton)
    
    // Should return to form
    expect(screen.getByText('Welcome to Next Iteration')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    // Mock delayed response
    auth.signInWithMagicLink.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    // Should show loading state
    expect(screen.getByRole('button', { name: /sending.../i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('handles network errors appropriately', async () => {
    // Mock network error
    auth.signInWithMagicLink.mockRejectedValue(new Error('Network error'))
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
    })
  })

  it('maintains accessibility standards', () => {
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('prevents multiple submissions', async () => {
    auth.signInWithMagicLink.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<AuthForm />)
    
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    const submitButton = screen.getByRole('button', { name: /continue with email/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    // Click multiple times rapidly
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)
    
    // Should only call API once
    await waitFor(() => {
      expect(auth.signInWithMagicLink).toHaveBeenCalledTimes(1)
    })
  })
}) 