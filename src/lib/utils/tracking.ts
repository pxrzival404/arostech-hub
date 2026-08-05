export function extractTrackingMetadata(): {
  source_domain: string
  source_page_path: string
  source_campaign_tag?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
} {
  if (typeof window === 'undefined') {
    return {
      source_domain: '',
      source_page_path: '',
    }
  }

  const urlParams = new URLSearchParams(window.location.search)

  return {
    source_domain: window.location.hostname || '',
    source_page_path: window.location.pathname || '',
    source_campaign_tag: urlParams.get('campaign') || undefined,
    utm_source: urlParams.get('utm_source') || undefined,
    utm_medium: urlParams.get('utm_medium') || undefined,
    utm_campaign: urlParams.get('utm_campaign') || undefined,
  }
}
