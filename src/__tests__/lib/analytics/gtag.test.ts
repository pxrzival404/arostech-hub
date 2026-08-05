import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

// We will dynamically import the module in tests to allow changing env variables before import
describe('gtag utility', () => {
  const originalEnv = process.env
  const originalWindow = global.window

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
    global.window = originalWindow
  })

  it('should export GA_TRACKING_ID from NEXT_PUBLIC_GA_TRACKING_ID', async () => {
    process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'G-MOCKED123'
    const { GA_TRACKING_ID } = await import('@/lib/analytics/gtag')
    expect(GA_TRACKING_ID).toBe('G-MOCKED123')
  })

  it('should fallback to GA_TRACKING_ID from process.env', async () => {
    delete process.env.NEXT_PUBLIC_GA_TRACKING_ID
    process.env.GA_TRACKING_ID = 'G-MOCKED456'
    const { GA_TRACKING_ID } = await import('@/lib/analytics/gtag')
    expect(GA_TRACKING_ID).toBe('G-MOCKED456')
  })

  describe('when window and gtag are defined', () => {
    let mockGtag: jest.Mock<(...args: any[]) => void>

    beforeEach(() => {
      mockGtag = jest.fn()
      if (global.window) {
        global.window.gtag = mockGtag
        global.window.dataLayer = []
      }
    })

    afterEach(() => {
      if (global.window) {
        delete global.window.gtag
        delete global.window.dataLayer
      }
    })

    it('pageview should call window.gtag with config and correct URL', async () => {
      process.env.NEXT_PUBLIC_GA_TRACKING_ID = 'G-TESTID'
      const { pageview } = await import('@/lib/analytics/gtag')
      pageview('/about')

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-TESTID', {
        page_path: '/about',
      })
    })

    it('event should call window.gtag with event action and parameters', async () => {
      const { event, AnalyticsEvent } = await import('@/lib/analytics/gtag')
      event(AnalyticsEvent.RFQ_SUBMIT, { spoke: 'pju', item_count: 5 })

      expect(mockGtag).toHaveBeenCalledWith('event', 'rfq_submit', {
        spoke: 'pju',
        item_count: 5,
      })
    })
  })

  describe('SSR safety and graceful failures', () => {
    beforeEach(() => {
      // Ensure window is undefined (like on server)
      // @ts-ignore
      global.window = undefined
    })

    it('pageview should not throw on the server', async () => {
      const { pageview } = await import('@/lib/analytics/gtag')
      expect(() => pageview('/about')).not.toThrow()
    })

    it('event should not throw on the server', async () => {
      const { event, AnalyticsEvent } = await import('@/lib/analytics/gtag')
      expect(() => event(AnalyticsEvent.PRODUCT_VIEW, { product_name: 'PJU' })).not.toThrow()
    })
  })

  describe('when window is defined but gtag is missing', () => {
    beforeEach(() => {
      global.window = {
        dataLayer: [],
      } as unknown as typeof global.window
    })

    it('pageview should not throw when window.gtag is missing', async () => {
      const { pageview } = await import('@/lib/analytics/gtag')
      expect(() => pageview('/about')).not.toThrow()
    })

    it('event should not throw when window.gtag is missing', async () => {
      const { event, AnalyticsEvent } = await import('@/lib/analytics/gtag')
      expect(() => event(AnalyticsEvent.PRODUCT_VIEW, { product_name: 'PJU' })).not.toThrow()
    })
  })
})
