import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { NotificationQueue } from '../../../lib/api/notifications/queue'

// Mock next/server response
const mockNextResponse = {
  json: jest.fn((body: any, init?: any) => {
    return {
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    } as any
  }),
}
jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}))

// Mock Notification Queue
jest.mock('../../../lib/api/notifications/queue', () => ({
  NotificationQueue: {
    processAllPending: jest.fn(),
  },
}))

const mockProcessAllPending = NotificationQueue.processAllPending as any

import { GET } from '../../../app/api/cron/notifications/route'

function createMockRequest(headers: Record<string, string>): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
  } as unknown as NextRequest
}

describe('GET /api/cron/notifications Integration Tests', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should return 500 if CRON_SECRET is missing in environment', async () => {
    delete process.env.CRON_SECRET
    const req = createMockRequest({ authorization: 'Bearer secret-key' })

    const response: any = await GET(req)
    expect(response.status).toBe(500)
    
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('Cron authorization is not configured')
    expect(mockProcessAllPending).not.toHaveBeenCalled()
  })

  it('should return 401 if Authorization header is missing or incorrect', async () => {
    process.env.CRON_SECRET = 'correct-secret'
    const req = createMockRequest({ authorization: 'Bearer wrong-secret' })

    const response: any = await GET(req)
    expect(response.status).toBe(401)
    
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Unauthorized')
    expect(mockProcessAllPending).not.toHaveBeenCalled()
  })

  it('should return 200 and process queue when Authorization header matches Bearer token', async () => {
    process.env.CRON_SECRET = 'correct-secret'
    mockProcessAllPending.mockResolvedValueOnce(undefined)
    const req = createMockRequest({ authorization: 'Bearer correct-secret' })

    const response: any = await GET(req)
    expect(response.status).toBe(200)
    
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.message).toBe('Notification queue processed successfully')
    expect(mockProcessAllPending).toHaveBeenCalledTimes(1)
  })

  it('should return 200 and process queue when custom x-cron-secret header matches', async () => {
    process.env.CRON_SECRET = 'correct-secret'
    mockProcessAllPending.mockResolvedValueOnce(undefined)
    const req = createMockRequest({ 'x-cron-secret': 'correct-secret' })

    const response: any = await GET(req)
    expect(response.status).toBe(200)
    
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(mockProcessAllPending).toHaveBeenCalledTimes(1)
  })

  it('should return 500 when NotificationQueue.processAllPending throws an error', async () => {
    process.env.CRON_SECRET = 'correct-secret'
    mockProcessAllPending.mockRejectedValueOnce(new Error('Database error'))
    const req = createMockRequest({ authorization: 'Bearer correct-secret' })

    const response: any = await GET(req)
    expect(response.status).toBe(500)
    
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe('Database error')
  })
})
