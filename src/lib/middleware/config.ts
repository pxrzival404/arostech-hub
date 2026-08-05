import {
  parseCloudflarePagesHost,
  SPOKE_SUBDOMAINS as PAGES_SPOKE_SUBDOMAINS,
  SUBDOMAIN_ALIASES,
  resolveSubdomainAlias,
} from '../utils/pages-host'

export const SPOKE_SUBDOMAINS = PAGES_SPOKE_SUBDOMAINS
export { SUBDOMAIN_ALIASES, resolveSubdomainAlias }

/**
 * Strips port numbers from hostname.
 */
export function cleanHostname(host: string | null | undefined): string {
  if (!host) return ''

  // Handle bracketed IPv6: e.g. "[::1]:3000" or "[::1]" -> "::1"
  if (host.startsWith('[')) {
    const end = host.indexOf(']')
    if (end !== -1) {
      return host.substring(1, end)
    }
  }

  // Handle standard IPv6 without brackets (no port allowed here)
  // or standard hostname with port.
  if (host.includes(':')) {
    const parts = host.split(':')
    // If there are more than 2 parts, it's an IPv6 address (e.g. "::1")
    if (parts.length > 2) {
      return host
    }
    // Otherwise it's hostname:port
    return parts[0]
  }

  return host
}

/**
 * Checks if domain is local development (ends with lvh.me).
 */
export function isLocalDevelopment(hostname: string): boolean {
  const clean = cleanHostname(hostname)
  return clean === 'lvh.me' || clean.endsWith('.lvh.me')
}

/**
 * Extracts subdomain relative to ROOT_DOMAIN, local lvh.me, or Cloudflare Pages preview root.
 */
export function extractSubdomain(hostname: string): string | null {
  if (!hostname) return null
  const clean = cleanHostname(hostname)
  if (!clean || clean === 'localhost' || clean === '127.0.0.1' || clean === '::1' || clean === '[::1]') return null

  const isLocal = isLocalDevelopment(clean)
  const pagesHost = parseCloudflarePagesHost(clean)
  if (pagesHost) {
    return pagesHost.subdomain
  }

  let rootDomain: string

  if (isLocal) {
    rootDomain = 'lvh.me'
  } else {
    rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === 'production' ? 'dayaberkah.id' : 'lvh.me')
  }

  if (clean === rootDomain || clean === `www.${rootDomain}`) return null
  if (!clean.endsWith('.' + rootDomain)) return null

  const rawSubdomain = clean.slice(0, -(rootDomain.length + 1))
  if (rawSubdomain === 'www') return null

  const subdomain = resolveSubdomainAlias(rawSubdomain)
  return subdomain || null
}

/**
 * Checks if the domain resolves to the Hub.
 */
export function isHubDomain(hostname: string): boolean {
  const clean = cleanHostname(hostname)
  if (clean === 'localhost' || clean === '127.0.0.1' || clean === '::1' || clean === '[::1]') {
    return true
  }

  const pagesHost = parseCloudflarePagesHost(clean)
  if (pagesHost) {
    return pagesHost.subdomain === null
  }

  const isLocal = isLocalDevelopment(clean)
  let rootDomain: string

  if (isLocal) {
    rootDomain = 'lvh.me'
  } else {
    rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || (process.env.NODE_ENV === 'production' ? 'dayaberkah.id' : 'lvh.me')
  }

  return clean === rootDomain || clean === `www.${rootDomain}`
}

/**
 * Checks if the domain resolves to the Dashboard.
 */
export function isDashboardDomain(hostname: string): boolean {
  return extractSubdomain(hostname) === 'dashboard'
}

/**
 * Checks if the domain resolves to a valid spoke subdomain.
 * Returns the spoke subdomain if valid, or null.
 */
export function isSpokeDomain(hostname: string): string | null {
  const subdomain = extractSubdomain(hostname)
  if (subdomain) {
    const resolved = resolveSubdomainAlias(subdomain)
    if ((SPOKE_SUBDOMAINS as readonly string[]).includes(resolved)) {
      return resolved
    }
  }
  return null
}
