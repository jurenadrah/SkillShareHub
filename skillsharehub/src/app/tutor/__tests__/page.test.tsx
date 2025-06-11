import React from 'react';
import { render, screen } from '@testing-library/react';
import TutorPage from '../page';

jest.mock('@/app/components/TutorProfile', () => () => <div>Mock TutorProfile</div>);

describe('TutorPage', () => {
  it('renders TutorProfile component', () => {
    render(<TutorPage />);
    expect(screen.getByText('Mock TutorProfile')).toBeInTheDocument();
  });
});
