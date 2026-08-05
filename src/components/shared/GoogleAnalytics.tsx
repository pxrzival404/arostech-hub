'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { GA_TRACKING_ID, pageview } from '@/lib/analytics/gtag'

function RouteChangeListener() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_TRACKING_ID) return
    
    // Privacy policy: do not track events on dashboard (authenticated user area) pages
    if (pathname && pathname.startsWith('/dashboard')) {
      return
    }

    const query = searchParams?.toString()
    const url = pathname + (query ? `?${query}` : '')
    pageview(url)
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  // If GA_TRACKING_ID is not configured, this component acts as a safe no-op
  if (!GA_TRACKING_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>
    </>
  )
}
