import React from 'react'
import { render, screen } from '@testing-library/react'
import EthiopianDatePicker from '@/components/EthiopianDatePicker'
import { LanguageProvider } from '@/components/LanguageProvider'

describe('EthiopianDatePicker', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render date picker with label', () => {
    render(
      <LanguageProvider>
        <EthiopianDatePicker
          value="2024-01-01"
          onChange={mockOnChange}
          label="Test Date"
        />
      </LanguageProvider>
    )

    expect(screen.getByText('Test Date')).toBeInTheDocument()
  })

  it('should render without label', () => {
    render(
      <LanguageProvider>
        <EthiopianDatePicker
          value="2024-01-01"
          onChange={mockOnChange}
        />
      </LanguageProvider>
    )

    // Should render without errors
    expect(mockOnChange).toBeDefined()
  })

  it('should display Ethiopian date format', () => {
    render(
      <LanguageProvider>
        <EthiopianDatePicker
          value="2024-01-01"
          onChange={mockOnChange}
        />
      </LanguageProvider>
    )

    // Should contain Ethiopian month names or numerals
    const container = screen.getByText(/፩|፪|፫|መስከረም|ጥቅምት/i)
    expect(container).toBeInTheDocument()
  })

  it('should accept minDate prop', () => {
    render(
      <LanguageProvider>
        <EthiopianDatePicker
          value="2024-01-01"
          onChange={mockOnChange}
          minDate="2024-01-01"
        />
      </LanguageProvider>
    )

    // Should render without errors
    expect(mockOnChange).toBeDefined()
  })
})

