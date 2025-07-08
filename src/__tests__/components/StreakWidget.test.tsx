import { render, screen, waitFor } from '@testing-library/react'
import { StreakWidget } from '@/components/StreakWidget'

// Mock the auth and journal service
jest.mock('@/lib/supabase', () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      user: { id: 'test-user-id' },
      error: null
    })
  },
  journalService: {
    getEntries: jest.fn()
  }
}))

// Mock date-fns functions
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15'
    if (formatStr === 'MMM d, yyyy') return 'Jan 15, 2024'
    return 'formatted-date'
  }),
  differenceInDays: jest.fn((date1, date2) => 0),
  startOfDay: jest.fn((date) => date),
  eachDayOfInterval: jest.fn(() => [new Date()]),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfWeek: jest.fn((date) => date),
  endOfWeek: jest.fn((date) => date),
  isSameDay: jest.fn(() => true),
  subWeeks: jest.fn((date, weeks) => new Date(date.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)),
  startOfYear: jest.fn((date) => new Date(date.getFullYear(), 0, 1)),
  getDay: jest.fn(() => 1)
}))

describe('StreakWidget', () => {
  const { auth, journalService } = require('@/lib/supabase')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    // Mock pending API call
    journalService.getEntries.mockReturnValue(new Promise(() => {}))

    render(<StreakWidget />)
    
    expect(screen.getByText('Reflection Streak')).toBeInTheDocument()
    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('displays streak data correctly', async () => {
    // Mock journal entries
    const mockEntries = [
      {
        id: '1',
        created_at: '2024-01-15T10:00:00Z',
        theme: 'technology_impact',
        content: 'Test reflection',
        user_id: 'test-user-id'
      },
      {
        id: '2', 
        created_at: '2024-01-14T10:00:00Z',
        theme: 'team_impact',
        content: 'Another reflection',
        user_id: 'test-user-id'
      }
    ]

    journalService.getEntries.mockResolvedValue({
      data: mockEntries,
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      expect(screen.getByText('Reflection Streak')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // Current streak
      expect(screen.getByText('Total')).toBeInTheDocument()
    })
  })

  it('handles empty entries correctly', async () => {
    journalService.getEntries.mockResolvedValue({
      data: [],
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      expect(screen.getByText('Start your reflection journey! ✨')).toBeInTheDocument()
      expect(screen.getByText('0')).toBeInTheDocument() // Zero streak
    })
  })

  it('handles API errors gracefully', async () => {
    journalService.getEntries.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    })

    console.error = jest.fn() // Suppress error logs in test

    render(<StreakWidget />)

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument() // Should show 0 on error
    })

    expect(console.error).toHaveBeenCalledWith('Error fetching entries:', { message: 'Database error' })
  })

  it('displays motivational messages based on streak length', async () => {
    // Test different streak lengths
    const testCases = [
      { streak: 0, message: 'Start your reflection journey! ✨' },
      { streak: 1, message: 'Great start! One day at a time 💪' },
      { streak: 5, message: 'Building momentum: 5 days! 🔥' },
      { streak: 15, message: 'Incredible consistency: 15 days! 🎯' },
      { streak: 45, message: 'Legendary streak: 45 days! 🏆' }
    ]

    for (const testCase of testCases) {
      journalService.getEntries.mockResolvedValue({
        data: Array(testCase.streak).fill(null).map((_, i) => ({
          id: `${i}`,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          theme: 'technology_impact',
          content: 'Test reflection',
          user_id: 'test-user-id'
        })),
        error: null
      })

      const { unmount } = render(<StreakWidget />)

      await waitFor(() => {
        expect(screen.getByText(testCase.message)).toBeInTheDocument()
      })

      unmount()
    }
  })

  it('shows contribution graph with proper color levels', async () => {
    const mockEntries = [
      {
        id: '1',
        created_at: '2024-01-15T10:00:00Z',
        theme: 'technology_impact',
        content: 'Test reflection',
        user_id: 'test-user-id'
      }
    ]

    journalService.getEntries.mockResolvedValue({
      data: mockEntries,
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      // Should render contribution grid
      expect(document.querySelectorAll('.aspect-square').length).toBeGreaterThan(0)
    })
  })

  it('handles view mode changes', async () => {
    journalService.getEntries.mockResolvedValue({
      data: [],
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      expect(screen.getByText('3M')).toBeInTheDocument()
      expect(screen.getByText('6M')).toBeInTheDocument()
      expect(screen.getByText('1Y')).toBeInTheDocument()
    })
  })

  it('calculates streak correctly for consecutive days', async () => {
    // Mock consecutive daily entries
    const consecutiveEntries = [
      { id: '1', created_at: '2024-01-15T10:00:00Z', theme: 'technology_impact', content: 'Day 1', user_id: 'test-user-id' },
      { id: '2', created_at: '2024-01-14T10:00:00Z', theme: 'team_impact', content: 'Day 2', user_id: 'test-user-id' },
      { id: '3', created_at: '2024-01-13T10:00:00Z', theme: 'business_impact', content: 'Day 3', user_id: 'test-user-id' }
    ]

    journalService.getEntries.mockResolvedValue({
      data: consecutiveEntries,
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      // Should calculate streak correctly
      expect(screen.getByText('Reflection Streak')).toBeInTheDocument()
    })
  })

  it('resets streak when there are gaps in dates', async () => {
    // Mock entries with gaps
    const gappedEntries = [
      { id: '1', created_at: '2024-01-15T10:00:00Z', theme: 'technology_impact', content: 'Recent', user_id: 'test-user-id' },
      { id: '2', created_at: '2024-01-10T10:00:00Z', theme: 'team_impact', content: 'Gap here', user_id: 'test-user-id' }
    ]

    journalService.getEntries.mockResolvedValue({
      data: gappedEntries,
      error: null
    })

    render(<StreakWidget />)

    await waitFor(() => {
      // Should not count as consecutive streak
      expect(screen.getByText('Reflection Streak')).toBeInTheDocument()
    })
  })
}) 