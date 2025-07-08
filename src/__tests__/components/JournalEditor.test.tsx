
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JournalEditor } from '@/components/JournalEditor';
import { journalService } from '@/lib/supabase';
import toast from 'react-hot-toast';

// Mocks
jest.mock('@/lib/supabase', () => ({
  journalService: {
    createEntry: jest.fn(),
  },
  auth: {
    getUser: jest.fn().mockResolvedValue({ user: { id: 'test-user' } }),
  },
  imageService: {
    validateImageFile: jest.fn().mockReturnValue({ isValid: true }),
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  }
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('JournalEditor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state without a selected theme', () => {
    render(<JournalEditor selectedTheme={null} />);
    expect(screen.getByText('Ready for Your Next Iteration')).toBeInTheDocument();
  });

  it('renders the editor when a theme and prompt are provided', () => {
    render(<JournalEditor selectedTheme="technology_impact" generatedPrompt="What is a tech challenge?" />);
    expect(screen.getByText('Your Growth Catalyst')).toBeInTheDocument();
    expect(screen.getByText('What is a tech challenge?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Share your thoughts/)).toBeInTheDocument();
  });

  it('disables the save button when there is no content', () => {
    render(<JournalEditor selectedTheme="team_impact" generatedPrompt="How is your team?" />);
    const saveButton = screen.getByRole('button', { name: /Complete your reflection/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables the save button when there is valid content', () => {
    render(<JournalEditor selectedTheme="team_impact" generatedPrompt="How is your team?" />);
    const editorTextarea = screen.getByPlaceholderText(/Share your thoughts/);
    fireEvent.input(editorTextarea, { target: { value: 'This is a test entry that is long enough to be valid.' } });
    const saveButton = screen.getByRole('button', { name: /Save Reflection/i });
    expect(saveButton).toBeEnabled();
  });

  it('shows a toast error when trying to save with content less than 10 characters', async () => {
    render(<JournalEditor selectedTheme="team_impact" generatedPrompt="How is your team?" />);
    const editorTextarea = screen.getByPlaceholderText(/Share your thoughts/);
    fireEvent.input(editorTextarea, { target: { value: 'short' } });
    
    // The button is enabled because hasContent is true, but validation will fail
    const saveButton = screen.getByRole('button', { name: /Save Reflection/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Your reflection must be at least 10 characters long', expect.any(Object));
    });
  });

  it('successfully saves a journal entry with valid content', async () => {
    (journalService.createEntry as jest.Mock).mockResolvedValue({ error: null });
    render(<JournalEditor selectedTheme="business_impact" generatedPrompt="What is the business impact?" />);
    
    const editorTextarea = screen.getByPlaceholderText(/Share your thoughts/);
    fireEvent.input(editorTextarea, { target: { value: 'This is a valid journal entry about business impact.' } });

    const saveButton = screen.getByRole('button', { name: /Save Reflection/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(journalService.createEntry).toHaveBeenCalledWith(expect.objectContaining({
        theme: 'business_impact',
        prompt: 'What is the business impact?',
        content: 'This is a valid journal entry about business impact.',
      }));
    });
    
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Reflection saved!'), expect.any(Object));
  });

  it('shows an error toast if saving fails on the backend', async () => {
    const errorMessage = 'Database error';
    (journalService.createEntry as jest.Mock).mockResolvedValue({ error: { message: errorMessage } });
    render(<JournalEditor selectedTheme="org_impact" generatedPrompt="What is the org impact?" />);

    const editorTextarea = screen.getByPlaceholderText(/Share your thoughts/);
    fireEvent.input(editorTextarea, { target: { value: 'This entry will fail to save.' } });

    const saveButton = screen.getByRole('button', { name: /Save Reflection/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(`Failed to save entry: Database error: ${errorMessage}`, expect.any(Object));
    });
  });
});

