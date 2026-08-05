import { render, screen, fireEvent } from '@testing-library/react'
import FAQPage from '../app/(hub)/faq/page'

jest.mock('@/components/shared/ScrollReveal', () => {
  return function DummyScrollReveal({ children }: { children: React.ReactNode }) {
    return <div data-testid="scroll-reveal">{children}</div>
  }
})

describe('FAQPage', () => {
  it('renders FAQ title and search input', () => {
    render(<FAQPage />)

    expect(screen.getByRole('heading', { name: /Pertanyaan yang Sering Diajukan/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ketik kata kunci/i)).toBeInTheDocument()
  })

  it('filters questions when typing in search input', () => {
    render(<FAQPage />)

    // Type a keyword that matches only shipping/logistik
    const searchInput = screen.getByPlaceholderText(/Ketik kata kunci/i)
    fireEvent.change(searchInput, { target: { value: 'pengiriman' } })

    // Check query filter matches
    expect(screen.getByText(/pengiriman dan proyek/i)).toBeInTheDocument()
    
    // Check non-matching queries are hidden (e.g. battery cycle life or panel capacity)
    expect(screen.queryByText(/Berapa kapasitas daya solar panel/i)).not.toBeInTheDocument()
  })

  it('allows switching categories via category buttons', () => {
    render(<FAQPage />)

    // Initially active category is "Umum"
    expect(screen.getByText(/pengiriman dan proyek/i)).toBeInTheDocument()

    // Switch to "Teknis" category
    const teknisBtn = screen.getByRole('button', { name: /Teknis/i })
    fireEvent.click(teknisBtn)

    // Verify technical questions show
    expect(screen.getByText(/perbedaan utama antara PJU Solar Cell/i)).toBeInTheDocument()
    expect(screen.queryByText(/pengiriman dan proyek/i)).not.toBeInTheDocument()
  })

  it('renders empty state when search finds no results', () => {
    render(<FAQPage />)

    const searchInput = screen.getByPlaceholderText(/Ketik kata kunci/i)
    fireEvent.change(searchInput, { target: { value: 'xyzrandomnotfoundkeyword' } })

    expect(screen.getByText('Tidak ada hasil ditemukan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reset Pencarian/i })).toBeInTheDocument()
  })
})
