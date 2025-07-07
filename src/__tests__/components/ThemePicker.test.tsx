import { render, screen, fireEvent } from '@testing-library/react'
import { ThemePicker, type ValidTheme } from '@/components/ThemePicker'

describe('ThemePicker', () => {
  const mockOnThemeSelect = jest.fn()

  beforeEach(() => {
    mockOnThemeSelect.mockClear()
  })

  it('renders all theme options', () => {
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={null} />)
    
    expect(screen.getByText('Technology Impact')).toBeInTheDocument()
    expect(screen.getByText('Delivery Impact')).toBeInTheDocument()
    expect(screen.getByText('Business Impact')).toBeInTheDocument()
    expect(screen.getByText('Team Impact')).toBeInTheDocument()
    expect(screen.getByText('Org Impact')).toBeInTheDocument()
  })

  it('calls onThemeSelect when a theme is clicked', () => {
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={null} />)
    
    const technologyTheme = screen.getByText('Technology Impact').closest('button')
    fireEvent.click(technologyTheme!)
    
    expect(mockOnThemeSelect).toHaveBeenCalledWith('technology_impact')
    expect(mockOnThemeSelect).toHaveBeenCalledTimes(1)
  })

  it('shows selected state for chosen theme', () => {
    const selectedTheme: ValidTheme = 'technology_impact'
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={selectedTheme} />)
    
    const selectedButton = screen.getByText('Technology Impact').closest('button')
    expect(selectedButton).toHaveClass('border-warm-400')
  })

  it('shows guidance message when theme is selected', () => {
    const selectedTheme: ValidTheme = 'technology_impact'
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={selectedTheme} />)
    
    expect(screen.getByText(/Great choice!/)).toBeInTheDocument()
    expect(screen.getByText(/personalized reflection question for Technology Impact/)).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={null} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('aria-pressed')
      expect(button).toHaveAttribute('aria-describedby')
    })
  })

  it('updates internal state when theme is selected', () => {
    render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={null} />)
    
    const deliveryTheme = screen.getByText('Delivery Impact').closest('button')
    fireEvent.click(deliveryTheme!)
    
    expect(mockOnThemeSelect).toHaveBeenCalledWith('delivery_impact')
    
    // Check that the button becomes selected
    expect(deliveryTheme).toHaveClass('border-warm-400')
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
      const { unmount } = render(<ThemePicker onThemeSelect={mockOnThemeSelect} selectedTheme={theme} />)
      expect(screen.getByText(/Great choice!/)).toBeInTheDocument()
      unmount()
    })
  })
}) 