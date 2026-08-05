import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'

jest.mock('../lib/middleware/redirect-engine', () => ({
  lookupRedirect: jest.fn(() => Promise.resolve(null)),
}))

describe('Subdomain Routing Middleware Integration', () => {
  const originalEnv = process.env
  let middleware: (request: NextRequest) => NextResponse | Promise<NextResponse>
  let mockLookupRedirect: any

  beforeEach(async () => {
    jest.resetModules()
    const { lookupRedirect } = await import('../lib/middleware/redirect-engine')
    mockLookupRedirect = lookupRedirect
    mockLookupRedirect.mockReset()
    mockLookupRedirect.mockResolvedValue(null)
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const mwModule = await import('../middleware')
    middleware = mwModule.default
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should pass through hub domain (dayaberkah.id) with hub headers', async () => {
    const req = new NextRequest('http://dayaberkah.id/about?test=1', {
      headers: { host: 'dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should pass through hub domain with www with hub headers', async () => {
    const req = new NextRequest('http://www.dayaberkah.id/contact', {
      headers: { host: 'www.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should rewrite dashboard domain to /dashboard folder when authenticated', async () => {
    const req = new NextRequest('http://dashboard.dayaberkah.id/profile', {
      headers: {
        host: 'dashboard.dayaberkah.id',
        cookie: 'next-auth.session-token=dummy-token-value',
      },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/dashboard/profile')
    expect(res.headers.get('x-middleware-subdomain')).toBe('dashboard')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/dashboard')
  })

  it('should redirect dashboard domain to /login if unauthenticated', async () => {
    const req = new NextRequest('http://dashboard.dayaberkah.id/profile', {
      headers: { host: 'dashboard.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://dashboard.dayaberkah.id/login')
  })

  it('should allow public dashboard routes to proceed without authentication', async () => {
    const req = new NextRequest('http://dashboard.dayaberkah.id/login', {
      headers: { host: 'dashboard.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/dashboard/login')
  })

  it('should rewrite valid spoke subdomain (pju) to /(spokes)/pju', async () => {
    const req = new NextRequest('http://pju.dayaberkah.id/products/led', {
      headers: { host: 'pju.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/pju/products/led')
    expect(res.headers.get('x-middleware-subdomain')).toBe('pju')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/pju')
  })

  it('should rewrite valid spoke subdomain (solarcell) in local dev using lvh.me', async () => {
    const req = new NextRequest('http://solarcell.lvh.me:3000/info', {
      headers: { host: 'solarcell.lvh.me:3000' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toContain('/solarpanel/info')
    expect(res.headers.get('x-middleware-subdomain')).toBe('solarpanel')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/solarpanel')
  })

  it('should pass through local dev hub (lvh.me:3000) with hub headers', async () => {
    const req = new NextRequest('http://lvh.me:3000/', {
      headers: { host: 'lvh.me:3000' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(hub)')
  })

  it('should return 404 for unknown subdomains', async () => {
    const req = new NextRequest('http://invalid.dayaberkah.id/some-path', {
      headers: { host: 'invalid.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.status).toBe(404)
  })

  it('should short-circuit and do nothing for API routes', async () => {
    const req = new NextRequest('http://pju.dayaberkah.id/api/rfq', {
      headers: { host: 'pju.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    // Should be a NextResponse.next() which doesn't rewrite
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('should short-circuit and do nothing for static files and _next', async () => {
    const req = new NextRequest('http://pju.dayaberkah.id/_next/static/chunks/main.js', {
      headers: { host: 'pju.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('should short-circuit and set correct headers for already rewritten dashboard path', async () => {
    const req = new NextRequest('http://dashboard.dayaberkah.id/dashboard/profile', {
      headers: {
        host: 'dashboard.dayaberkah.id',
        cookie: 'next-auth.session-token=dummy-token-value',
      },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('dashboard')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/dashboard')
  })

  it('should short-circuit and set correct headers for already rewritten spoke path', async () => {
    const req = new NextRequest('http://pju.dayaberkah.id/pju/products/led', {
      headers: { host: 'pju.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.headers.get('x-middleware-rewrite')).toBeNull()
    expect(res.headers.get('x-middleware-subdomain')).toBe('pju')
    expect(res.headers.get('x-middleware-matched-route')).toBe('/(spokes)/pju')
  })

  it('should return 404 if direct spoke path is requested on hub domain', async () => {
    const req = new NextRequest('http://dayaberkah.id/pju/products/led', {
      headers: { host: 'dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.status).toBe(404)
  })

  it('should redirect permanently (301) when a redirect match is found, preserving query parameters', async () => {
    mockLookupRedirect.mockResolvedValue('/products/solar-panel')
    const req = new NextRequest('http://solarcell.dayaberkah.id/old-panel?ref=promo', {
      headers: { host: 'solarcell.dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('http://solarcell.dayaberkah.id/products/solar-panel?ref=promo')
    expect(mockLookupRedirect).toHaveBeenCalledWith('/old-panel', 'solarpanel', 'http://solarcell.dayaberkah.id')
  })

  it('should not redirect if no match is found, executing normal middleware routing', async () => {
    mockLookupRedirect.mockResolvedValue(null)
    const req = new NextRequest('http://dayaberkah.id/normal-page', {
      headers: { host: 'dayaberkah.id' },
    })

    const res = await middleware(req)
    expect(res).toBeDefined()
    expect(res.status).toBe(200)
    expect(res.headers.get('x-middleware-subdomain')).toBe('hub')
  })
})
