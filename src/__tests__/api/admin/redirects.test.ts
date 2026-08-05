import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'

// Mock next/server response helper
const mockNextResponse = {
  json: jest.fn((data: any, init?: any) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(data),
    headers: {
      get: (name: string) => init?.headers?.[name] || null
    }
  }))
}

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: mockNextResponse,
}))

// Mock Auth Guard
jest.mock('../../../lib/auth/auth-guard', () => ({
  requireAuth: jest.fn(),
}))

// Mock Prisma
jest.mock('../../../lib/db/prisma', () => ({
  prisma: {
    redirectMap: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock Cache Clear utility
jest.mock('../../../lib/middleware/redirect-engine', () => ({
  clearCache: jest.fn(),
}))

import { requireAuth } from '../../../lib/auth/auth-guard'
import { prisma } from '../../../lib/db/prisma'
import { clearCache } from '../../../lib/middleware/redirect-engine'

const mockRequireAuth = requireAuth as any
const mockFindMany = prisma.redirectMap.findMany as any
const mockFindUnique = prisma.redirectMap.findUnique as any
const mockCreate = prisma.redirectMap.create as any
const mockUpdate = prisma.redirectMap.update as any
const mockDelete = prisma.redirectMap.delete as any
const mockClearCache = clearCache as any

function createMockRequest(payload: any, searchParams: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/admin/redirects')
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v))
  
  return {
    nextUrl: url,
    json: jest.fn(() => Promise.resolve(payload)),
  } as unknown as NextRequest
}

describe('Admin Redirects API Endpoint', () => {
  let GET: any
  let POST: any
  let DELETE: any

  beforeEach(async () => {
    jest.clearAllMocks()

    // Dynamically import Route Handler after resetting module state
    jest.isolateModules(async () => {
      const route = await import('../../../app/api/admin/redirects/route')
      GET = route.GET
      POST = route.POST
      DELETE = route.DELETE
    })
  })

  describe('Authorization checks', () => {
    it('blocks GET requests if user is not ADMIN', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Redirect to /login'))
      
      const req = createMockRequest({})
      await expect(GET(req)).rejects.toThrow('Redirect to /login')
      expect(mockRequireAuth).toHaveBeenCalledWith('ADMIN')
    })

    it('blocks POST requests if user is not ADMIN', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Redirect to /login'))
      
      const req = createMockRequest({ legacyUrl: '/test', targetUrl: '/new', spoke: 'hub' })
      await expect(POST(req)).rejects.toThrow('Redirect to /login')
      expect(mockRequireAuth).toHaveBeenCalledWith('ADMIN')
    })

    it('blocks DELETE requests if user is not ADMIN', async () => {
      mockRequireAuth.mockRejectedValue(new Error('Redirect to /login'))
      
      const req = createMockRequest({}, { legacyUrl: '/test' })
      await expect(DELETE(req)).rejects.toThrow('Redirect to /login')
      expect(mockRequireAuth).toHaveBeenCalledWith('ADMIN')
    })
  })

  describe('GET handler', () => {
    it('returns all redirects ordered by hitCount descending', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      
      const mockRedirects = [
        { legacyUrl: '/old-1', targetUrl: '/new-1', spoke: 'hub', hitCount: 15 },
        { legacyUrl: '/old-2', targetUrl: '/new-2', spoke: 'pju', hitCount: 5 }
      ]
      mockFindMany.mockResolvedValue(mockRedirects)

      const req = createMockRequest({})
      const res = await GET(req)

      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: { hitCount: 'desc' }
      })
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        redirects: mockRedirects
      })
    })

    it('returns 500 error if query fails', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      mockFindMany.mockRejectedValue(new Error('DB connection lost'))

      const req = createMockRequest({})
      await GET(req)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Failed to fetch redirect maps' },
        { status: 500 }
      )
    })
  })

  describe('POST handler', () => {
    it('returns 400 when input validation fails (e.g. missing targetUrl)', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      
      const req = createMockRequest({ legacyUrl: '/old-path' }) // targetUrl missing
      await POST(req)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, error: expect.anything() }),
        { status: 400 }
      )
    })

    it('creates a new redirect map and clears the engine cache if it does not exist', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      mockFindUnique.mockResolvedValue(null)
      
      const newRedirect = { legacyUrl: '/old-path', targetUrl: '/new-path', spoke: 'solarcell' }
      mockCreate.mockResolvedValue({ ...newRedirect, hitCount: 0 })

      const req = createMockRequest(newRedirect)
      await POST(req)

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { legacyUrl: '/old-path' } })
      expect(mockCreate).toHaveBeenCalledWith({ data: newRedirect })
      expect(mockClearCache).toHaveBeenCalled()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { success: true, redirect: { ...newRedirect, hitCount: 0 } },
        { status: 201 }
      )
    })

    it('updates an existing redirect map and clears the engine cache', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      mockFindUnique.mockResolvedValue({ legacyUrl: '/old-path', targetUrl: '/old-target', spoke: 'hub', hitCount: 2 })
      
      const updateData = { legacyUrl: '/old-path', targetUrl: '/new-target', spoke: 'pju' }
      mockUpdate.mockResolvedValue({ ...updateData, hitCount: 2 })

      const req = createMockRequest(updateData)
      await POST(req)

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { legacyUrl: '/old-path' } })
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { legacyUrl: '/old-path' },
        data: { targetUrl: '/new-target', spoke: 'pju' }
      })
      expect(mockClearCache).toHaveBeenCalled()
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { success: true, redirect: { ...updateData, hitCount: 2 } },
        { status: 200 }
      )
    })
  })

  describe('DELETE handler', () => {
    it('returns 400 if legacyUrl is missing', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      
      const req = createMockRequest({})
      await DELETE(req)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'legacyUrl query parameter or body field is required' },
        { status: 400 }
      )
    })

    it('returns 404 if redirect map does not exist', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      mockFindUnique.mockResolvedValue(null)

      const req = createMockRequest({}, { legacyUrl: '/non-existent' })
      await DELETE(req)

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { legacyUrl: '/non-existent' } })
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { success: false, error: 'Redirect map not found' },
        { status: 404 }
      )
    })

    it('deletes the redirect map and clears engine cache', async () => {
      mockRequireAuth.mockResolvedValue({ user: { role: 'ADMIN' } })
      mockFindUnique.mockResolvedValue({ legacyUrl: '/old-path', targetUrl: '/new-path', spoke: 'hub' })

      const req = createMockRequest({}, { legacyUrl: '/old-path' })
      await DELETE(req)

      expect(mockDelete).toHaveBeenCalledWith({ where: { legacyUrl: '/old-path' } })
      expect(mockClearCache).toHaveBeenCalled()
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Redirect map deleted successfully'
      })
    })
  })
})
