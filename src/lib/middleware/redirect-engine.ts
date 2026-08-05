interface CacheEntry {
  value: string | null
  expiry: number
}

const cache = new Map<string, CacheEntry>()
const MAX_CACHE_SIZE = 500
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in ms

export function clearCache(): void {
  cache.clear()
}

function getFromCache(key: string): string | null | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined

  if (Date.now() > entry.expiry) {
    cache.delete(key)
    return undefined
  }

  // LRU Refresh: Move to end by re-inserting
  cache.delete(key)
  cache.set(key, entry)

  return entry.value
}

function setToCache(key: string, value: string | null): void {
  if (cache.has(key)) {
    cache.delete(key)
  } else if (cache.size >= MAX_CACHE_SIZE) {
    // Evict least recently used (first item)
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }

  cache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL,
  })
}

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export async function lookupRedirect(
  pathname: string,
  spoke: string | null,
  origin: string,
): Promise<string | null> {
  try {
    const normalizedPath = normalizePath(pathname)
    const legacyUrl = spoke ? `/${spoke}${normalizedPath}` : normalizedPath

    // 1. Check in-memory cache
    const cachedValue = getFromCache(legacyUrl)
    if (cachedValue !== undefined) {
      return cachedValue
    }

    // 2. Query lookup API endpoint
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    try {
      const baseUrl = origin || 'http://localhost'
      const url = new URL('/api/redirects/lookup', baseUrl)
      url.searchParams.set('pathname', pathname)
      if (spoke) {
        url.searchParams.set('spoke', spoke)
      }

      const response = await fetch(url.toString(), { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        setToCache(legacyUrl, null)
        return null
      }

      const data = await response.json()
      if (data && data.success) {
        setToCache(legacyUrl, data.targetUrl)
        return data.targetUrl
      } else {
        setToCache(legacyUrl, null)
        return null
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Redirect lookup API request failed:', error)
      setToCache(legacyUrl, null)
      return null
    }
  } catch (err) {
    console.error('lookupRedirect unexpected error:', err)
    return null
  }
}
