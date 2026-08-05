import { describe, it, expect, beforeEach } from '@jest/globals'

const mockCreateClient = jest.fn((config: unknown) => ({
  fetch: jest.fn(),
  config: () => config,
}))

jest.mock('next-sanity', () => ({
  createClient: (config: unknown) => mockCreateClient(config),
}))

jest.mock('@/lib/config/env', () => ({
  getSanityEnv: jest.fn(() => ({
    SANITY_PROJECT_ID: 'testproject',
    SANITY_DATASET: 'production',
    SANITY_API_VERSION: 'v2025-05-21',
    SANITY_API_READ_TOKEN: 'sktesttoken',
  })),
}))

describe('Sanity Client', () => {
  beforeEach(() => {
    mockCreateClient.mockClear()
  })

  it('should create client with verified options', async () => {
    const { client } = await import('../client')
    expect(mockCreateClient).toHaveBeenCalled()
    const callArg = mockCreateClient.mock.calls[0][0] as { projectId: string; dataset: string; apiVersion: string; token: string }
    expect(callArg.projectId).toBe('testproject')
    expect(callArg.dataset).toBe('production')
    expect(callArg.apiVersion).toBe('v2025-05-21')
    expect(callArg.token).toBe('sktesttoken')
    expect(client).toBeDefined()
  })

  it('should build fetch options properly', async () => {
    const { createFetchOptions } = await import('../client')
    const options = createFetchOptions(['sanity:product'], 60)
    expect(options).toEqual({
      next: {
        revalidate: 60,
        tags: ['sanity:product'],
      },
    })
  })

  it('should define cache tags helper functions', async () => {
    const { CACHE_TAGS } = await import('../client')
    expect(CACHE_TAGS.product()).toBe('sanity:product')
    expect(CACHE_TAGS.product('123')).toBe('sanity:product:123')
    expect(CACHE_TAGS.spoke('pju')).toBe('sanity:spoke:pju')
    expect(CACHE_TAGS.spokeConfig()).toBe('sanity:spokeConfig')
    expect(CACHE_TAGS.spokeConfig('123')).toBe('sanity:spokeConfig:123')
    expect(CACHE_TAGS.certification()).toBe('sanity:certification')
    expect(CACHE_TAGS.certification('123')).toBe('sanity:certification:123')
    expect(CACHE_TAGS.portfolio()).toBe('sanity:portfolio')
    expect(CACHE_TAGS.portfolio('123')).toBe('sanity:portfolio:123')
    expect(CACHE_TAGS.page()).toBe('sanity:page')
    expect(CACHE_TAGS.page('123')).toBe('sanity:page:123')
    expect(CACHE_TAGS.all).toBe('sanity:all')
  })
})
