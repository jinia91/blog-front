import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ErrorBoundary from '../error-boundary'
import React from 'react'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeDefined()
  })

  it('should render error UI when child component throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('문제가 발생했습니다')).toBeDefined()
    expect(screen.getByText('페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.')).toBeDefined()
    expect(screen.getByText('다시 시도')).toBeDefined()

    consoleError.mockRestore()
  })

  it('should have dark theme styling', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorContainer = container.querySelector('.bg-gray-900')
    expect(errorContainer).toBeDefined()

    const errorCard = container.querySelector('.bg-gray-800')
    expect(errorCard).toBeDefined()

    const greenBorder = container.querySelector('.border-green-400')
    expect(greenBorder).toBeDefined()

    consoleError.mockRestore()
  })

  it('should show error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error')).toBeDefined()

    consoleError.mockRestore()
    process.env.NODE_ENV = originalEnv
  })
})
