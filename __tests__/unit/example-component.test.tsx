import { render, screen } from '@testing-library/react'

// Simple test component
function TestComponent({ message }: { message: string }) {
  return <div data-testid="test-component">{message}</div>
}

describe('React Component Testing', () => {
  it('should render a component with Testing Library', () => {
    render(<TestComponent message="Hello Vitest!" />)

    const element = screen.getByTestId('test-component')
    expect(element).toBeInTheDocument()
    expect(element).toHaveTextContent('Hello Vitest!')
  })

  it('should find elements by text', () => {
    render(<TestComponent message="Welcome to GPF Nettoyage" />)

    expect(screen.getByText('Welcome to GPF Nettoyage')).toBeInTheDocument()
  })
})
