import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { requireAuth, requireDashboardAccess, checkDashboardAccess, getServerSession } from '../auth-guard'
import { prisma } from '../../db/prisma'
import { auth } from '../auth.config'

// Mock next/navigation redirect function to throw a traceable error
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`Redirect to ${url}`)
  }),
}))

// Mock Prisma client singleton
jest.mock('../../db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    lead: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock Auth.js config module
jest.mock('../auth.config', () => ({
  auth: jest.fn(),
}))

const mockUserFindUnique = prisma.user.findUnique as any
const mockLeadFindUnique = prisma.lead.findUnique as any
const mockAuth = auth as any

describe('Auth Guards & Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getServerSession()', () => {
    it('should return session if authenticated', async () => {
      const mockSession = { user: { email: 'test@example.com' } }
      mockAuth.mockResolvedValueOnce(mockSession)

      const session = await getServerSession()
      expect(session).toEqual(mockSession)
      expect(mockAuth).toHaveBeenCalled()
    })
  })

  describe('checkDashboardAccess()', () => {
    it('should return false if user does not exist', async () => {
      mockUserFindUnique.mockResolvedValueOnce(null)

      const result = await checkDashboardAccess('missing@example.com')
      expect(result).toBe(false)
    })

    it('should return false if user is inactive', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'inactive@example.com',
        isActive: false,
        role: 'CLIENT',
      })

      const result = await checkDashboardAccess('inactive@example.com')
      expect(result).toBe(false)
    })

    it('should return true for internal roles (ADMIN/VIEWER) if active', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'admin@example.com',
        isActive: true,
        role: 'ADMIN',
      })

      const result = await checkDashboardAccess('admin@example.com')
      expect(result).toBe(true)
    })

    it('should return false for CLIENT role without linkedLeadId', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'client@example.com',
        isActive: true,
        role: 'CLIENT',
        linkedLeadId: null,
      })

      const result = await checkDashboardAccess('client@example.com')
      expect(result).toBe(false)
    })

    it('should return false if linked lead does not have GRANTED access status', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'client@example.com',
        isActive: true,
        role: 'CLIENT',
        linkedLeadId: 'lead-123',
      })
      mockLeadFindUnique.mockResolvedValueOnce({
        id: 'lead-123',
        dashboardAccessStatus: 'PENDING',
      })

      const result = await checkDashboardAccess('client@example.com')
      expect(result).toBe(false)
    })

    it('should return true if client lead has GRANTED access status', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'client@example.com',
        isActive: true,
        role: 'CLIENT',
        linkedLeadId: 'lead-123',
      })
      mockLeadFindUnique.mockResolvedValueOnce({
        id: 'lead-123',
        dashboardAccessStatus: 'GRANTED',
      })

      const result = await checkDashboardAccess('client@example.com')
      expect(result).toBe(true)
    })
  })

  describe('requireAuth()', () => {
    it('should return session if authenticated and no role specified', async () => {
      const mockSession = { user: { role: 'CLIENT' } }
      mockAuth.mockResolvedValueOnce(mockSession)

      const result = await requireAuth()
      expect(result).toEqual(mockSession)
    })

    it('should throw redirect to /login if unauthenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      await expect(requireAuth()).rejects.toThrow('Redirect to /login')
    })

    it('should return session if role matches exactly', async () => {
      const mockSession = { user: { role: 'ADMIN' } }
      mockAuth.mockResolvedValueOnce(mockSession)

      const result = await requireAuth('ADMIN')
      expect(result).toEqual(mockSession)
    })

    it('should throw redirect to /login on role mismatch', async () => {
      const mockSession = { user: { role: 'CLIENT' } }
      mockAuth.mockResolvedValueOnce(mockSession)

      await expect(requireAuth('ADMIN')).rejects.toThrow('Redirect to /login')
    })
  })

  describe('requireDashboardAccess()', () => {
    it('should throw redirect to /login if session is missing', async () => {
      mockAuth.mockResolvedValueOnce(null)

      await expect(requireDashboardAccess()).rejects.toThrow('Redirect to /login')
    })

    it('should throw redirect to /login if access check fails', async () => {
      mockAuth.mockResolvedValueOnce({ user: { email: 'client@example.com', role: 'CLIENT' } })
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'client@example.com',
        isActive: true,
        role: 'CLIENT',
        linkedLeadId: 'lead-123',
      })
      mockLeadFindUnique.mockResolvedValueOnce({
        id: 'lead-123',
        dashboardAccessStatus: 'PENDING',
      })

      await expect(requireDashboardAccess()).rejects.toThrow('Redirect to /login')
    })

    it('should return session if access check passes', async () => {
      const mockSession = { user: { email: 'client@example.com', role: 'CLIENT' } }
      mockAuth.mockResolvedValueOnce(mockSession)
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'client@example.com',
        isActive: true,
        role: 'CLIENT',
        linkedLeadId: 'lead-123',
      })
      mockLeadFindUnique.mockResolvedValueOnce({
        id: 'lead-123',
        dashboardAccessStatus: 'GRANTED',
      })

      const result = await requireDashboardAccess()
      expect(result).toEqual(mockSession)
    })
  })
})
