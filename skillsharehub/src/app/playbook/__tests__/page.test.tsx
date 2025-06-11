import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlaybookPage from '../page';

// Mock the CSS module
jest.mock('./playbook.module.css', () => ({
  playbookContainer: 'playbookContainer',
  sidebar: 'sidebar',
  content: 'content',
  active: 'active',
  loading: 'loading',
  error: 'error',
  exerciseBox: 'exerciseBox',
  questionHeader: 'questionHeader',
  newExerciseBtn: 'newExerciseBtn',
  questionText: 'questionText',
  answerSection: 'answerSection',
  answerInput: 'answerInput',
  buttonGroup: 'buttonGroup',
  checkBtn: 'checkBtn',
  feedback: 'feedback',
  correct: 'correct',
  incorrect: 'incorrect',
  nextBtn: 'nextBtn'
}));

// Mock fetch with proper type casting
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('PlaybookPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  it('renders initial state correctly', () => {
    render(<PlaybookPage />);
    expect(screen.getByText('Predmeti')).toBeInTheDocument();
    expect(screen.getByText('Kategorije')).toBeInTheDocument();
    expect(screen.getByText('Matematika')).toBeInTheDocument();
    expect(screen.getByText('Programiranje')).toBeInTheDocument();
    expect(screen.getByText('Informacijski sistemi')).toBeInTheDocument();
    expect(screen.getByText('Matematika – Kvadratne enačbe')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<PlaybookPage />);
    expect(screen.getByText('Generiram nalogo...')).toBeInTheDocument();
  });

  it('displays exercise when API call succeeds', async () => {
    const mockResponse = {
      question: 'Rešite enačbo: x² + 2x - 3 = 0',
      solution: 'x = 1 ali x = -3'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
      expect(screen.getByText(mockResponse.question)).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Vpiši odgovor...')).toBeInTheDocument();
    expect(screen.getByText('Preveri')).toBeInTheDocument();
  });

  it('displays error when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Prišlo je do napake pri generiranju naloge. Poskusite znova.')).toBeInTheDocument();
    });
  });

  it('changes subject and category when clicked', async () => {
    const mockResponse = { question: 'Test question', solution: 'Test solution' };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Programiranje'));

    await waitFor(() => {
      expect(screen.getByText('Programiranje – Spremenljivke')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Funkcije'));

    await waitFor(() => {
      expect(screen.getByText('Programiranje – Funkcije')).toBeInTheDocument();
    });
  });

  it('handles answer checking correctly', async () => {
    const mockResponse = { question: 'Test question', solution: 'correct answer' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Vpiši odgovor...');
    const checkButton = screen.getByText('Preveri');

    fireEvent.change(input, { target: { value: 'correct answer' } });
    fireEvent.click(checkButton);

    expect(screen.getByText('✅ Pravilno!')).toBeInTheDocument();
    expect(screen.getByText('Naslednja naloga')).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  it('handles incorrect answer', async () => {
    const mockResponse = { question: 'Test question', solution: 'correct answer' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Vpiši odgovor...');
    const checkButton = screen.getByText('Preveri');

    fireEvent.change(input, { target: { value: 'wrong answer' } });
    fireEvent.click(checkButton);

    expect(screen.getByText('❌ Napačno, poskusi znova')).toBeInTheDocument();
    expect(input).not.toBeDisabled();
  });

  it('generates new exercise when button is clicked', async () => {
    const mockResponse = { question: 'Test question', solution: 'Test solution' };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    const newExerciseButton = screen.getByText('Nova naloga');
    mockFetch.mockClear();
    fireEvent.click(newExerciseButton);

    expect(mockFetch).toHaveBeenCalledWith('/api/generate-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Matematika',
        category: 'Kvadratne enačbe',
        difficulty: 'medium'
      })
    });
  });

  it('disables check button when input is empty', async () => {
    const mockResponse = { question: 'Test question', solution: 'Test solution' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    const checkButton = screen.getByText('Preveri');
    expect(checkButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Vpiši odgovor...');
    fireEvent.change(input, { target: { value: 'some answer' } });

    expect(checkButton).not.toBeDisabled();
  });

  it('handles case insensitive answer checking', async () => {
    const mockResponse = { question: 'Test question', solution: 'Correct Answer' };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    render(<PlaybookPage />);

    await waitFor(() => {
      expect(screen.getByText('Naloga')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Vpiši odgovor...');
    const checkButton = screen.getByText('Preveri');

    fireEvent.change(input, { target: { value: 'correct answer' } });
    fireEvent.click(checkButton);

    expect(screen.getByText('✅ Pravilno!')).toBeInTheDocument();
  });
});
