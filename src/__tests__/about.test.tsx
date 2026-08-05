import { render, screen } from '@testing-library/react'
import AboutPage from '../app/(hub)/about/page'

// Mock dependencies
jest.mock('@/components/sections/TestimonialsSection', () => {
  return function DummyTestimonials() {
    return <div data-testid="testimonials-section">Testimonials</div>
  }
})

jest.mock('@/components/shared/ScrollReveal', () => {
  return function DummyScrollReveal({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-reveal">{children}</div>
  }
})

describe('AboutPage', () => {
  it('renders about page hero and core company details', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /Membangun Masa Depan Energi/i })).toBeInTheDocument()
    expect(screen.getByText(/PT. Daya Berkah Sentosa Nusantara \(DBSN\) adalah pelopor penyedia/i)).toBeInTheDocument()
  })

  it('renders vision and mission sections', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /^Visi$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^Misi$/i })).toBeInTheDocument()
    expect(screen.getByText(/Menjadi penyedia solusi energi dan infrastruktur terdepan/i)).toBeInTheDocument()
  })

  it('renders management team information', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { name: /Ir. Darmawan B. Santoso, M.T./i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Direksi & Kepemimpinan/i })).toBeInTheDocument()
  })

  it('renders testimonials section placeholder', () => {
    render(<AboutPage />)

    expect(screen.getByTestId('testimonials-section')).toBeInTheDocument()
  })
})
