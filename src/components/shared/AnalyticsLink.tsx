'use client'

import Link, { LinkProps } from 'next/link'
import { useTrackEvent } from '@/hooks/use-analytics'
import { AnalyticsEvent } from '@/lib/analytics/gtag'
import React from 'react'

interface AnalyticsLinkProps extends LinkProps {
  spoke: string
  source: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function AnalyticsLink({
  spoke,
  source,
  children,
  onClick,
  ...props
}: AnalyticsLinkProps) {
  const trackEvent = useTrackEvent()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      trackEvent(AnalyticsEvent.SPOKE_NAVIGATION, {
        spoke,
        source,
      })
    } catch (err) {
      console.error('Failed to log spoke navigation event:', err)
    }
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Link onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
