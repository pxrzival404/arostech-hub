import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  mockProduct,
  mockCertification,
  mockPortfolioEntry,
  mockSpokeConfig,
  mockPage,
} from './fixtures'

jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...keys: unknown[]) => {
    let result = ''
    strings.forEach((str, i) => {
      result += str + (keys[i] || '')
    })
    return result
  },
  defineQuery: (q: string) => q,
}))

const mockFetch = jest.fn()

jest.mock('../client', () => ({
  client: {
    fetch: (query: unknown, params?: unknown, options?: unknown) => mockFetch(query, params, options),
  },
  CACHE_TAGS: {
    product: (id?: string) => (id ? `sanity:product:${id}` : 'sanity:product'),
    certification: (id?: string) => (id ? `sanity:certification:${id}` : 'sanity:certification'),
    portfolio: (id?: string) => (id ? `sanity:portfolio:${id}` : 'sanity:portfolio'),
    spoke: (subdomain: string) => `sanity:spoke:${subdomain}`,
    spokeConfig: (id?: string) => (id ? `sanity:spokeConfig:${id}` : 'sanity:spokeConfig'),
    page: (id?: string) => (id ? `sanity:page:${id}` : 'sanity:page'),
    all: 'sanity:all',
  },
}))

describe('GROQ Queries', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('getProductsBySpoke', () => {
    it('should fetch products by spoke subdomain', async () => {
      const mockProducts = [mockProduct()]
      mockFetch.mockResolvedValueOnce(mockProducts)

      const { getProductsBySpoke } = await import('../queries')
      const result = await getProductsBySpoke('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:product', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockProducts)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getProductsBySpoke } = await import('../queries')
      const result = await getProductsBySpoke('pju')

      expect(result).toBeNull()
    })
  })

  describe('getProductBySlug', () => {
    it('should fetch a single product by slug', async () => {
      const mockProductData = mockProduct()
      mockFetch.mockResolvedValueOnce(mockProductData)

      const { getProductBySlug } = await import('../queries')
      const result = await getProductBySlug('solar-panel')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'solar-panel' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:product']),
          }),
        }),
      )
      expect(result).toEqual(mockProductData)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getProductBySlug } = await import('../queries')
      const result = await getProductBySlug('solar-panel')

      expect(result).toBeNull()
    })
  })

  describe('getProductSlugsWithSpokes', () => {
    it('should fetch all product slug/subdomain pairs', async () => {
      const mockMappings = [
        { slug: 'solar-panel', subdomain: 'pju' },
        { slug: 'solar-inverter', subdomain: 'solarcell' },
      ]
      mockFetch.mockResolvedValueOnce(mockMappings)

      const { getProductSlugsWithSpokes } = await import('../queries')
      const result = await getProductSlugsWithSpokes()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:product']),
          }),
        }),
      )
      expect(result).toEqual(mockMappings)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getProductSlugsWithSpokes } = await import('../queries')
      const result = await getProductSlugsWithSpokes()

      expect(result).toBeNull()
    })
  })

  describe('getCertifications', () => {
    it('should fetch indexable certifications', async () => {
      const mockCertifications = [mockCertification()]
      mockFetch.mockResolvedValueOnce(mockCertifications)

      const { getCertifications } = await import('../queries')
      const result = await getCertifications()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:certification']),
          }),
        }),
      )
      expect(result).toEqual(mockCertifications)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getCertifications } = await import('../queries')
      const result = await getCertifications()

      expect(result).toBeNull()
    })
  })

  describe('getCertificationBySlug', () => {
    it('should fetch a single certification by slug', async () => {
      const mockCertificationData = mockCertification()
      mockFetch.mockResolvedValueOnce(mockCertificationData)

      const { getCertificationBySlug } = await import('../queries')
      const result = await getCertificationBySlug('sni')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'sni' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:certification']),
          }),
        }),
      )
      expect(result).toEqual(mockCertificationData)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getCertificationBySlug } = await import('../queries')
      const result = await getCertificationBySlug('sni')

      expect(result).toBeNull()
    })
  })

  describe('getPortfolioEntries', () => {
    it('should fetch portfolio entries optionally filtered by subdomain', async () => {
      const mockPortfolio = [mockPortfolioEntry()]
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioEntries } = await import('../queries')
      const result = await getPortfolioEntries('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:portfolio', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })

    it('should fetch all portfolio entries when subdomain is not passed', async () => {
      const mockPortfolio = [mockPortfolioEntry()]
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioEntries } = await import('../queries')
      const result = await getPortfolioEntries()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: undefined },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: ['sanity:portfolio'],
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getPortfolioEntries } = await import('../queries')
      const result = await getPortfolioEntries()

      expect(result).toBeNull()
    })
  })

  describe('getPortfolioBySlug', () => {
    it('should fetch a single portfolio entry by slug', async () => {
      const mockPortfolio = mockPortfolioEntry()
      mockFetch.mockResolvedValueOnce(mockPortfolio)

      const { getPortfolioBySlug } = await import('../queries')
      const result = await getPortfolioBySlug('project-1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'project-1' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:portfolio']),
          }),
        }),
      )
      expect(result).toEqual(mockPortfolio)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getPortfolioBySlug } = await import('../queries')
      const result = await getPortfolioBySlug('project-1')

      expect(result).toBeNull()
    })
  })

  describe('getSpokeConfig', () => {
    it('should fetch spoke config by subdomain', async () => {
      const mockConfig = mockSpokeConfig()
      mockFetch.mockResolvedValueOnce(mockConfig)

      const { getSpokeConfig } = await import('../queries')
      const result = await getSpokeConfig('pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:spokeConfig', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockConfig)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getSpokeConfig } = await import('../queries')
      const result = await getSpokeConfig('pju')

      expect(result).toBeNull()
    })
  })

  describe('getAllSpokeConfigs', () => {
    it('should fetch all spoke configs', async () => {
      const mockConfigs = [mockSpokeConfig()]
      mockFetch.mockResolvedValueOnce(mockConfigs)

      const { getAllSpokeConfigs } = await import('../queries')
      const result = await getAllSpokeConfigs()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        {},
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:spokeConfig']),
          }),
        }),
      )
      expect(result).toEqual(mockConfigs)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getAllSpokeConfigs } = await import('../queries')
      const result = await getAllSpokeConfigs()

      expect(result).toBeNull()
    })
  })

  describe('getPageBySlug', () => {
    it('should fetch page by slug and optionally by spoke subdomain', async () => {
      const mockPageData = mockPage()
      mockFetch.mockResolvedValueOnce(mockPageData)

      const { getPageBySlug } = await import('../queries')
      const result = await getPageBySlug('home', 'pju')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        { slug: 'home', subdomain: 'pju' },
        expect.objectContaining({
          next: expect.objectContaining({
            tags: expect.arrayContaining(['sanity:page', 'sanity:spoke:pju']),
          }),
        }),
      )
      expect(result).toEqual(mockPageData)
    })

    it('should return null on fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection error'))

      const { getPageBySlug } = await import('../queries')
      const result = await getPageBySlug('home', 'pju')

      expect(result).toBeNull()
    })
  })
})
