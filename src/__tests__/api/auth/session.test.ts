import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { requireAuth, requireDashboardAccess, getServerSession } from '../../../lib/auth/auth-guard'
import { auth } from '../../../lib/auth/auth.config'

// Mock next/navigation redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`Redirect to ${url}`)
  }),
}))

// Mock Auth.js config module
jest.mock('../../../lib/auth/auth.config', () => ({
  auth: jest.fn(),
}))

const mockAuth = auth as any

describe('GET /api/auth/session Integration Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return session payload when user is authenticated', async () => {
    const mockSession = {
      user: {
        name: 'System Admin',
        email: 'admin@dbsn.co.id',
        role: 'ADMIN',
      },
      expires: '2026-07-21T05:29:32.000Z',
    }
    mockAuth.mockResolvedValueOnce(mockSession)

    const session = await getServerSession()
    expect(session).toEqual(mockSession)
    expect(mockAuth).toHaveBeenCalled()
  })

  it('should return null when user is unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const session = await getServerSession()
    expect(session).toBeNull()
    expect(mockAuth).toHaveBeenCalled()
  })

  it('requireAuth should succeed for authenticated session', async () => {
    const mockSession = {
      user: {
        name: 'System Admin',
        email: 'admin@dbsn.co.id',
        role: 'ADMIN',
      },
    }
    mockAuth.mockResolvedValueOnce(mockSession)

    const result = await requireAuth()
    expect(result).toEqual(mockSession)
  })

  it('requireAuth should redirect to /login for unauthenticated session', async () => {
    mockAuth.mockResolvedValueOnce(null)

    await expect(requireAuth()).rejects.toThrow('Redirect to /login')
  })
})
