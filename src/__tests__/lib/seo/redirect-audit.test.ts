import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { auditRedirects } from '../../../lib/seo/redirect-audit'
import { prisma } from '../../../lib/db/prisma'

// Mock Prisma
jest.mock('../../../lib/db/prisma', () => ({
  prisma: {
    redirectMap: {
      findMany: jest.fn(),
    },
  },
}))

const mockFindMany = prisma.redirectMap.findMany as any

describe('Redirect Audit Utility', () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    jest.clearAllMocks()
    originalFetch = global.fetch
    global.fetch = jest.fn() as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('handles empty redirect table', async () => {
    mockFindMany.mockResolvedValue([])

    const report = await auditRedirects({ baseUrl: 'https://dayaberkah.id', checkStatus: true })

    expect(report.totalRedirects).toBe(0)
    expect(report.chains).toHaveLength(0)
    expect(report.loops).toHaveLength(0)
    expect(report.brokenTargets).toHaveLength(0)
  })

  it('detects redirect chains and loops offline', async () => {
    mockFindMany.mockResolvedValue([
      { legacyUrl: '/legacy-a', targetUrl: '/legacy-b', spoke: null },
      { legacyUrl: '/legacy-b', targetUrl: '/target-c', spoke: null },
      { legacyUrl: '/loop-1', targetUrl: '/loop-2', spoke: 'pju' },
      { legacyUrl: '/loop-2', targetUrl: '/loop-1', spoke: 'pju' },
    ])

    // Mock fetch to succeed for all targets (so we don't flag them as broken)
    ;(global.fetch as any).mockResolvedValue({
      status: 200,
      ok: true,
    })

    const report = await auditRedirects({ baseUrl: 'https://dayaberkah.id', checkStatus: false })

    expect(report.totalRedirects).toBe(4)
    
    // Chain /legacy-a -> /legacy-b -> /target-c
    expect(report.chains).toHaveLength(1)
    expect(report.chains[0]).toEqual({
      source: '/legacy-a',
      intermediate: '/legacy-b',
      finalTarget: '/target-c',
    })

    // Loop /loop-1 -> /loop-2 -> /loop-1
    expect(report.loops).toHaveLength(1)
    expect(report.loops[0].urls).toContain('/loop-1')
    expect(report.loops[0].urls).toContain('/loop-2')
  })

  it('detects broken target URLs when checkStatus is true', async () => {
    mockFindMany.mockResolvedValue([
      { legacyUrl: '/legacy-1', targetUrl: '/target-ok', spoke: null },
      { legacyUrl: '/legacy-2', targetUrl: '/target-404', spoke: null },
    ])

    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/target-ok')) {
        return Promise.resolve({ status: 200, ok: true })
      }
      return Promise.resolve({ status: 404, ok: false })
    })

    const report = await auditRedirects({ baseUrl: 'https://dayaberkah.id', checkStatus: true })

    expect(report.totalRedirects).toBe(2)
    expect(report.brokenTargets).toHaveLength(1)
    expect(report.brokenTargets[0]).toEqual({
      source: '/legacy-2',
      target: '/target-404',
      status: 404,
      error: 'HTTP 404',
    })
  })
})
