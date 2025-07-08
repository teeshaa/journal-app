import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemePicker } from '@/components/ThemePicker'

// Mock the API endpoint
global.fetch = jest.fn()

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}))

describe('ThemePicker', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('renders all five themes', () => {
    render(<ThemePicker onThemeSelect={() => {}} />)
    expect(screen.getByText('Technology Impact')).toBeInTheDocument()
    expect(screen.getByText('Delivery Impact')).toBeInTheDocument()
    expect(screen.getByText('Business Impact')).toBeInTheDocument()
    expect(screen.getByText('Team Impact')).toBeInTheDocument()
    expect(screen.getByText('Organizational Impact')).toBeInTheDocument()
  })

  it('calls onThemeSelect and fetches a prompt when a theme is clicked', async () => {
    const onThemeSelect = jest.fn()
    const mockPrompt = 'This is a test prompt.'

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ prompt: mockPrompt }),
    })

    render(<ThemePicker onThemeSelect={onThemeSelect} />)

    fireEvent.click(screen.getByText('Technology Impact'))

    // Shows loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    // Calls onThemeSelect with the theme and prompt
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: 'technology_impact' }),
      })
      expect(onThemeSelect).toHaveBeenCalledWith('technology_impact', mockPrompt)
    })
  })

  it('handles API error when fetching prompt fails', async () => {
    const onThemeSelect = jest.fn()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    })

    render(<ThemePicker onThemeSelect={onThemeSelect} />)

    fireEvent.click(screen.getByText('Team Impact'))

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to generate prompt for:', 'team_impact')
    })
    
    // onThemeSelect should still be called, but without a prompt
    expect(onThemeSelect).toHaveBeenCalledWith('team_impact', '')
    consoleErrorSpy.mockRestore()
  })

  it('applies selected styles to the clicked theme', async () => {
    render(<ThemePicker onThemeSelect={() => {}} />)
    const themeButton = screen.getByText('Business Impact').closest('button')

    fireEvent.click(themeButton!)

    await waitFor(() => {
      expect(themeButton).toHaveClass('border-amber-500')
    })
  })
}) 