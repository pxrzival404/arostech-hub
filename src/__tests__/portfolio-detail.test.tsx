import { render, screen } from '@testing-library/react'
import PortfolioDetailPage, { generateMetadata } from '../app/(hub)/portfolio/[slug]/page'
import { getPortfolioBySlug, getPortfolioEntries } from '@/lib/api/sanity/queries'
import type { PortfolioWithRelations } from '@/lib/api/sanity/types'

// Mock queries
jest.mock('@/lib/api/sanity/queries', () => ({
  getPortfolioBySlug: jest.fn(),
  getPortfolioEntries: jest.fn(),
}))

// Mock optimized image helper
jest.mock('@/lib/api/sanity/image', () => ({
  getOptimizedImageUrl: jest.fn(() => 'http://sanity-test.com/project.jpg'),
}))

// Mock components that import ES modules
jest.mock('@/components/shared/GalleryCarousel', () => {
  return function DummyGalleryCarousel({ images, alt }: { images?: unknown[]; alt?: string }) {
    return <div data-testid="carousel">{alt} images count: {images?.length}</div>
  }
})

jest.mock('@/components/shared/PortableText', () => {
  return {
    PortableText: ({ value }: { value: unknown }) => <div data-testid="portable-text">{JSON.stringify(value)}</div>,
  }
})

const mockDetail: PortfolioWithRelations = {
  _id: 'p1',
  _type: 'portfolioEntry',
  title: 'PJUTS Jalan Utama Daerah A',
  slug: 'pjuts-jalan-utama-daerah-a',
  projectType: 'PJUTS',
  clientCategory: 'Government',
  location: 'Daerah A',
  completionYear: 2023,
  scopeDescription: [
    {
      _key: 'k1',
      _type: 'block',
      children: [{ _type: 'span', text: 'Instalasi PJUTS di Daerah A' }],
    },
  ],
  outcome: 'Menerangi 150 titik jalan utama',
  images: [
    { _key: 'img1', _type: 'image', asset: { _ref: 'ref1', _type: 'reference' } },
    { _key: 'img2', _type: 'image', asset: { _ref: 'ref2', _type: 'reference' } },
  ],
  relatedProducts: [
    { _id: 'prod1', title: 'Lampu LED Street Light', slug: 'lampu-led-street-light' },
  ],
  relatedSpoke: { _id: 'spoke1', name: 'pju', subdomain: 'pju' },
  seoMeta: { title: 'PJUTS A SEO', description: 'Deskripsi A SEO' },
}

const mockSiblings: PortfolioWithRelations[] = [
  mockDetail,
  {
    _id: 'p2',
    _type: 'portfolioEntry',
    title: 'PLTS Atap Pabrik B2B',
    slug: 'plts-atap-pabrik-b2b',
    projectType: 'Solar Cell',
    clientCategory: 'Government',
    location: 'Kawasan Industri B',
    completionYear: 2024,
    scopeDescription: [],
    outcome: 'Mengurangi emisi karbon pabrik sebesar 20%',
    images: [],
    relatedProducts: [],
    seoMeta: { title: 'PLTS B2B', description: 'Deskripsi B' },
  },
]

describe('PortfolioDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders project detail with scope, outcome, and metadata sidebar', async () => {
    ;(getPortfolioBySlug as jest.Mock).mockResolvedValue(mockDetail)
    ;(getPortfolioEntries as jest.Mock).mockResolvedValue(mockSiblings)

    const resolvedPage = await PortfolioDetailPage({ params: Promise.resolve({ slug: 'pjuts-jalan-utama-daerah-a' }) })
    render(resolvedPage)

    expect(screen.getByRole('heading', { name: 'PJUTS Jalan Utama Daerah A' })).toBeInTheDocument()
    expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    expect(screen.getByText('Menerangi 150 titik jalan utama')).toBeInTheDocument()
    expect(screen.getByText('Daerah A')).toBeInTheDocument()
    expect(screen.getByText('Lampu LED Street Light')).toBeInTheDocument()
  })

  it('renders related projects sidebar correctly', async () => {
    ;(getPortfolioBySlug as jest.Mock).mockResolvedValue(mockDetail)
    ;(getPortfolioEntries as jest.Mock).mockResolvedValue(mockSiblings)

    const resolvedPage = await PortfolioDetailPage({ params: Promise.resolve({ slug: 'pjuts-jalan-utama-daerah-a' }) })
    render(resolvedPage)

    expect(screen.getByText('Proyek Terkait')).toBeInTheDocument()
    expect(screen.getByText('PLTS Atap Pabrik B2B')).toBeInTheDocument()
  })

  it('generates correct metadata dynamically', async () => {
    ;(getPortfolioBySlug as jest.Mock).mockResolvedValue(mockDetail)

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'pjuts-jalan-utama-daerah-a' }) })
    expect(metadata.title).toBe('PJUTS A SEO - DBSN')
    expect(metadata.description).toBe('Deskripsi A SEO')
  })
})
