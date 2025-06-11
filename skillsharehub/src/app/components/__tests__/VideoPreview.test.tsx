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