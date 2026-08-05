import { describe, it, expect, beforeEach, jest, afterEach, afterAll } from '@jest/globals'
import { lookupRedirect, clearCache } from '../../../lib/middleware/redirect-engine'

// Mock the global fetch
const mockFetch = jest.fn<(...args: unknown[]) => Promise<unknown>>()
const originalFetch = global.fetch
global.fetch = mockFetch as unknown as typeof global.fetch

afterAll(() => {
  global.fetch = originalFetch
})

describe('Redirect Engine', () => {
  const origin = 'http://localhost:3000'

  beforeEach(() => {
    mockFetch.mockReset()
    clearCache()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-04T09:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('lookupRedirect', () => {
    it('normalizes trailing slashes correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/products/test-path',
        }),
      })

      // Path with trailing slash should match the normalized relative key
      const result = await lookupRedirect('/test-path/', 'pju', origin)
      expect(result).toBe('/products/test-path')

      const expectedUrl = new URL(`${origin}/api/redirects/lookup`)
      expectedUrl.searchParams.set('pathname', '/test-path/')
      expectedUrl.searchParams.set('spoke', 'pju')
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString(), expect.any(Object))
    })

    it('keeps root slash unchanged', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: null,
        }),
      })
      const result = await lookupRedirect('/', null, origin)
      expect(result).toBeNull()

      const expectedUrl = new URL(`${origin}/api/redirects/lookup`)
      expectedUrl.searchParams.set('pathname', '/')
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString(), expect.any(Object))
    })

    it('returns targetUrl on match', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/about',
        }),
      })

      const result = await lookupRedirect('/about-legacy', null, origin)
      expect(result).toBe('/about')
      
      const expectedUrl = new URL(`${origin}/api/redirects/lookup`)
      expectedUrl.searchParams.set('pathname', '/about-legacy')
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString(), expect.any(Object))
    })

    it('handles spoke subdomains uniformly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/products/solar-panel',
        }),
      })

      const result = await lookupRedirect('/panel-surya', 'solarcell', origin)
      expect(result).toBe('/products/solar-panel')

      const expectedUrl = new URL(`${origin}/api/redirects/lookup`)
      expectedUrl.searchParams.set('pathname', '/panel-surya')
      expectedUrl.searchParams.set('spoke', 'solarcell')
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl.toString(), expect.any(Object))
    })

    it('implements negative caching for missing redirect maps', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: null,
        }),
      })

      // First call: API hit (miss)
      const firstResult = await lookupRedirect('/non-existent', null, origin)
      expect(firstResult).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call: Cache hit (should not fetch API again)
      const secondResult = await lookupRedirect('/non-existent', null, origin)
      expect(secondResult).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('caches redirect matches to avoid API queries on subsequent requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/faq',
        }),
      })

      // First call: API hit
      const firstResult = await lookupRedirect('/faq-old', null, origin)
      expect(firstResult).toBe('/faq')
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call: Cache hit
      const secondResult = await lookupRedirect('/faq-old', null, origin)
      expect(secondResult).toBe('/faq')
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('expires cache entries after 5 minutes TTL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/new-path',
        }),
      })

      // First call: API hit
      await lookupRedirect('/expired-path', null, origin)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Fast forward 4 minutes (under 5m TTL) -> should hit cache
      jest.advanceTimersByTime(4 * 60 * 1000)
      await lookupRedirect('/expired-path', null, origin)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Fast forward another 2 minutes (total 6m) -> cache should expire, triggering a new API lookup
      jest.advanceTimersByTime(2 * 60 * 1000)
      await lookupRedirect('/expired-path', null, origin)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('evicts Least Recently Used entries when exceeding size limit of 500', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          targetUrl: '/some-target',
        }),
      })

      // Seed first redirect entry
      await lookupRedirect('/item-0', null, origin)

      // Fill cache to limit (total 500 entries)
      for (let i = 1; i < 500; i++) {
        await lookupRedirect(`/item-${i}`, null, origin)
      }

      expect(mockFetch).toHaveBeenCalledTimes(500)
      mockFetch.mockClear()

      // Access item-0 to make it recently used
      await lookupRedirect('/item-0', null, origin)
      expect(mockFetch).not.toHaveBeenCalled() // Loaded from cache

      // Add 501st entry, which should trigger eviction of item-1 (LRU)
      await lookupRedirect('/item-500', null, origin)
      
      // Clear the mock call history to verify that item-0 retrieval does not query the API
      mockFetch.mockClear()
      
      // Accessing item-0 (should still be in cache since it was refreshed)
      await lookupRedirect('/item-0', null, origin)
      expect(mockFetch).not.toHaveBeenCalled()

      // Accessing item-1 (should have been evicted, triggering API query)
      await lookupRedirect('/item-1', null, origin)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })
})
