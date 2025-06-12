
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileReadOnly from '../[id]/page' // Adjust path if needed

jest.mock('@/app/components/TutorProfile', () => () => <div>Mock TutorProfile</div>);

describe('TutorPage', () => {
  it('renders TutorProfile component', () => {
    render(<ProfileReadOnly />);
    expect(screen.getByText('Mock TutorProfile')).toBeInTheDocument();
  });
});

//ne dela