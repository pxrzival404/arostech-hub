import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Middleware Config Resolution Utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should strip port numbers correctly with cleanHostname', async () => {
    const { cleanHostname } = await import('../config')
    expect(cleanHostname('lvh.me:3000')).toBe('lvh.me')
    expect(cleanHostname('dayaberkah.id:8080')).toBe('dayaberkah.id')
    expect(cleanHostname('pju.lvh.me')).toBe('pju.lvh.me')
    expect(cleanHostname('[::1]:3000')).toBe('::1')
    expect(cleanHostname('::1')).toBe('::1')
    expect(cleanHostname(null)).toBe('')
    expect(cleanHostname(undefined)).toBe('')
    expect(cleanHostname('')).toBe('')
  })

  it('should detect local development domains correctly with isLocalDevelopment', async () => {
    const { isLocalDevelopment } = await import('../config')
    expect(isLocalDevelopment('lvh.me:3000')).toBe(true)
    expect(isLocalDevelopment('pju.lvh.me')).toBe(true)
    expect(isLocalDevelopment('dashboard.lvh.me:3000')).toBe(true)
    expect(isLocalDevelopment('dayaberkah.id')).toBe(false)
    expect(isLocalDevelopment('pju.dayaberkah.id')).toBe(false)
  })

  it('should extract subdomains correctly relative to ROOT_DOMAIN or lvh.me with extractSubdomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const { extractSubdomain } = await import('../config')

    // Local dev subdomains
    expect(extractSubdomain('lvh.me:3000')).toBeNull()
    expect(extractSubdomain('www.lvh.me:3000')).toBeNull()
    expect(extractSubdomain('pju.lvh.me:3000')).toBe('pju')
    expect(extractSubdomain('dashboard.lvh.me:3000')).toBe('dashboard')

    // Production subdomains
    expect(extractSubdomain('dayaberkah.id')).toBeNull()
    expect(extractSubdomain('www.dayaberkah.id')).toBeNull()
    expect(extractSubdomain('pju.dayaberkah.id')).toBe('pju')
    expect(extractSubdomain('dashboard.dayaberkah.id')).toBe('dashboard')

    // Cloudflare Pages — production project root
    expect(extractSubdomain('dayaberkah.pages.dev')).toBeNull()
    expect(extractSubdomain('pju.dayaberkah.pages.dev')).toBe('pju')
    expect(extractSubdomain('dashboard.dayaberkah.pages.dev')).toBe('dashboard')

    // Cloudflare Pages — branch preview (hub)
    expect(extractSubdomain('feature-xyz.dayaberkah.pages.dev')).toBeNull()
    expect(extractSubdomain('abc1234.dayaberkah.pages.dev')).toBeNull()

    // Cloudflare Pages — spoke on branch preview (whitelist-first wins)
    expect(extractSubdomain('pju.feature-xyz.dayaberkah.pages.dev')).toBe('pju')
    expect(extractSubdomain('dashboard.staging.dayaberkah.pages.dev')).toBe('dashboard')

    // Edge cases
    expect(extractSubdomain('')).toBeNull()
    expect(extractSubdomain('127.0.0.1')).toBeNull()
    expect(extractSubdomain('localhost')).toBeNull()
    expect(extractSubdomain('::1')).toBeNull()
    expect(extractSubdomain('[::1]:3000')).toBeNull()
    expect(extractSubdomain('foo.bar.dayaberkah.id')).toBe('foo.bar')
  })

  it('should identify hub domains correctly with isHubDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const { isHubDomain } = await import('../config')

    // Local dev hub
    expect(isHubDomain('lvh.me:3000')).toBe(true)
    expect(isHubDomain('www.lvh.me:3000')).toBe(true)
    expect(isHubDomain('pju.lvh.me:3000')).toBe(false)
    expect(isHubDomain('localhost')).toBe(true)
    expect(isHubDomain('127.0.0.1')).toBe(true)
    expect(isHubDomain('::1')).toBe(true)
    expect(isHubDomain('[::1]:3000')).toBe(true)

    // Production hub
    expect(isHubDomain('dayaberkah.id')).toBe(true)
    expect(isHubDomain('www.dayaberkah.id')).toBe(true)
    expect(isHubDomain('pju.dayaberkah.id')).toBe(false)
    expect(isHubDomain('dashboard.dayaberkah.id')).toBe(false)

    // Cloudflare Pages deployment domains
    expect(isHubDomain('dayaberkah.pages.dev')).toBe(true)
    expect(isHubDomain('www.dayaberkah.pages.dev')).toBe(true)
    expect(isHubDomain('feature-xyz.dayaberkah.pages.dev')).toBe(true)
    expect(isHubDomain('pju.dayaberkah.pages.dev')).toBe(false)
  })

  it('should identify dashboard domains correctly with isDashboardDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const { isDashboardDomain } = await import('../config')

    expect(isDashboardDomain('dashboard.lvh.me:3000')).toBe(true)
    expect(isDashboardDomain('dashboard.dayaberkah.id')).toBe(true)
    expect(isDashboardDomain('dashboard.dayaberkah.pages.dev')).toBe(true)
    expect(isDashboardDomain('dashboard.staging.dayaberkah.pages.dev')).toBe(true)
    expect(isDashboardDomain('pju.dayaberkah.id')).toBe(false)
    expect(isDashboardDomain('dayaberkah.id')).toBe(false)
  })

  it('should identify valid spoke subdomains correctly with isSpokeDomain', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    const { isSpokeDomain } = await import('../config')

    expect(isSpokeDomain('pju.lvh.me:3000')).toBe('pju')
    expect(isSpokeDomain('solarpanel.dayaberkah.id')).toBe('solarpanel')
    expect(isSpokeDomain('solarcell.dayaberkah.id')).toBe('solarpanel')
    expect(isSpokeDomain('penangkalpetir.dayaberkah.id')).toBe('penangkalpetir')
    expect(isSpokeDomain('alatpetir.dayaberkah.id')).toBe('penangkalpetir')
    expect(isSpokeDomain('baterai.dayaberkah.id')).toBe('baterai')

    // Cloudflare Pages spoke subdomains
    expect(isSpokeDomain('pju.dayaberkah.pages.dev')).toBe('pju')
    expect(isSpokeDomain('solarpanel.staging.dayaberkah.pages.dev')).toBe('solarpanel')
    expect(isSpokeDomain('solarcell.staging.dayaberkah.pages.dev')).toBe('solarpanel')
    expect(isSpokeDomain('feature-xyz.dayaberkah.pages.dev')).toBeNull()

    expect(isSpokeDomain('dashboard.dayaberkah.id')).toBeNull()
    expect(isSpokeDomain('unknown.dayaberkah.id')).toBeNull()
    expect(isSpokeDomain('dayaberkah.id')).toBeNull()
  })
})
