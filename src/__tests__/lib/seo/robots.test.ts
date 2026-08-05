import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import robots from '../../../app/robots'
import { headers } from 'next/headers'

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockHeadersFn = headers as any

describe('Robots.txt Generator', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'dayaberkah.id'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('allows root for all user agents and disallows private directories', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'dayaberkah.id'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    const result = await robots()

    expect(result.rules).toEqual(
      expect.objectContaining({
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/_next/', '/login', '/lupa-kata-sandi'],
      })
    )
  })

  it('blocks indexing entirely on dashboard domains', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'dashboard.dayaberkah.id'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    const result = await robots()

    expect(result.rules).toEqual({
      userAgent: '*',
      disallow: '/',
    })
  })

  it('returns correct sitemap url for hub domain', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'dayaberkah.id'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    const result = await robots()
    expect(result.sitemap).toBe('https://dayaberkah.id/sitemap.xml')
  })

  it('returns subdomain sitemap url for spoke domain', async () => {
    const mockHeaders = {
      get: (key: string) => {
        if (key.toLowerCase() === 'host') return 'pju.lvh.me'
        return null
      },
    }
    mockHeadersFn.mockResolvedValue(mockHeaders)

    const result = await robots()
    expect(result.sitemap).toBe('https://pju.dayaberkah.id/sitemap.xml')
  })
})
