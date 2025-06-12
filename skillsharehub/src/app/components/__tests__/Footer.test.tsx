import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from '../Footer';

// Spremenljivka za prestrezanje href
let href = "";

beforeAll(() => {
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = {
    set href(val: string) {
      href = val;
    },
    get href() {
      return href;
    }
  };
});

beforeEach(() => {
  href = "";
});

describe('Footer', () => {
  test('renders logo image', () => {
    render(<Footer />);
    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();
  });

  test('renders clickable email with correct mailto', () => {
    render(<Footer />);
    const emailLink = screen.getByText('info@skillsharehub.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute(
      'href',
      'mailto:globes_rough.4q@icloud.com'
    );
  });

  test('renders newsletter form and contact form', () => {
    render(<Footer />);
    const emailInputs = screen.getAllByPlaceholderText('Email *');
    expect(emailInputs.length).toBe(2);

    expect(screen.getByPlaceholderText('Ime *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Priimek *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Zadeva')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sporočilo...')).toBeInTheDocument();
  });

  test('newsletter form triggers mailto on submit', () => {
    render(<Footer />);
    const emailInput = screen.getAllByPlaceholderText('Email *')[0];
    const button = screen.getByText('Naroči se');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    expect(href).toContain('mailto:globes_rough.4q@icloud.com');
    expect(href).toContain('test%40example.com');
  });

  test('contact form triggers mailto on submit', () => {
    render(<Footer />);
    const nameInput = screen.getByPlaceholderText('Ime *');
    const surnameInput = screen.getByPlaceholderText('Priimek *');
    const emailInput = screen.getAllByPlaceholderText('Email *')[1];
    const subjectInput = screen.getByPlaceholderText('Zadeva');
    const messageInput = screen.getByPlaceholderText('Sporočilo...');
    const sendButton = screen.getByText('Pošlji');

    fireEvent.change(nameInput, { target: { value: 'Janez' } });
    fireEvent.change(surnameInput, { target: { value: 'Novak' } });
    fireEvent.change(emailInput, { target: { value: 'janez@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Pozdrav' } });
    fireEvent.change(messageInput, { target: { value: 'To je testno sporočilo.' } });

    fireEvent.click(sendButton);

    expect(href).toContain('mailto:globes_rough.4q@icloud.com');
    expect(href).toContain('Janez');
    expect(href).toContain('Novak');
    expect(href).toContain('janez%40example.com');
    expect(href).toContain('Pozdrav');
    expect(href).toContain('To%20je%20testno%20sporo%C4%8Dilo.');
  });
});