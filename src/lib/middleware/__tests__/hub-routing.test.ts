import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { isHubDomain } from '../config'

// Mock the redirect engine
jest.mock('../../../lib/middleware/redirect-engine', () => ({
  lookupRedirect: jest.fn(() => Promise.resolve(null)),
}))

describe('Hub Routing Tests', () => {
  const originalEnv = process.env
  let middleware: (request: NextRequest) => NextResponse | Promise<NextResponse>

  beforeEach(async () => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const mwModule = await import('../../../middleware')
    middleware = mwModule.default
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isHubDomain()', () => {
    it('should return true for dayaberkah.pages.dev', () => {
      expect(isHubDomain('dayaberkah.pages.dev')).toBe(true)
    })

    it('should return true for feature-xyz.dayaberkah.pages.dev (branch preview)', () => {
      expect(isHubDomain('feature-xyz.dayaberkah.pages.dev')).toBe(true)
    })

    it('should return false for pju.dayaberkah.pages.dev (spoke on Pages root)', () => {
      expect(isHubDomain('pju.dayaberkah.pages.dev')).toBe(false)
    })
  })

  describe('middleware() - Hub Resolution', () => {
    it('should pass through dayaberkah.pages.dev/about with hub headers', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/about', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })

    it('should pass through dayaberkah.pages.dev/products with hub headers', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/products', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })

    it('should pass through dayaberkah.pages.dev/certifications with hub headers', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/certifications', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })

    it('should pass through dayaberkah.pages.dev/portfolio/test-slug with hub headers', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/portfolio/test-slug', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })

    it('should pass through dayaberkah.pages.dev/articles/test-article with hub headers', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/articles/test-article', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })
  })

  describe('middleware() - Negative Tests', () => {
    it('should return 404 for spoke path on hub domain (dayaberkah.pages.dev/pju)', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/pju', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.status).toBe(404)
    })

    it('should pass through dayaberkah.pages.dev/nonexistent and let Next.js handle 404 for nonexistent pages', async () => {
      const req = new NextRequest('https://dayaberkah.pages.dev/nonexistent', {
        headers: { host: 'dayaberkah.pages.dev' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toBeNull()
      expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
      expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
    })
  })

  describe('middleware() - Regression Tests', () => {
    it('should rewrite dashboard requests correctly', async () => {
      const req = new NextRequest('https://dashboard.dayaberkah.id/profile', {
        headers: {
          host: 'dashboard.dayaberkah.id',
          cookie: 'next-auth.session-token=dummy-token-value',
        },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toContain('/dashboard/profile')
    })

    it('should rewrite spoke requests correctly', async () => {
      const req = new NextRequest('https://solarcell.dayaberkah.id/products', {
        headers: { host: 'solarcell.dayaberkah.id' },
      })
      const res = await middleware(req)
      expect(res).toBeDefined()
      expect(res.headers.get('x-middleware-rewrite')).toContain('/solarpanel/products')
    })
  })
})
