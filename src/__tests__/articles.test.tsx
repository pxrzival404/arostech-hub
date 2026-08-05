import { render, screen, fireEvent } from '@testing-library/react'
import ArticlesPage from '../app/(hub)/articles/page'
import ArticlesGridClient from '../app/(hub)/articles/ArticlesGridClient'
import { getArticles } from '@/lib/api/sanity/queries'
import type { ArticleWithRelations } from '@/lib/api/sanity/types'

// Mock queries
jest.mock('@/lib/api/sanity/queries', () => ({
  getArticles: jest.fn(),
  getArticleBySlug: jest.fn(),
}))



const mockArticles: ArticleWithRelations[] = [
  {
    _id: 'a1',
    _type: 'article',
    title: 'Tren PJUTS 2024 Smart City',
    slug: 'tren-pjuts-2024-smart-city',
    category: 'Energi Terbarukan',
    excerpt: 'PJUTS hemat energi perkotaan',
    content: [{ _key: 'b1', _type: 'block', children: [{ _type: 'span', text: 'Detail PJU' }] }],
    author: 'Tim Redaksi',
    publishedAt: '2024-10-15',
    readingTime: 5,
  },
  {
    _id: 'a2',
    _type: 'article',
    title: 'Panduan e-Katalog LKPP Vendor',
    slug: 'panduan-e-katalog-lkpp-vendor',
    category: 'Regulasi',
    excerpt: 'Panduan LKPP pengadaan barang',
    content: [{ _key: 'b2', _type: 'block', children: [{ _type: 'span', text: 'Detail Regulasi' }] }],
    author: 'Divisi Legal',
    publishedAt: '2024-09-28',
    readingTime: 8,
  },
]

describe('ArticlesPage & Grid Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders articles index wrapper with articles', async () => {
    ;(getArticles as jest.Mock).mockResolvedValue(mockArticles)

    const resolvedPage = await ArticlesPage()
    render(resolvedPage)

    expect(screen.getByRole('heading', { name: /Artikel & Berita Terbaru/i })).toBeInTheDocument()
    expect(screen.getByText('Tren PJUTS 2024 Smart City')).toBeInTheDocument()
    expect(screen.getByText('Panduan e-Katalog LKPP Vendor')).toBeInTheDocument()
  })

  it('filters articles on category selection', () => {
    render(<ArticlesGridClient articles={mockArticles} />)

    expect(screen.getByText('Tren PJUTS 2024 Smart City')).toBeInTheDocument()
    expect(screen.getByText('Panduan e-Katalog LKPP Vendor')).toBeInTheDocument()

    // Click 'Regulasi' category filter
    const regulasiBtn = screen.getByRole('button', { name: 'Regulasi' })
    fireEvent.click(regulasiBtn)

    expect(screen.queryByText('Tren PJUTS 2024 Smart City')).not.toBeInTheDocument()
    expect(screen.getByText('Panduan e-Katalog LKPP Vendor')).toBeInTheDocument()
  })

  it('filters articles based on search keyword inputs', () => {
    render(<ArticlesGridClient articles={mockArticles} />)

    const searchInput = screen.getByPlaceholderText('Cari artikel atau topik...')
    fireEvent.change(searchInput, { target: { value: 'smart city' } })

    expect(screen.getByText('Tren PJUTS 2024 Smart City')).toBeInTheDocument()
    expect(screen.queryByText('Panduan e-Katalog LKPP Vendor')).not.toBeInTheDocument()
  })

  it('saves articles to localStorage and triggers filter correctly', () => {
    render(<ArticlesGridClient articles={mockArticles} />)

    // Click Heart button on the first card
    const heartBtns = screen.getAllByRole('button', { name: /Simpan artikel/i })
    expect(heartBtns.length).toBeGreaterThan(0)
    fireEvent.click(heartBtns[0])

    // Should show "Saved (1)" button
    const savedBtn = screen.getByRole('button', { name: /Saved \(1\)/i })
    expect(savedBtn).toBeInTheDocument()

    // Click saved toggle to filter saved items
    fireEvent.click(savedBtn)
    expect(screen.getByText('Tren PJUTS 2024 Smart City')).toBeInTheDocument()
    expect(screen.queryByText('Panduan e-Katalog LKPP Vendor')).not.toBeInTheDocument()
  })
})
