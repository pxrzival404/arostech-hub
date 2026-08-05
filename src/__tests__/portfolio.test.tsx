import { render, screen, fireEvent } from '@testing-library/react'
import PortfolioPage from '../app/(hub)/portfolio/page'
import PortfolioGridClient from '../app/(hub)/portfolio/PortfolioGridClient'
import { getPortfolioEntries } from '@/lib/api/sanity/queries'
import type { PortfolioWithRelations } from '@/lib/api/sanity/types'

// Mock Sanity queries
jest.mock('@/lib/api/sanity/queries', () => ({
  getPortfolioEntries: jest.fn(),
  getPortfolioBySlug: jest.fn(),
}))

// Mock optimized image helper
jest.mock('@/lib/api/sanity/image', () => ({
  getOptimizedImageUrl: jest.fn(() => 'http://sanity-test.com/project.jpg'),
}))



const mockPortfolios: PortfolioWithRelations[] = [
  {
    _id: 'p1',
    _type: 'portfolioEntry',
    title: 'PJUTS Jalan Utama Daerah A',
    slug: 'pjuts-jalan-utama-daerah-a',
    projectType: 'PJUTS',
    clientCategory: 'Government',
    location: 'Daerah A',
    completionYear: 2023,
    scopeDescription: [{ _key: 'k1', _type: 'block', children: [{ _type: 'span', text: 'Instalasi PJUTS di Daerah A' }] }],
    outcome: 'Menerangi 150 titik jalan utama',
    images: [{ _key: 'img1', _type: 'image', asset: { _ref: 'ref1', _type: 'reference' } }],
    relatedProducts: [],
    seoMeta: { title: 'PJUTS A', description: 'Deskripsi A' },
  },
  {
    _id: 'p2',
    _type: 'portfolioEntry',
    title: 'PLTS Atap Pabrik B2B',
    slug: 'plts-atap-pabrik-b2b',
    projectType: 'Solar Cell',
    clientCategory: 'Private',
    location: 'Kawasan Industri B',
    completionYear: 2024,
    scopeDescription: [{ _key: 'k2', _type: 'block', children: [{ _type: 'span', text: 'Instalasi PLTS Atap' }] }],
    outcome: 'Mengurangi emisi karbon pabrik sebesar 20%',
    images: [{ _key: 'img2', _type: 'image', asset: { _ref: 'ref2', _type: 'reference' } }],
    relatedProducts: [],
    seoMeta: { title: 'PLTS B2B', description: 'Deskripsi B' },
  },
]

describe('PortfolioPage & Grid Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders portfolio page wrapper and all project items', async () => {
    ;(getPortfolioEntries as jest.Mock).mockResolvedValue(mockPortfolios)

    const resolvedPage = await PortfolioPage()
    render(resolvedPage)

    expect(screen.getByRole('heading', { name: /Portofolio Proyek Kami/i })).toBeInTheDocument()
    expect(screen.getByText('PJUTS Jalan Utama Daerah A')).toBeInTheDocument()
    expect(screen.getByText('PLTS Atap Pabrik B2B')).toBeInTheDocument()
  })

  it('renders empty state when no portfolio entries exist', async () => {
    ;(getPortfolioEntries as jest.Mock).mockResolvedValue([])

    const resolvedPage = await PortfolioPage()
    render(resolvedPage)

    expect(
      screen.getByText('Belum ada portofolio proyek terdaftar untuk kategori ini.')
    ).toBeInTheDocument()
  })

  it('filters project items dynamically on category button clicks', () => {
    render(<PortfolioGridClient portfolios={mockPortfolios} />)

    // Initially displays all
    expect(screen.getByText('PJUTS Jalan Utama Daerah A')).toBeInTheDocument()
    expect(screen.getByText('PLTS Atap Pabrik B2B')).toBeInTheDocument()

    // Click B2G filter (Pemerintah/BUMN)
    const b2gBtn = screen.getByRole('button', { name: /B2G \(Pemerintah\/BUMN\)/i })
    fireEvent.click(b2gBtn)

    // Should show B2G project only
    expect(screen.getByText('PJUTS Jalan Utama Daerah A')).toBeInTheDocument()
    expect(screen.queryByText('PLTS Atap Pabrik B2B')).not.toBeInTheDocument()

    // Click Private filter
    const privateBtn = screen.getByRole('button', { name: /Private \(Swasta\)/i })
    fireEvent.click(privateBtn)

    // Should show Swasta project only
    expect(screen.queryByText('PJUTS Jalan Utama Daerah A')).not.toBeInTheDocument()
    expect(screen.getByText('PLTS Atap Pabrik B2B')).toBeInTheDocument()
  })
})
