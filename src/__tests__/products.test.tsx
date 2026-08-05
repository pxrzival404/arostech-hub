import { render, screen } from '@testing-library/react'
import ProductsPage from '../app/(hub)/products/page'
import { buildSpokeUrl } from '@/lib/utils/url'

// Mock dynamic URL builder
jest.mock('@/lib/utils/url', () => ({
  buildSpokeUrl: jest.fn((spoke, path) => `http://${spoke}.mockdomain.com${path}`),
}))

jest.mock('@/components/shared/ScrollReveal', () => {
  return function DummyScrollReveal({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-reveal">{children}</div>
  }
})

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders products page banner and intro text', () => {
    render(<ProductsPage />)

    expect(screen.getByRole('heading', { name: /Katalog Produk/i })).toBeInTheDocument()
    expect(screen.getByText(/Empat pilar solusi teknologi energi terbarukan/i)).toBeInTheDocument()
  })

  it('renders all four main product segments', () => {
    render(<ProductsPage />)

    expect(screen.getByRole('heading', { name: /Penerangan Jalan Umum Tenaga Surya/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Modul Panel Surya/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Proteksi Penangkal Petir/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Baterai Storage/i })).toBeInTheDocument()
  })

  it('renders comparative specifications table', () => {
    render(<ProductsPage />)

    expect(screen.getByRole('heading', { name: /Tabel Perbandingan Spesifikasi/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Radius Proteksi/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Kriteria Perbandingan/i)).toBeInTheDocument()
  })

  it('wires CTA links to dynamic subdomains correctly', () => {
    render(<ProductsPage />)

    expect(buildSpokeUrl).toHaveBeenCalledWith('pju', '/products')
    expect(buildSpokeUrl).toHaveBeenCalledWith('solarcell', '/products')
    expect(buildSpokeUrl).toHaveBeenCalledWith('alatpetir', '/products')
    expect(buildSpokeUrl).toHaveBeenCalledWith('baterai', '/products')

    // Verify links are set in CTAs
    const pjuLink = screen.getByRole('link', { name: /Kunjungi Portal PJUTS/i })
    expect(pjuLink).toHaveAttribute('href', 'http://pju.mockdomain.com/products')

    const batteryLink = screen.getByRole('link', { name: /Kunjungi Portal Baterai/i })
    expect(batteryLink).toHaveAttribute('href', 'http://baterai.mockdomain.com/products')
  })
})
