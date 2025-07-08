import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemePicker, type ValidTheme } from '@/components/ThemePicker'

// Mock the auth module
jest.mock('@/lib/supabase', () => ({
  auth: {
    getSession: jest.fn().mockResolvedValue({ session: null, error: null }),
  }
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  default: {
    success: jest.fn(),
    error: jest.fn(),
  }
}))

describe('ThemePicker', () => {
  const mockOnThemeSelect = jest.fn()
  const mockOnPromptGenerated = jest.fn()

  beforeEach(() => {
    mockOnThemeSelect.mockClear()
    mockOnPromptGenerated.mockClear()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders all theme options with correct titles', () => {
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    expect(screen.getByText('Technology Impact')).toBeInTheDocument()
    expect(screen.getByText('Delivery Impact')).toBeInTheDocument() 
    expect(screen.getByText('Business Impact')).toBeInTheDocument()
    expect(screen.getByText('Team Impact')).toBeInTheDocument()
    expect(screen.getByText('Org Impact')).toBeInTheDocument()
  })

  it('renders theme descriptions', () => {
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    expect(screen.getByText(/technical decisions and engineering excellence/)).toBeInTheDocument()
    expect(screen.getByText(/project delivery and process optimization/)).toBeInTheDocument()
    expect(screen.getByText(/strategic thinking and business value/)).toBeInTheDocument()
    expect(screen.getByText(/leadership and team dynamics/)).toBeInTheDocument()
    expect(screen.getByText(/organizational influence and culture/)).toBeInTheDocument()
  })

  it('calls onThemeSelect when a theme is clicked', async () => {
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const technologyTheme = screen.getByText('Technology Impact').closest('button')
    fireEvent.click(technologyTheme!)
    
    expect(mockOnThemeSelect).toHaveBeenCalledWith('technology_impact')
    expect(mockOnThemeSelect).toHaveBeenCalledTimes(1)
  })

  it('shows selected state for chosen theme with amber styling', () => {
    const selectedTheme: ValidTheme = 'technology_impact'
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={selectedTheme} 
      />
    )
    
    const selectedButton = screen.getByText('Technology Impact').closest('button')
    expect(selectedButton).toHaveClass('border-amber-500')
  })

  it('has proper accessibility attributes', () => {
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const buttons = screen.getAllByRole('button')
    // Filter out any other buttons that might be in the component
    const themeButtons = buttons.filter(button => 
      button.textContent?.includes('Impact')
    )
    
    themeButtons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('generates prompt automatically when theme is selected', async () => {
    // Mock successful API response
    const mockResponse = {
      prompt: 'What technical decision did you make this week?',
      theme: 'technology_impact',
      themeTitle: 'Technology Impact'
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse)
    })

    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const technologyTheme = screen.getByText('Technology Impact').closest('button')
    fireEvent.click(technologyTheme!)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/generate-prompt', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'technology_impact' })
      }))
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock failed API response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValueOnce({ error: 'Server error' })
    })

    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const technologyTheme = screen.getByText('Technology Impact').closest('button')
    fireEvent.click(technologyTheme!)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled()
    })
    
    // Should still call onThemeSelect even if prompt generation fails
    expect(mockOnThemeSelect).toHaveBeenCalledWith('technology_impact')
  })

  it('handles all valid themes', () => {
    const validThemes: ValidTheme[] = [
      'technology_impact',
      'delivery_impact', 
      'business_impact',
      'team_impact',
      'org_impact'
    ]

    validThemes.forEach(theme => {
      const { unmount } = render(
        <ThemePicker 
          onThemeSelect={mockOnThemeSelect} 
          onPromptGenerated={mockOnPromptGenerated}
          selectedTheme={theme} 
        />
      )
      
      const selectedButton = screen.getByText(new RegExp(theme.replace('_', ' '), 'i')).closest('button')
      expect(selectedButton).toHaveClass('border-amber-500')
      
      unmount()
    })
  })

  it('shows loading state during prompt generation', async () => {
    // Mock delayed API response
    let resolvePromise: (value: any) => void
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    ;(fetch as jest.Mock).mockReturnValueOnce(delayedPromise)

    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const technologyTheme = screen.getByText('Technology Impact').closest('button')
    fireEvent.click(technologyTheme!)
    
    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
    
    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        prompt: 'Test prompt',
        theme: 'technology_impact'
      })
    })
    
    // Loading should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  it('renders in 2-column grid layout', () => {
    render(
      <ThemePicker 
        onThemeSelect={mockOnThemeSelect} 
        onPromptGenerated={mockOnPromptGenerated}
        selectedTheme={null} 
      />
    )
    
    const gridContainer = screen.getByTestId('theme-grid')
    expect(gridContainer).toHaveClass('grid-cols-2')
  })
}) 