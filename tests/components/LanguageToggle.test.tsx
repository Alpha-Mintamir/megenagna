import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageToggle from '@/components/LanguageToggle'
import { LanguageProvider } from '@/components/LanguageProvider'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('LanguageToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should render language toggle button', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    )

    const button = screen.getByRole('button', { name: /toggle language/i })
    expect(button).toBeInTheDocument()
  })

  it('should show EN initially', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('EN')
  })

  it('should toggle to Amharic when clicked', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    )

    const button = screen.getByRole('button')
    
    // Click to toggle
    fireEvent.click(button)
    
    // Should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'am')
    
    // Should show Amharic text
    expect(button).toHaveTextContent('አማ')
  })

  it('should load saved language from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('am')
    
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('አማ')
  })

  it('should toggle back to English', () => {
    localStorageMock.getItem.mockReturnValue('am')
    
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('አማ')
    
    // Click to toggle back
    fireEvent.click(button)
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('language', 'en')
  })
})

