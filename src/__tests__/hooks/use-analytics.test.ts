import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook } from '@testing-library/react'

// Mock the gtag utility
const mockEvent = jest.fn()
jest.mock('@/lib/analytics/gtag', () => ({
  event: mockEvent,
  AnalyticsEvent: {
    RFQ_SUBMIT: 'rfq_submit',
    RFQ_FALLBACK_WHATSAPP: 'rfq_fallback_whatsapp',
    PRODUCT_VIEW: 'product_view',
  },
}))

// Mock the posthog utility
const mockInitPostHog = jest.fn()
const mockCapturePostHogEvent = jest.fn()
jest.mock('@/lib/analytics/posthog', () => ({
  initPostHog: mockInitPostHog,
  capturePostHogEvent: mockCapturePostHogEvent,
}))

describe('useTrackEvent Hook', () => {
  beforeEach(() => {
    mockEvent.mockClear()
    mockInitPostHog.mockClear()
    mockCapturePostHogEvent.mockClear()
  })

  it('should return a function to track events', async () => {
    const { useTrackEvent } = await import('@/hooks/use-analytics')
    const { result } = renderHook(() => useTrackEvent())

    expect(typeof result.current).toBe('function')
    expect(mockInitPostHog).toHaveBeenCalledTimes(1)
  })

  it('should call core event utility with action and parameters', async () => {
    const { useTrackEvent } = await import('@/hooks/use-analytics')
    const { result } = renderHook(() => useTrackEvent())

    result.current('rfq_submit' as any, { spoke: 'solarcell' })

    expect(mockEvent).toHaveBeenCalledWith('rfq_submit', { spoke: 'solarcell' })
    expect(mockCapturePostHogEvent).toHaveBeenCalledWith('rfq_submit', { spoke: 'solarcell' })
  })

  it('should be SSR safe and work when window is undefined', async () => {
    const originalWindow = global.window
    // @ts-ignore
    global.window = undefined

    const { useTrackEvent } = await import('@/hooks/use-analytics')
    const { result } = renderHook(() => useTrackEvent())

    expect(() => {
      result.current('product_view' as any, { product_name: 'Solar Panel' })
    }).not.toThrow()

    expect(mockEvent).toHaveBeenCalledWith('product_view', { product_name: 'Solar Panel' })
    expect(mockCapturePostHogEvent).toHaveBeenCalledWith('product_view', { product_name: 'Solar Panel' })

    global.window = originalWindow
  })
})
