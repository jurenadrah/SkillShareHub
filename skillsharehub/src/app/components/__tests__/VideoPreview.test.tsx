import { render, screen, fireEvent } from '@testing-library/react'
import VideoPreview from '../VideoPreview'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('VideoPreview Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const defaultProps = {
    title: 'Test Video Title',
    duration: '10:30'
  }

  test('renders with title and duration when no image is provided', () => {
    render(<VideoPreview {...defaultProps} />)
    
    expect(screen.getByText('Test Video Title / 10:30')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /preberi več o skillsharehub-u/i })).toBeInTheDocument()
  })

  test('renders with image when imageUrl is provided', () => {
    const propsWithImage = {
      ...defaultProps,
      imageUrl: 'https://example.com/test-image.jpg'
    }
    
    render(<VideoPreview {...propsWithImage} />)
    
    const image = screen.getByRole('img', { name: defaultProps.title })
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    expect(image).toHaveAttribute('alt', defaultProps.title)
    
    // Title/duration text should not be visible when image is shown
    expect(screen.queryByText('Test Video Title / 10:30')).not.toBeInTheDocument()
  })

  test('navigates to /about when "Preberi več" button is clicked', () => {
    render(<VideoPreview {...defaultProps} />)
    
    const learnMoreButton = screen.getByRole('button', { name: /preberi več o skillsharehub-u/i })
    fireEvent.click(learnMoreButton)
    
    expect(mockPush).toHaveBeenCalledWith('/about')
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  test('applies correct CSS classes for styling', () => {
    render(<VideoPreview {...defaultProps} />)
    
    const container = screen.getByText('Test Video Title / 10:30').closest('div')
    expect(container).toHaveClass('bg-black', 'text-white', 'h-[200px]', 'flex', 'items-center', 'justify-center')
    
    const button = screen.getByRole('button', { name: /preberi več o skillsharehub-u/i })
    expect(button).toHaveClass('absolute', 'bottom-2', 'left-2', 'bg-white', 'text-black', 'px-3', 'py-1', 'text-sm', 'rounded', 'opacity-90', 'group-hover:opacity-100', 'transition-opacity')
  })

  test('image has correct CSS classes when imageUrl is provided', () => {
    const propsWithImage = {
      ...defaultProps,
      imageUrl: 'https://example.com/test-image.jpg'
    }
    
    render(<VideoPreview {...propsWithImage} />)
    
    const imageContainer = screen.getByRole('img').closest('div')
    expect(imageContainer).toHaveClass('bg-black', 'h-[200px]', 'overflow-hidden')
    
    const image = screen.getByRole('img')
    expect(image).toHaveClass('w-full', 'h-full', 'object-cover')
  })

  test('renders with different title and duration values', () => {
    const customProps = {
      title: 'Advanced React Patterns',
      duration: '25:15'
    }
    
    render(<VideoPreview {...customProps} />)
    
    expect(screen.getByText('Advanced React Patterns / 25:15')).toBeInTheDocument()
  })

  test('button maintains accessibility attributes', () => {
    render(<VideoPreview {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /preberi več o skillsharehub-u/i })
    
    // Button should be focusable and clickable
    expect(button).toBeEnabled()
    expect(button.tagName).toBe('BUTTON')
  })

  test('image has proper alt text for accessibility', () => {
    const propsWithImage = {
      ...defaultProps,
      title: 'Learn TypeScript Basics',
      imageUrl: 'https://example.com/typescript-video.jpg'
    }
    
    render(<VideoPreview {...propsWithImage} />)
    
    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('alt', 'Learn TypeScript Basics')
  })

  test('component structure remains consistent', () => {
    const { container } = render(<VideoPreview {...defaultProps} />)
    
    // Root container should have relative and group classes
    const rootContainer = container.firstChild as HTMLElement
    expect(rootContainer).toHaveClass('relative', 'group')
  })

  test('handles special characters in title and duration', () => {
    const specialProps = {
      title: 'React & TypeScript: Advanced Concepts!',
      duration: '1:05:30'
    }
    
    render(<VideoPreview {...specialProps} />)
    
    expect(screen.getByText('React & TypeScript: Advanced Concepts! / 1:05:30')).toBeInTheDocument()
  })
})