'use client'

import { useEffect } from 'react'
import { useTrackEvent } from '@/hooks/use-analytics'
import { AnalyticsEvent } from '@/lib/analytics/gtag'

interface ProductViewTrackerProps {
  productName: string
  spoke: string
}

export default function ProductViewTracker({ productName, spoke }: ProductViewTrackerProps) {
  const trackEvent = useTrackEvent()

  useEffect(() => {
    trackEvent(AnalyticsEvent.PRODUCT_VIEW, {
      product_name: productName,
      spoke,
    })
  }, [productName, spoke, trackEvent])

  return null
}
