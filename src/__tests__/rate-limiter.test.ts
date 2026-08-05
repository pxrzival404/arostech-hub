import { describe, it, expect } from '@jest/globals'
import { createRateLimiter, getClientIp } from '../lib/rate-limiter'

describe('Rate Limiter Utility', () => {
  it('should allow requests within rate limits and block after limit exceeded', () => {
    const limiter = createRateLimiter({
      interval: 1000, // 1 second
      maxRequests: 3,
    })

    const key = 'test-key-1'

    // 1st request
    let result = limiter.check(key)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)

    // 2nd request
    result = limiter.check(key)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(1)

    // 3rd request
    result = limiter.check(key)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(0)

    // 4th request (should be blocked)
    result = limiter.check(key)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.reset).toBeGreaterThan(Date.now())
  })

  it('should reset limits after the interval window expires', async () => {
    const limiter = createRateLimiter({
      interval: 50, // 50ms window
      maxRequests: 1,
    })

    const key = 'test-key-2'

    // 1st request
    let result = limiter.check(key)
    expect(result.success).toBe(true)

    // 2nd request immediately (should be blocked)
    result = limiter.check(key)
    expect(result.success).toBe(false)

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, 60))

    // 3rd request (should pass now)
    result = limiter.check(key)
    expect(result.success).toBe(true)
  })

  it('should extract client IP from headers', () => {
    const req1 = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '203.0.113.195, 70.41.3.18'
          return null
        }
      }
    } as unknown as Request
    expect(getClientIp(req1)).toBe('203.0.113.195')

    const req2 = {
      headers: {
        get: (name: string) => {
          if (name === 'x-real-ip') return '198.51.100.1'
          return null
        }
      }
    } as unknown as Request
    expect(getClientIp(req2)).toBe('198.51.100.1')

    const req3 = {
      headers: {
        get: () => null
      }
    } as unknown as Request
    expect(getClientIp(req3)).toBe('127.0.0.1')
  })
})
