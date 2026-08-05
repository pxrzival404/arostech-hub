import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { prisma } from '../../../lib/db/prisma'
import { sendPasswordResetEmail } from '@/lib/api/notifications/resend'
import bcrypt from 'bcryptjs'

// Mock next/server
const mockNextResponse = { json: jest.fn() }
jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}))

// Mock Prisma client singleton
jest.mock('../../../lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

// Mock Resend notification helper
jest.mock('@/lib/api/notifications/resend', () => ({
  sendPasswordResetEmail: jest.fn(),
}))

import { POST as forgotPasswordPOST } from '../../../app/api/auth/forgot-password/route'
import { POST as resetPasswordPOST } from '../../../app/api/auth/reset-password/route'

const mockUserFindUnique = jest.mocked(prisma.user.findUnique)
const mockUserUpdate = jest.mocked(prisma.user.update)
const mockTokenCreate = jest.mocked(prisma.verificationToken.create)
const mockTokenDelete = jest.mocked(prisma.verificationToken.delete)
const mockTokenDeleteMany = jest.mocked(prisma.verificationToken.deleteMany)
const mockTokenFindUnique = jest.mocked(prisma.verificationToken.findUnique)
const mockSendEmail = jest.mocked(sendPasswordResetEmail)

function createMockRequest(payload: unknown): NextRequest {
  return {
    json: jest.fn().mockImplementation(() => Promise.resolve(payload)),
    headers: {
      get: (name: string) => {
        if (name === 'host') return 'dashboard.dayaberkah.id'
        if (name === 'x-forwarded-proto') return 'https'
        return null
      }
    }
  } as unknown as NextRequest
}

describe('Password Reset API endpoints', () => {
  jest.setTimeout(15000)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(() => {
      process.env.CRON_SECRET = 'cron-secret'
    })

    it('should return 400 for invalid email formats', async () => {
      const req = createMockRequest({ email: 'invalid-email' })
      await forgotPasswordPOST(req)
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Email tidak valid' }),
        { status: 400 }
      )
    })

    it('should return success envelope even if user does not exist to prevent enumeration', async () => {
      mockUserFindUnique.mockResolvedValueOnce(null)
      const req = createMockRequest({ email: 'missing@example.com' })
      
      await forgotPasswordPOST(req)
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      )
      expect(mockTokenCreate).not.toHaveBeenCalled()
    })

    it('should generate verification token and call send email for active registered users', async () => {
      mockUserFindUnique.mockResolvedValueOnce({
        email: 'user@example.com',
        isActive: true,
      } as unknown as import('@prisma/client').User)
      mockTokenDeleteMany.mockResolvedValueOnce({ count: 1 })
      mockTokenCreate.mockResolvedValueOnce({ token: 'mock-token' } as unknown as import('@prisma/client').VerificationToken)
      mockSendEmail.mockResolvedValueOnce(undefined)

      const req = createMockRequest({ email: 'user@example.com' })
      await forgotPasswordPOST(req)

      expect(mockTokenDeleteMany).toHaveBeenCalledWith({
        where: { identifier: 'user@example.com' },
      })
      expect(mockTokenCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identifier: 'user@example.com',
            token: expect.any(String),
            expires: expect.any(Date),
          })
        })
      )
      expect(mockSendEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining('/konfirmasi-reset?token=')
      )
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      )
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should return 400 for short passwords', async () => {
      const req = createMockRequest({ token: 'tok-123', newPassword: '123' })
      await resetPasswordPOST(req)
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Kata sandi minimal harus 8 karakter' }),
        { status: 400 }
      )
    })

    it('should return 400 if token does not exist or has expired', async () => {
      mockTokenFindUnique.mockResolvedValueOnce(null)
      const req = createMockRequest({ token: 'invalid-tok', newPassword: 'securepassword123' })
      await resetPasswordPOST(req)
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Token tidak valid atau telah kedaluwarsa' }),
        { status: 400 }
      )
    })

    it('should update user password and delete verification token on success', async () => {
      mockTokenFindUnique.mockResolvedValueOnce({
        identifier: 'user@example.com',
        token: 'valid-tok',
        expires: new Date(Date.now() + 50000), // Valid in future
      } as unknown as import('@prisma/client').VerificationToken)
      mockUserUpdate.mockResolvedValueOnce({ email: 'user@example.com' } as unknown as import('@prisma/client').User)
      mockTokenDelete.mockResolvedValueOnce({ token: 'valid-tok' } as unknown as import('@prisma/client').VerificationToken)

      const req = createMockRequest({ token: 'valid-tok', newPassword: 'securepassword123' })
      await resetPasswordPOST(req)

      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'user@example.com' },
          data: {
            hashedPassword: expect.any(String),
          }
        })
      )
      
      // Verify bcrypt hash is applied
      const updatedHash = mockUserUpdate.mock.calls[0][0].data.hashedPassword as string
      const isValid = await bcrypt.compare('securepassword123', updatedHash)
      expect(isValid).toBe(true)

      expect(mockTokenDelete).toHaveBeenCalledWith({
        where: { token: 'valid-tok' },
      })
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      )
    })
  })
})
