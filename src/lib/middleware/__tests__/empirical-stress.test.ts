import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  cleanHostname,
  isLocalDevelopment,
  extractSubdomain,
  isHubDomain,
  isDashboardDomain,
  isSpokeDomain,
  resolveSubdomainAlias,
  SUBDOMAIN_ALIASES,
  SPOKE_SUBDOMAINS,
} from '../config'
import { parseCloudflarePagesHost, isCloudflarePagesHost } from '../../utils/pages-host'

describe('Empirical Subdomain Routing Stress Testing (Milestone 3)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('1. Alias Resolution (resolveSubdomainAlias)', () => {
    it('resolves explicit aliases correctly', () => {
      expect(resolveSubdomainAlias('solarcell')).toBe('solarpanel')
      expect(resolveSubdomainAlias('alatpetir')).toBe('penangkalpetir')
    })

    it('passes through canonical spoke names unchanged', () => {
      expect(resolveSubdomainAlias('pju')).toBe('pju')
      expect(resolveSubdomainAlias('solarpanel')).toBe('solarpanel')
      expect(resolveSubdomainAlias('penangkalpetir')).toBe('penangkalpetir')
      expect(resolveSubdomainAlias('baterai')).toBe('baterai')
    })

    it('passes through unknown subdomains unchanged', () => {
      expect(resolveSubdomainAlias('unknown')).toBe('unknown')
      expect(resolveSubdomainAlias('dashboard')).toBe('dashboard')
    })

    it('documents case sensitivity behavior in resolveSubdomainAlias', () => {
      // Direct dictionary lookup SUBDOMAIN_ALIASES[subdomain] is case-sensitive
      expect(resolveSubdomainAlias('SOLARCELL')).toBe('SOLARCELL')
      expect(resolveSubdomainAlias('ALATPETIR')).toBe('ALATPETIR')
    })
  })

  describe('2. Subdomain Extraction (extractSubdomain)', () => {
    it('extracts spokes, dashboard, and hub for production domain (dayaberkah.id)', () => {
      expect(extractSubdomain('dayaberkah.id')).toBeNull()
      expect(extractSubdomain('www.dayaberkah.id')).toBeNull()
      expect(extractSubdomain('pju.dayaberkah.id')).toBe('pju')
      expect(extractSubdomain('solarpanel.dayaberkah.id')).toBe('solarpanel')
      expect(extractSubdomain('solarcell.dayaberkah.id')).toBe('solarpanel')
      expect(extractSubdomain('penangkalpetir.dayaberkah.id')).toBe('penangkalpetir')
      expect(extractSubdomain('alatpetir.dayaberkah.id')).toBe('penangkalpetir')
      expect(extractSubdomain('baterai.dayaberkah.id')).toBe('baterai')
      expect(extractSubdomain('dashboard.dayaberkah.id')).toBe('dashboard')
      expect(extractSubdomain('unknown.dayaberkah.id')).toBe('unknown')
    })

    it('extracts spokes, dashboard, and hub for local development (lvh.me)', () => {
      expect(extractSubdomain('lvh.me')).toBeNull()
      expect(extractSubdomain('lvh.me:3000')).toBeNull()
      expect(extractSubdomain('www.lvh.me:3000')).toBeNull()
      expect(extractSubdomain('pju.lvh.me:3000')).toBe('pju')
      expect(extractSubdomain('solarcell.lvh.me:8080')).toBe('solarpanel')
      expect(extractSubdomain('penangkalpetir.lvh.me')).toBe('penangkalpetir')
      expect(extractSubdomain('dashboard.lvh.me:3000')).toBe('dashboard')
      expect(extractSubdomain('unknown.lvh.me:3000')).toBe('unknown')
    })

    it('extracts subdomains correctly for Cloudflare Pages hosts', () => {
      // Hub root
      expect(extractSubdomain('dayaberkah.pages.dev')).toBeNull()

      // Spokes on production Pages project root
      expect(extractSubdomain('pju.dayaberkah.pages.dev')).toBe('pju')
      expect(extractSubdomain('solarcell.dayaberkah.pages.dev')).toBe('solarpanel')
      expect(extractSubdomain('alatpetir.dayaberkah.pages.dev')).toBe('penangkalpetir')
      expect(extractSubdomain('dashboard.dayaberkah.pages.dev')).toBe('dashboard')

      // Hub preview branch
      expect(extractSubdomain('feature-xyz.dayaberkah.pages.dev')).toBeNull()
      expect(extractSubdomain('staging.dayaberkah.pages.dev')).toBeNull()

      // Spoke preview branch (whitelist-first rule)
      expect(extractSubdomain('pju.feature-xyz.dayaberkah.pages.dev')).toBe('pju')
      expect(extractSubdomain('solarcell.staging.dayaberkah.pages.dev')).toBe('solarpanel')
      expect(extractSubdomain('dashboard.staging.dayaberkah.pages.dev')).toBe('dashboard')

      // Unknown subdomain on Cloudflare Pages (treated as branch preview for Hub)
      expect(extractSubdomain('unknown.dayaberkah.pages.dev')).toBeNull()
    })

    it('documents case sensitivity divergence between Pages host vs custom root domain', () => {
      // Cloudflare Pages host parser normalizes hostname to lowercase
      expect(extractSubdomain('PJU.dayaberkah.pages.dev')).toBe('pju')
      expect(extractSubdomain('SOLARCELL.dayaberkah.pages.dev')).toBe('solarpanel')

      // Custom domain host does NOT normalize case before endsWith check or alias resolution:
      // 1. Uppercase domain suffix fails endsWith('.dayaberkah.id') check:
      expect(extractSubdomain('pju.DAYABERKAH.ID')).toBeNull()
      // 2. Uppercase subdomain returns raw uppercase without lowercasing or alias resolution:
      expect(extractSubdomain('PJU.dayaberkah.id')).toBe('PJU')
      expect(extractSubdomain('SOLARCELL.dayaberkah.id')).toBe('SOLARCELL')
    })

    it('tests multi-level subdomains and edge case inputs', () => {
      expect(extractSubdomain('foo.bar.dayaberkah.id')).toBe('foo.bar')
      expect(extractSubdomain('foo.bar.lvh.me')).toBe('foo.bar')

      expect(extractSubdomain('')).toBeNull()
      expect(extractSubdomain('localhost')).toBeNull()
      expect(extractSubdomain('127.0.0.1')).toBeNull()
      expect(extractSubdomain('::1')).toBeNull()
      expect(extractSubdomain('[::1]:3000')).toBeNull()
    })
  })

  describe('3. Spoke Domain Validation (isSpokeDomain)', () => {
    it('validates canonical and alias spokes on production domain', () => {
      expect(isSpokeDomain('pju.dayaberkah.id')).toBe('pju')
      expect(isSpokeDomain('solarpanel.dayaberkah.id')).toBe('solarpanel')
      expect(isSpokeDomain('solarcell.dayaberkah.id')).toBe('solarpanel')
      expect(isSpokeDomain('penangkalpetir.dayaberkah.id')).toBe('penangkalpetir')
      expect(isSpokeDomain('alatpetir.dayaberkah.id')).toBe('penangkalpetir')
      expect(isSpokeDomain('baterai.dayaberkah.id')).toBe('baterai')
    })

    it('validates spokes on local development (lvh.me)', () => {
      expect(isSpokeDomain('pju.lvh.me:3000')).toBe('pju')
      expect(isSpokeDomain('solarcell.lvh.me:3000')).toBe('solarpanel')
      expect(isSpokeDomain('penangkalpetir.lvh.me:8080')).toBe('penangkalpetir')
    })

    it('validates spokes on Cloudflare Pages preview hosts', () => {
      expect(isSpokeDomain('pju.dayaberkah.pages.dev')).toBe('pju')
      expect(isSpokeDomain('solarcell.staging.dayaberkah.pages.dev')).toBe('solarpanel')
      expect(isSpokeDomain('alatpetir.feature-123.dayaberkah.pages.dev')).toBe('penangkalpetir')
    })

    it('rejects non-spoke domains (hub, dashboard, unknown subdomains)', () => {
      expect(isSpokeDomain('dayaberkah.id')).toBeNull()
      expect(isSpokeDomain('www.dayaberkah.id')).toBeNull()
      expect(isSpokeDomain('dashboard.dayaberkah.id')).toBeNull()
      expect(isSpokeDomain('unknown.dayaberkah.id')).toBeNull()
      expect(isSpokeDomain('feature-xyz.dayaberkah.pages.dev')).toBeNull()
      expect(isSpokeDomain('unknown.dayaberkah.pages.dev')).toBeNull()
      expect(isSpokeDomain('lvh.me:3000')).toBeNull()
    })

    it('documents impact of uppercase input on isSpokeDomain', () => {
      // Pages host lowers case, so spoke is recognized
      expect(isSpokeDomain('PJU.dayaberkah.pages.dev')).toBe('pju')
      expect(isSpokeDomain('SOLARCELL.staging.dayaberkah.pages.dev')).toBe('solarpanel')

      // Custom domain does not lower case, so isSpokeDomain fails to match SPOKE_SUBDOMAINS
      expect(isSpokeDomain('PJU.dayaberkah.id')).toBeNull()
      expect(isSpokeDomain('SOLARCELL.dayaberkah.id')).toBeNull()
    })
  })

  describe('4. Hub Domain Validation (isHubDomain)', () => {
    it('identifies hub domains for production and local environments', () => {
      expect(isHubDomain('dayaberkah.id')).toBe(true)
      expect(isHubDomain('www.dayaberkah.id')).toBe(true)
      expect(isHubDomain('lvh.me')).toBe(true)
      expect(isHubDomain('lvh.me:3000')).toBe(true)
      expect(isHubDomain('www.lvh.me:3000')).toBe(true)
      expect(isHubDomain('localhost')).toBe(true)
      expect(isHubDomain('127.0.0.1')).toBe(true)
      expect(isHubDomain('::1')).toBe(true)
      expect(isHubDomain('[::1]:3000')).toBe(true)
    })

    it('identifies hub domains on Cloudflare Pages (root & branch previews)', () => {
      expect(isHubDomain('dayaberkah.pages.dev')).toBe(true)
      expect(isHubDomain('feature-xyz.dayaberkah.pages.dev')).toBe(true)
      expect(isHubDomain('unknown.dayaberkah.pages.dev')).toBe(true)
    })

    it('returns false for spoke and dashboard domains', () => {
      expect(isHubDomain('pju.dayaberkah.id')).toBe(false)
      expect(isHubDomain('solarcell.dayaberkah.id')).toBe(false)
      expect(isHubDomain('dashboard.dayaberkah.id')).toBe(false)
      expect(isHubDomain('pju.dayaberkah.pages.dev')).toBe(false)
      expect(isHubDomain('dashboard.staging.dayaberkah.pages.dev')).toBe(false)
      expect(isHubDomain('pju.lvh.me:3000')).toBe(false)
    })

    it('documents impact of uppercase input on isHubDomain', () => {
      // Pages host lowers case in parseCloudflarePagesHost
      expect(isHubDomain('DAYABERKAH.PAGES.DEV')).toBe(true)

      // Custom domain does not lower case in isHubDomain check
      expect(isHubDomain('DAYABERKAH.ID')).toBe(false)
      expect(isHubDomain('WWW.DAYABERKAH.ID')).toBe(false)
    })
  })

  describe('5. Dashboard Domain Validation (isDashboardDomain)', () => {
    it('identifies dashboard domains across all deployment targets', () => {
      expect(isDashboardDomain('dashboard.dayaberkah.id')).toBe(true)
      expect(isDashboardDomain('dashboard.lvh.me:3000')).toBe(true)
      expect(isDashboardDomain('dashboard.dayaberkah.pages.dev')).toBe(true)
      expect(isDashboardDomain('dashboard.staging.dayaberkah.pages.dev')).toBe(true)
    })

    it('returns false for non-dashboard domains', () => {
      expect(isDashboardDomain('dayaberkah.id')).toBe(false)
      expect(isDashboardDomain('pju.dayaberkah.id')).toBe(false)
      expect(isDashboardDomain('solarcell.dayaberkah.id')).toBe(false)
      expect(isDashboardDomain('lvh.me:3000')).toBe(false)
      expect(isDashboardDomain('pju.dayaberkah.pages.dev')).toBe(false)
    })
  })
})
