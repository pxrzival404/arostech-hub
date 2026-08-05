'use client'

import React from 'react'
import { useTrackEvent } from '@/hooks/use-analytics'
import { AnalyticsEvent } from '@/lib/analytics/gtag'

interface AnalyticsDownloadLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  fileName: string
  fileType: string
  children: React.ReactNode
}

export default function AnalyticsDownloadLink({
  fileName,
  fileType,
  children,
  onClick,
  ...props
}: AnalyticsDownloadLinkProps) {
  const trackEvent = useTrackEvent()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      trackEvent(AnalyticsEvent.FILE_DOWNLOAD, {
        file_name: fileName,
        file_type: fileType,
      })
    } catch (err) {
      console.error('Failed to log file download event:', err)
    }
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <a onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
