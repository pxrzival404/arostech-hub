import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import sitemap from '../../../app/sitemap'
import { headers } from 'next/headers'
import * as sanityQueries from '../../../lib/api/sanity/queries'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock sanity queries
jest.mock('../../../lib/api/sanity/queries', () => ({
  getProductSlugsWithSpokes: jest.fn(),
  getPortfolioEntries: jest.fn(),
  getCertifications: jest.fn(),
  getAllSpokeConfigs: jest.fn(),
}))

const mockHeadersFn = headers as any
const mockGetProductSlugs = sanityQueries.getProductSlugsWithSpokes as any

describe('Sitemap.xml Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns hub sitemap when host is hub domain', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'dayaberkah.id'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    const result = await sitemap()

    // Hub sitemap contains only hub static urls
    const urls = result.map((item) => item.url)
    expect(urls).toContain('https://dayaberkah.id')
    expect(urls).toContain('https://dayaberkah.id/about')
    expect(urls).toContain('https://dayaberkah.id/contact')
    expect(urls).toContain('https://dayaberkah.id/certifications')
    expect(urls).toContain('https://dayaberkah.id/portfolio')
    expect(urls).toContain('https://dayaberkah.id/products')
    expect(urls).toContain('https://dayaberkah.id/articles')
    expect(urls).toContain('https://dayaberkah.id/faq')

    // Spoke-specific urls or product detail urls should NOT be in the hub sitemap
    expect(urls).not.toContain('https://pju.dayaberkah.id')
    expect(urls).not.toContain('https://dayaberkah.id/pju/products/test-slug')
  })

  it('returns spoke-specific sitemap when host is a spoke subdomain', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'pju.lvh.me'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    // Mock products for the 'pju' spoke, and some other spoke
    mockGetProductSlugs.mockResolvedValue([
      { slug: 'pju-solar-10w', subdomain: 'pju' },
      { slug: 'solar-panel-100w', subdomain: 'solarcell' },
    ])

    const result = await sitemap()
    const urls = result.map((item) => item.url)

    // Spoke sitemap should contain spoke home and products belonging to pju
    expect(urls).toContain('https://pju.dayaberkah.id')
    expect(urls).toContain('https://pju.dayaberkah.id/products/pju-solar-10w')

    // Spoke sitemap should NOT contain products from other spokes
    expect(urls).not.toContain('https://pju.dayaberkah.id/products/solar-panel-100w')
    expect(urls).not.toContain('https://solarcell.dayaberkah.id')

    // Spoke sitemap should NOT contain hub-specific static pages (about, contact, etc.)
    expect(urls).not.toContain('https://pju.dayaberkah.id/about')
  })

  it('handles empty/null products list from Sanity gracefully', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'pju.lvh.me'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)
    mockGetProductSlugs.mockResolvedValue(null)

    const result = await sitemap()
    const urls = result.map((item) => item.url)

    expect(urls).toEqual(['https://pju.dayaberkah.id'])
  })
})
