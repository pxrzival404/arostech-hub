import { describe, it, expect, beforeEach } from '@jest/globals'
import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }))

const mockNextRequest = jest.fn()
const mockNextResponse = { json: jest.fn() }
jest.mock('next/server', () => ({
  NextRequest: mockNextRequest,
  NextResponse: mockNextResponse,
}))

jest.mock('@/lib/api/sanity/client', () => ({
  CACHE_TAGS: {
    product: jest.fn((id?: string) => (id ? `sanity:product:${id}` : 'sanity:product')),
    certification: jest.fn((id?: string) => (id ? `sanity:certification:${id}` : 'sanity:certification')),
    portfolio: jest.fn((id?: string) => (id ? `sanity:portfolio:${id}` : 'sanity:portfolio')),
    spokeConfig: jest.fn((id?: string) => (id ? `sanity:spokeConfig:${id}` : 'sanity:spokeConfig')),
    page: jest.fn((id?: string) => (id ? `sanity:page:${id}` : 'sanity:page')),
    spoke: jest.fn((subdomain: string) => `sanity:spoke:${subdomain}`),
    all: 'sanity:all',
  },
}))

jest.mock('@/lib/config/env', () => ({
  getSanityEnv: jest.fn(() => ({
    SANITY_PROJECT_ID: 'test-project',
    SANITY_DATASET: 'test-dataset',
    SANITY_API_VERSION: 'v2025-05-21',
    SANITY_API_READ_TOKEN: 'sktesttoken',
    SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
  })),
}))

describe('POST /api/revalidate', () => {
  let POST: (request: NextRequest) => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    delete process.env.SANITY_WEBHOOK_SECRET
    jest.isolateModules(async () => {
      const route = await import('./route')
      POST = route.POST as (request: NextRequest) => Promise<unknown>
    })
  })

  it('should return 401 when signature is missing and secret is configured', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'
    const payload = { _id: 'product-1', _type: 'product', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing signature' },
      { status: 401 },
    )
  })

  it('should return 401 for invalid signature', async () => {
    process.env.SANITY_WEBHOOK_SECRET = 'test-secret'
    const payload = { _id: 'product-1', _type: 'product', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue('sha256=invalid-signature-here') },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid signature' },
      { status: 401 },
    )
  })

  it('should verify correct signature successfully and revalidate product tags', async () => {
    const secret = 'test-secret'
    process.env.SANITY_WEBHOOK_SECRET = secret
    
    const payload = { _id: 'product-1', _type: 'product', operation: 'update' }
    const rawBody = JSON.stringify(payload)
    const signature = 'sha256=' + createHmac('sha256', secret).update(rawBody).digest('hex')

    const mockRequest = {
      headers: {
        get: jest.fn().mockImplementation((header) => {
          if (header === 'sanity-webhook-signature') return signature
          return null
        }),
      },
      text: jest.fn().mockResolvedValue(rawBody),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:product:product-1', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:product', 'max')
  })

  it('should revalidate certification tags', async () => {
    const payload = { _id: 'cert-1', _type: 'certification', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:certification:cert-1', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:certification', 'max')
  })

  it('should revalidate portfolio tags', async () => {
    const payload = { _id: 'port-1', _type: 'portfolioEntry', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:portfolio:port-1', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:portfolio', 'max')
  })

  it('should revalidate spoke config tags', async () => {
    const payload = { _id: 'spoke-1', _type: 'spokeConfig', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:spokeConfig:spoke-1', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:spokeConfig', 'max')
  })

  it('should revalidate page tags', async () => {
    const payload = { _id: 'page-1', _type: 'page', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(revalidateTag).toHaveBeenCalledWith('sanity:all', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:page:page-1', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('sanity:page', 'max')
  })

  it('should handle request parsing errors', async () => {
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockRejectedValue(new Error('JSON parse error')),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Revalidation failed', message: 'JSON parse error' }),
      { status: 500 },
    )
  })

  it('should return 400 for unknown document type', async () => {
    const payload = { _id: 'unknown-1', _type: 'unknownType', operation: 'update' }
    const mockRequest = {
      headers: { get: jest.fn().mockReturnValue(null) },
      text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
    } as unknown as NextRequest

    await POST(mockRequest)
    expect(mockNextResponse.json).toHaveBeenCalledWith(
      { error: 'Unknown document type' },
      { status: 400 },
    )
  })
})

describe('GET /api/revalidate', () => {
  let GET: () => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    delete process.env.SANITY_WEBHOOK_SECRET
    jest.isolateModules(async () => {
      const route = await import('./route')
      GET = route.GET as () => Promise<unknown>
    })
  })

  it('should return webhook not configured status', async () => {
    await GET()
    expect(mockNextResponse.json).toHaveBeenCalledWith({ status: 'ok', webhookConfigured: false })
  })
})
