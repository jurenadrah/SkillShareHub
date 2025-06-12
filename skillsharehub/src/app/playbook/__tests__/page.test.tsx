import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaybookPage from '../page';

// Mock the CSS module to avoid className issues
jest.mock('./playbook.module.css', () => new Proxy({}, {
  get: (target, prop) => prop,
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      question: 'Kaj je 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 'B',
      explanation: '2 + 2 je enako 4.',
    }),
  }) as jest.MockedFunction<any>;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the initial subject and category and loads an exercise', async () => {
  render(<PlaybookPage />);

  // Wait for exercise to load
  await waitFor(() => {
    expect(screen.getByText('Kaj je 2 + 2?')).toBeInTheDocument();
  });

  // Check subject heading
  expect(screen.getByText(/Matematika – Kvadratne enačbe/)).toBeInTheDocument();
});

test('allows changing subject and category', async () => {
  render(<PlaybookPage />);

  // Wait for initial exercise to load
  await waitFor(() => screen.getByText('Kaj je 2 + 2?'));

  // Click on a new subject
  fireEvent.click(screen.getByText('Programiranje'));

  // The category list should update (automatically selects first)
  expect(await screen.findByText(/Programiranje – Spremenljivke/)).toBeInTheDocument();
});

test('displays answer feedback after selection', async () => {
  render(<PlaybookPage />);

  await waitFor(() => screen.getByText('Kaj je 2 + 2?'));

  // Click correct answer (B => index 1)
  fireEvent.click(screen.getByText('B)'));

  expect(await screen.findByText(/Pravilno!/)).toBeInTheDocument();
});
