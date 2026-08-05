import { LRUCache } from 'lru-cache'

export interface RateLimiterOptions {
  interval: number // in milliseconds
  maxRequests: number
}

export function createRateLimiter({ interval, maxRequests }: RateLimiterOptions) {
  // Setup LRUCache with sliding window
  const cache = new LRUCache<string, number[]>({
    max: 500,
    ttl: interval,
  })

  return {
    check: (key: string): { success: boolean; limit: number; remaining: number; reset: number } => {
      const now = Date.now()
      const timestamps = cache.get(key) || []
      
      // Filter out timestamps outside the current window
      const windowStart = now - interval
      const validTimestamps = timestamps.filter(t => t > windowStart)
      
      if (validTimestamps.length >= maxRequests) {
        const oldestValid = validTimestamps[0]
        const resetTime = oldestValid + interval
        return {
          success: false,
          limit: maxRequests,
          remaining: 0,
          reset: resetTime,
        }
      }
      
      validTimestamps.push(now)
      cache.set(key, validTimestamps)
      
      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - validTimestamps.length,
        reset: now + interval,
      }
    }
  }
}

/**
 * Extracts the client IP address from a request's headers.
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers?.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = req.headers?.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return '127.0.0.1'
}

