import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/shared/Navbar'
import ThemeToggle from '@/components/shared/ThemeToggle'
import FAQSection from '@/components/sections/FAQSection'
import { RfqB2BForm } from '@/components/forms/RfqB2BForm'
import { RfqB2GForm } from '@/components/forms/RfqB2GForm'
import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
  })),
}))

// Mock analytics hooks
jest.mock('@/hooks/use-analytics', () => ({
  useTrackEvent: jest.fn(() => jest.fn()),
}))

// Mock tracking utils
jest.mock('@/lib/utils/tracking', () => ({
  extractTrackingMetadata: jest.fn(() => ({
    source_domain: 'localhost',
    source_page_path: '/',
    source_campaign_tag: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
  })),
}))

// Mock rfq store hooks
jest.mock('@/hooks/use-rfq-cart', () => {
  const mockGetState = jest.fn(() => ({
    clearCart: jest.fn(),
    updateQuantity: jest.fn(),
    updateItemNotes: jest.fn(),
    removeItem: jest.fn(),
  }))
  const mockStore = jest.fn((selector) => {
    if (selector) return selector()
    return []
  })
  Object.defineProperty(mockStore, 'getState', { value: mockGetState })
  return {
    useRfqCartHydrated: jest.fn(() => true),
    useRfqCartStore: mockStore,
    selectCartItems: jest.fn(() => [
      { product_id: 'prod1', product_name: 'Lampu LED', quantity: 2, variant: '100W' }
    ]),
  }
})

// Mock ScrollReveal
jest.mock('@/components/shared/ScrollReveal', () => {
  return function DummyScrollReveal({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-reveal">{children}</div>
  }
})

describe('A11y Attributes Verification', () => {
  describe('Navbar', () => {
    it('renders desktop and mobile navigation landmarks', () => {
      render(<Navbar />)
      expect(screen.getByRole('navigation', { name: /Main Navigation/i })).toBeInTheDocument()
      
      // Open mobile menu
      const toggleBtn = screen.getByRole('button', { name: /Toggle menu/i })
      fireEvent.click(toggleBtn)
      expect(screen.getByRole('navigation', { name: /Mobile Navigation/i })).toBeInTheDocument()
    })

    it('renders logo image with functional descriptive alt text', () => {
      render(<Navbar />)
      const logo = screen.getByAltText('PT DBSN - Home')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('ThemeToggle', () => {
    it('renders with appropriate aria-label and aria-pressed attributes', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button', { name: /Toggle theme/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('FAQSection search', () => {
    it('renders search input with aria-label', () => {
      render(<FAQSection />)
      const searchInput = screen.getByLabelText(/Search frequently asked questions/i)
      expect(searchInput).toBeInTheDocument()
    })
  })

  describe('RFQ Forms hidden inputs', () => {
    it('enforces aria-hidden="true" on all type="hidden" inputs in RfqB2BForm', () => {
      const { container } = render(<RfqB2BForm onSubmit={jest.fn()} />)
      const hiddenInputs = Array.from(container.querySelectorAll('input[type="hidden"]'))
      
      expect(hiddenInputs.length).toBeGreaterThan(0)
      hiddenInputs.forEach((input) => {
        expect(input).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('enforces aria-hidden="true" on all type="hidden" inputs in RfqB2GForm', () => {
      const { container } = render(<RfqB2GForm onSubmit={jest.fn()} />)
      const hiddenInputs = Array.from(container.querySelectorAll('input[type="hidden"]'))
      
      expect(hiddenInputs.length).toBeGreaterThan(0)
      hiddenInputs.forEach((input) => {
        expect(input).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })
})
