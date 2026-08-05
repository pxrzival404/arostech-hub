/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals'

// Mock posthog-js
const mockInit = jest.fn()
const mockCapture = jest.fn()
const mockIdentify = jest.fn()

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    init: mockInit,
    capture: mockCapture,
    identify: mockIdentify,
    __loaded: false,
  }
}))

describe('PostHog Analytics Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    mockInit.mockClear()
    mockCapture.mockClear()
    mockIdentify.mockClear()
    process.env = { ...originalEnv }
    // @ts-ignore
    global.window = undefined
  })

  afterAll(() => {
    process.env = originalEnv
    // @ts-ignore
    global.window = undefined
  })

  describe('initPostHog', () => {
    it('should do nothing if NEXT_PUBLIC_POSTHOG_KEY is not defined', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = ''
      const { initPostHog } = await import('@/lib/analytics/posthog')
      
      initPostHog()
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should do nothing if window is undefined (SSR safety)', async () => {
      // window is undefined by default in node environment
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
      const { initPostHog } = await import('@/lib/analytics/posthog')

      initPostHog()
      expect(mockInit).not.toHaveBeenCalled()
    })

    it('should call posthog.init if key is defined and running in browser', async () => {
      // Simulate browser environment
      // @ts-ignore
      global.window = {
        document: {} as any
      } as any

      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
      process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://test.posthog.com'
      
      const { initPostHog } = await import('@/lib/analytics/posthog')
      initPostHog()

      expect(mockInit).toHaveBeenCalledWith('test-key', expect.objectContaining({
        api_host: 'https://test.posthog.com',
        capture_pageview: false,
        persistence: 'localStorage',
        autocapture: false,
      }))
    })
  })

  describe('capturePostHogEvent', () => {
    it('should do nothing if window is undefined', async () => {
      // window is undefined by default in node environment
      const { capturePostHogEvent } = await import('@/lib/analytics/posthog')
      capturePostHogEvent('test_event', { prop: 'val' })

      expect(mockCapture).not.toHaveBeenCalled()
    })

    it('should call posthog.capture if running in browser', async () => {
      // Simulate browser environment
      // @ts-ignore
      global.window = {
        document: {} as any
      } as any

      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
      const { capturePostHogEvent } = await import('@/lib/analytics/posthog')
      
      capturePostHogEvent('test_event', { prop: 'val' })

      expect(mockCapture).toHaveBeenCalledWith('test_event', expect.objectContaining({
        prop: 'val',
        timestamp: expect.any(String),
      }))
    })
  })

  describe('identifyUser', () => {
    it('should do nothing if window is undefined', async () => {
      // window is undefined by default in node environment
      const { identifyUser } = await import('@/lib/analytics/posthog')
      identifyUser('user-123', { email: 'test@example.com' })

      expect(mockIdentify).not.toHaveBeenCalled()
    })

    it('should call posthog.identify if running in browser', async () => {
      // Simulate browser environment
      // @ts-ignore
      global.window = {
        document: {} as any
      } as any

      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'test-key'
      const { identifyUser } = await import('@/lib/analytics/posthog')
      
      identifyUser('user-123', { email: 'test@example.com' })

      expect(mockIdentify).toHaveBeenCalledWith('user-123', { email: 'test@example.com' })
    })
  })
})
