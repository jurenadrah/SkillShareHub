import React from 'react';
import { render, screen } from '@testing-library/react';
import StudentPage from '../page';

jest.mock('@/app/components/StudentProfile', () => () => <div>Mock StudentProfile</div>);

describe('StudentPage', () => {
  it('renders StudentProfile component', () => {
    render(<StudentPage />);
    expect(screen.getByText('Mock StudentProfile')).toBeInTheDocument();
  });
});
