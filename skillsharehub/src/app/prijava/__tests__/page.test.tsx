import React from 'react';
import { render, screen } from '@testing-library/react';
import PrijavaPage from '../page';

jest.mock('@/app/components/AuthForm.tsx', () => () => <div>Mock AuthForm</div>);

describe('PrijavaPage', () => {
  it('renders AuthForm component', () => {
    render(<PrijavaPage />);
    expect(screen.getByText('Mock AuthForm')).toBeInTheDocument();
  });
});