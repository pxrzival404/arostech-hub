// Global gtag types definition
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || process.env.GA_TRACKING_ID || ''

export enum AnalyticsEvent {
  RFQ_SUBMIT = 'rfq_submit',
  RFQ_FALLBACK_WHATSAPP = 'rfq_fallback_whatsapp',
  PRODUCT_VIEW = 'product_view',
  FILE_DOWNLOAD = 'file_download',
  CONTACT_CLICK = 'contact_click',
  SPOKE_NAVIGATION = 'spoke_navigation'
}

/**
 * Fires a pageview config event to GA4
 * Safe for Server-Side Rendering (SSR) and non-blocking.
 */
export function pageview(url: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }
  try {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  } catch (error) {
    console.error('GA4 pageview tracking failure:', error)
  }
}

/**
 * Fires a custom tracking event to GA4
 * Safe for Server-Side Rendering (SSR) and non-blocking.
 */
export function event(action: string, params: Record<string, string | number>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }
  try {
    window.gtag('event', action, params)
  } catch (error) {
    console.error('GA4 event tracking failure:', error)
  }
}
