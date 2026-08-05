'use client'

import { useCallback, useEffect } from 'react'
import { event, AnalyticsEvent } from '@/lib/analytics/gtag'
import { initPostHog, capturePostHogEvent } from '@/lib/analytics/posthog'

/**
 * Hook to track analytics events with SSR safety checks.
 * Integrates GA4 and PostHog tracking.
 * Returns a memoized trackEvent function.
 */
export function useTrackEvent() {
  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog()
  }, [])

  return useCallback((action: AnalyticsEvent, params: Record<string, string | number>) => {
    try {
      // GA4 tracking
      event(action, params)

      // PostHog tracking
      capturePostHogEvent(action, params)
    } catch (error) {
      console.error('Failed to track event inside hook:', error)
    }
  }, [])
}
