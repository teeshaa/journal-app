import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StreakWidget } from '@/components/StreakWidget';
import { auth, journalService } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  auth: {
    getUser: jest.fn(),
  },
  journalService: {
    getStreakData: jest.fn(),
  },
}));

jest.mock('@/lib/utils', () => ({
    getMotivationalMessage: (streak: number) => {
        if (streak === 0) return 'Start your reflection journey! ✨';
        if (streak === 1) return 'Great start! One day at a time 💪';
        if (streak < 7) return `Building momentum: ${streak} days! 🔥`;
        if (streak < 30) return `Incredible! ${streak} days of insights 🧠`;
        return `Over a month of consistency! 🚀`;
    },
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style }: { children: any, style: any }) => <div style={style}>{children}</div>,
    button: ({ children, onClick }: { children: any, onClick: any }) => <button onClick={onClick}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: any }) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    Flame: () => <svg>Flame</svg>,
    Award: () => <svg>Award</svg>,
    Target: () => <svg>Target</svg>,
    TrendingUp: () => <svg>TrendingUp</svg>,
    Calendar: () => <svg>Calendar</svg>,
  };
});

describe('StreakWidget', () => {
  beforeEach(() => {
    (journalService.getStreakData as jest.Mock).mockClear();
    (auth.getUser as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (journalService.getStreakData as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<StreakWidget />);
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();
  });

  it('renders empty state when there is no user', async () => {
    (auth.getUser as jest.Mock).mockResolvedValue({ user: null });
    render(<StreakWidget />);
    await waitFor(() => {
      expect(screen.getByText('Sign in to track your streak.')).toBeInTheDocument();
    });
  });

  it('displays the current and longest streak correctly', async () => {
    const streakData = {
      currentStreak: 5,
      longestStreak: 10,
      totalEntries: 25,
      entriesThisWeek: 3,
      activity: { '2024-01-15': 2 }
    };
    (auth.getUser as jest.Mock).mockResolvedValue({ user: { id: 'test-user' } });
    (journalService.getStreakData as jest.Mock).mockResolvedValue(streakData);
    render(<StreakWidget />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (auth.getUser as jest.Mock).mockResolvedValue({ user: { id: 'test-user' } });
    (journalService.getStreakData as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<StreakWidget />);

    await waitFor(() => {
      expect(screen.getByText('Could not load streak data.')).toBeInTheDocument();
    });
  });

  it.each([
    { streak: 0, message: 'Start your reflection journey! ✨' },
    { streak: 1, message: 'Great start! One day at a time 💪' },
    { streak: 5, message: 'Building momentum: 5 days! 🔥' },
    { streak: 15, message: 'Incredible! 15 days of insights 🧠' },
    { streak: 35, message: 'Over a month of consistency! 🚀' },
  ])('displays motivational messages based on streak length ($streak days)', async ({ streak, message }) => {
    const streakData = {
      currentStreak: streak,
      longestStreak: streak,
      totalEntries: streak,
      entriesThisWeek: streak > 0 ? 1 : 0,
      activity: streak > 0 ? { '2024-01-15': 1 } : {},
    };
    (auth.getUser as jest.Mock).mockResolvedValue({ user: { id: 'test-user' } });
    (journalService.getStreakData as jest.Mock).mockResolvedValue(streakData);
    
    render(<StreakWidget />);

    await waitFor(() => {
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });
}); 