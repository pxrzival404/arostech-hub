import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { prisma } from '../../../../lib/db/prisma'
import { NotificationQueue } from '../../../../lib/api/notifications/queue'
import { sendRfqAcknowledgment, sendInternalNotification } from '../../../../lib/api/notifications/resend'
import { alertNewRfq, alertQueueFailure } from '../../../../lib/api/notifications/telegram'

// Mock Prisma client singleton
jest.mock('../../../../lib/db/prisma', () => ({
  prisma: {
    notificationJob: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock Notification services
jest.mock('../../../../lib/api/notifications/resend', () => ({
  sendRfqAcknowledgment: jest.fn(),
  sendInternalNotification: jest.fn(),
}))

jest.mock('../../../../lib/api/notifications/telegram', () => ({
  alertNewRfq: jest.fn(),
  alertQueueFailure: jest.fn(),
}))

const mockJobCreate = prisma.notificationJob.create as any
const mockJobFindUnique = prisma.notificationJob.findUnique as any
const mockJobFindMany = prisma.notificationJob.findMany as any
const mockJobUpdate = prisma.notificationJob.update as any

const mockSendRfqAck = sendRfqAcknowledgment as any
const mockSendInternalNotif = sendInternalNotification as any
const mockAlertNew = alertNewRfq as any
const mockAlertQueueFailure = alertQueueFailure as any

describe('NotificationQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Date.now to have predictable values
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-06-03T15:30:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('enqueue', () => {
    it('persists a PENDING job to Postgres', async () => {
      const mockJob = {
        id: 'job-123',
        type: 'EMAIL_ACK',
        leadId: 'lead-123',
        payload: { test: true },
        status: 'PENDING',
        attempts: 0,
        maxAttempts: 3,
        nextAttemptAt: new Date(),
      }
      mockJobCreate.mockResolvedValue(mockJob)

      // Mock processJob inside the class to avoid immediate processing in enqueue test
      const processJobSpy = jest.spyOn(NotificationQueue, 'processJob').mockResolvedValue(undefined)

      const result = await NotificationQueue.enqueue('EMAIL_ACK', 'lead-123', { test: true })

      expect(mockJobCreate).toHaveBeenCalledWith({
        data: {
          type: 'EMAIL_ACK',
          leadId: 'lead-123',
          payload: { test: true },
          status: 'PENDING',
          attempts: 0,
          maxAttempts: 3,
          nextAttemptAt: new Date('2026-06-03T15:30:00.000Z'),
        },
      })
      expect(result).toEqual(mockJob)
      expect(processJobSpy).toHaveBeenCalledWith('job-123')
      processJobSpy.mockRestore()
    })
  })

  describe('processJob', () => {
    const mockLead = {
      id: 'lead-123',
      contactName: 'Test Buyer',
      contactEmail: 'buyer@example.com',
      segment: 'B2B',
    }

    const mockJob = {
      id: 'job-123',
      type: 'EMAIL_ACK',
      leadId: 'lead-123',
      payload: { test: true },
      status: 'PENDING',
      attempts: 0,
      maxAttempts: 3,
      lead: mockLead,
    }

    it('marks COMPLETED on successful delivery', async () => {
      // Find returns the job
      mockJobFindUnique.mockResolvedValue(mockJob)

      // First update moves to PROCESSING and increments attempts
      mockJobUpdate.mockResolvedValueOnce({
        ...mockJob,
        status: 'PROCESSING',
        attempts: 1,
      })

      // Mock notification success
      mockSendRfqAck.mockResolvedValue(undefined)

      // Execute processJob
      await NotificationQueue.processJob('job-123')

      // Concurrency check update
      expect(mockJobUpdate).toHaveBeenNthCalledWith(1, {
        where: {
          id: 'job-123',
          status: { in: ['PENDING', 'FAILED'] },
        },
        data: {
          status: 'PROCESSING',
          lastAttemptAt: new Date('2026-06-03T15:30:00.000Z'),
          attempts: { increment: 1 },
        },
      })

      // Excecute check
      expect(mockSendRfqAck).toHaveBeenCalledWith(mockLead)

      // Final completed update
      expect(mockJobUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'job-123' },
        data: {
          status: 'COMPLETED',
          nextAttemptAt: null,
          errorLog: null,
        },
      })
    })

    it('schedules retry with exponential backoff on failure (1st attempt)', async () => {
      mockJobFindUnique.mockResolvedValue(mockJob)

      // Concurrency update: attempts incremented to 1
      mockJobUpdate.mockResolvedValueOnce({
        ...mockJob,
        status: 'PROCESSING',
        attempts: 1,
      })

      // Mock notification failure
      const error = new Error('SMTP Timeout')
      mockSendRfqAck.mockRejectedValue(error)

      await NotificationQueue.processJob('job-123')

      // Check retry backoff update (1s for 1st failed attempt: Math.pow(2, 0) * 1000)
      expect(mockJobUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'job-123' },
        data: {
          status: 'PENDING',
          nextAttemptAt: new Date(Date.now() + 1000), // 1s
          errorLog: 'SMTP Timeout',
        },
      })
      expect(mockAlertQueueFailure).not.toHaveBeenCalled()
    })

    it('schedules retry with exponential backoff on failure (2nd attempt)', async () => {
      mockJobFindUnique.mockResolvedValue({
        ...mockJob,
        attempts: 1,
      })

      // Concurrency update: attempts incremented to 2
      mockJobUpdate.mockResolvedValueOnce({
        ...mockJob,
        status: 'PROCESSING',
        attempts: 2,
      })

      const error = new Error('SMTP Timeout')
      mockSendRfqAck.mockRejectedValue(error)

      await NotificationQueue.processJob('job-123')

      // Check retry backoff update (2s for 2nd failed attempt: Math.pow(2, 1) * 1000)
      expect(mockJobUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'job-123' },
        data: {
          status: 'PENDING',
          nextAttemptAt: new Date(Date.now() + 2000), // 2s
          errorLog: 'SMTP Timeout',
        },
      })
      expect(mockAlertQueueFailure).not.toHaveBeenCalled()
    })

    it('marks FAILED and triggers Telegram admin alert on 3rd failure', async () => {
      mockJobFindUnique.mockResolvedValue({
        ...mockJob,
        attempts: 2,
      })

      // Concurrency update: attempts incremented to 3
      mockJobUpdate.mockResolvedValueOnce({
        ...mockJob,
        status: 'PROCESSING',
        attempts: 3,
      })

      // Final failure update
      mockJobUpdate.mockResolvedValueOnce({
        ...mockJob,
        status: 'FAILED',
        attempts: 3,
      })

      const error = new Error('Fatal API Error')
      mockSendRfqAck.mockRejectedValue(error)

      await NotificationQueue.processJob('job-123')

      // Check final FAILED update
      expect(mockJobUpdate).toHaveBeenNthCalledWith(2, {
        where: { id: 'job-123' },
        data: {
          status: 'FAILED',
          nextAttemptAt: null,
          errorLog: 'Fatal API Error',
        },
      })

      // Verify Telegram admin alert is fired
      expect(mockAlertQueueFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'job-123',
          attempts: 3,
        }),
        error
      )
    })

    it('aborts silently if job is not found or is in an invalid status', async () => {
      mockJobFindUnique.mockResolvedValue(null)

      await NotificationQueue.processJob('job-123')
      expect(mockJobUpdate).not.toHaveBeenCalled()

      mockJobFindUnique.mockResolvedValue({
        ...mockJob,
        status: 'PROCESSING',
      })
      await NotificationQueue.processJob('job-123')
      expect(mockJobUpdate).not.toHaveBeenCalled()
    })
  })

  describe('processAllPending', () => {
    it('fetches PENDING/FAILED jobs and processes them', async () => {
      const mockJobs = [
        { id: 'job-1', status: 'PENDING' },
        { id: 'job-2', status: 'FAILED' },
      ]
      mockJobFindMany.mockResolvedValue(mockJobs)

      const processJobSpy = jest.spyOn(NotificationQueue, 'processJob').mockResolvedValue(undefined)

      await NotificationQueue.processAllPending()

      expect(mockJobFindMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['PENDING', 'FAILED'] },
          nextAttemptAt: { lte: new Date('2026-06-03T15:30:00.000Z') },
        },
      })
      expect(processJobSpy).toHaveBeenCalledWith('job-1')
      expect(processJobSpy).toHaveBeenCalledWith('job-2')
      processJobSpy.mockRestore()
    })
  })
})
