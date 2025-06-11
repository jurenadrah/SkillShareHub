import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Hero from '../Hero';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Hero Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    mockPush.mockClear();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  test('renders hero section with correct content', () => {
    render(<Hero />);
    
    // Check if title is rendered
    expect(screen.getByText('SkillShareHub')).toBeInTheDocument();
    
    // Check if button is rendered
    expect(screen.getByText('➤ Rešuj interaktivne naloge')).toBeInTheDocument();
    
    // Check if image is rendered with correct alt text
    expect(screen.getByAltText('Hero background')).toBeInTheDocument();
  });

  test('navigates to playbook when button is clicked', () => {
    render(<Hero />);
    
    // Find and click the button
    const button = screen.getByText('➤ Rešuj interaktivne naloge');
    fireEvent.click(button);
    
    // Check if router.push was called with correct path
    expect(mockPush).toHaveBeenCalledWith('/playbook');
  });

  test('image has correct src attribute', () => {
    render(<Hero />);
    
    const image = screen.getByAltText('Hero background');
    expect(image).toHaveAttribute('src', '/main_photo.jpg');
  });
});