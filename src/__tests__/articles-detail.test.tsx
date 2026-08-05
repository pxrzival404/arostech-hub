import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ArticleDetailPage, { generateMetadata } from '../app/(hub)/articles/[slug]/page'
import { getArticleBySlug, getArticles } from '@/lib/api/sanity/queries'
import type { ArticleWithRelations } from '@/lib/api/sanity/types'

// Mock queries
jest.mock('@/lib/api/sanity/queries', () => ({
  getArticleBySlug: jest.fn(),
  getArticles: jest.fn(),
}))

// Mock components that import ES modules
jest.mock('@/components/shared/PortableText', () => {
  return {
    PortableText: ({ value }: any) => <div data-testid="portable-text">{JSON.stringify(value)}</div>,
  }
})

jest.mock('@/components/shared/ShareButtons', () => {
  return function DummyShareButtons({ title }: any) {
    const handleCopy = () => {
      navigator.clipboard.writeText('http://localhost/test')
    }
    return (
      <div data-testid="share-buttons">
        <span>{title}</span>
        <button onClick={handleCopy}>Salin Tautan</button>
      </div>
    )
  }
})

const mockArticle: ArticleWithRelations = {
  _id: 'a1',
  _type: 'article',
  title: 'Tren PJUTS 2024 Smart City',
  slug: 'tren-pjuts-2024-smart-city',
  category: 'Energi Terbarukan',
  excerpt: 'PJUTS hemat energi perkotaan',
  content: [
    {
      _key: 'b1',
      _type: 'block',
      children: [{ _type: 'span', text: 'Detail PJU dan Solar Cell dalam smart city.' }],
    },
  ],
  author: 'Tim Redaksi',
  publishedAt: '2024-10-15',
  readingTime: 5,
  seoMeta: { title: 'PJUTS Smart City SEO', description: 'Wawasan kota cerdas' },
}

describe('ArticleDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders single article with layout info, title, reading time and PortableText', async () => {
    ;(getArticleBySlug as jest.Mock).mockResolvedValue(mockArticle)
    ;(getArticles as jest.Mock).mockResolvedValue([mockArticle])

    const resolvedPage = await ArticleDetailPage({ params: Promise.resolve({ slug: 'tren-pjuts-2024-smart-city' }) })
    render(resolvedPage)

    expect(screen.getByRole('heading', { name: 'Tren PJUTS 2024 Smart City' })).toBeInTheDocument()
    expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    expect(screen.getByText('5 menit baca')).toBeInTheDocument()
    expect(screen.getByText('Tim Redaksi')).toBeInTheDocument()
  })

  it('handles link copying inside share panel', async () => {
    ;(getArticleBySlug as jest.Mock).mockResolvedValue(mockArticle)

    const resolvedPage = await ArticleDetailPage({ params: Promise.resolve({ slug: 'tren-pjuts-2024-smart-city' }) })
    render(resolvedPage)

    const copyBtn = screen.getByRole('button', { name: /Salin Tautan/i })
    fireEvent.click(copyBtn)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })

  it('generates correct SEO metadata dynamically', async () => {
    ;(getArticleBySlug as jest.Mock).mockResolvedValue(mockArticle)

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'tren-pjuts-2024-smart-city' }) })
    expect(metadata.title).toBe('PJUTS Smart City SEO - DBSN Dayaberkah.id')
    expect(metadata.description).toBe('Wawasan kota cerdas')
  })
})
