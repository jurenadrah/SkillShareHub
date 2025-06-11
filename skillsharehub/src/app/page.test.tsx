import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from './page';

jest.mock('@/app/components/Home', () => () => <div>Mock Home</div>);

describe('Page (Home)', () => {
  it('renders Home component', () => {
    render(<Page />);
    expect(screen.getByText('Mock Home')).toBeInTheDocument();
  });
});
