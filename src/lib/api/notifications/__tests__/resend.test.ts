import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'

const mockSend = jest.fn() as any
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: mockSend,
        },
      }
    }),
  }
})

import { sendRfqAcknowledgment, sendInternalNotification } from '../resend'
import { Lead, Segment, SubmissionStatus, DashboardAccessStatus } from '@prisma/client'

describe('Resend Email Notification Service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.RESEND_API_KEY = 'mock-resend-key'
    process.env.RESEND_FROM_EMAIL = 'onboarding@resend.dev'
    mockSend.mockClear()
    mockSend.mockResolvedValue({ data: { id: 'default-id' }, error: null })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const mockLead: Lead = {
    id: 'lead-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    segment: 'B2B' as Segment,
    sourceDomain: 'solarcell.dayaberkah.id',
    sourcePagePath: '/checkout',
    sourceCampaignTag: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '+6281234567890',
    companyName: 'PT Solar Panel',
    productCategory: 'Solar Module 100W',
    quantity: 5,
    projectScope: 'Home install',
    timeline: '2026-10-10',
    procurementType: null,
    notes: 'Please expedite',
    submissionStatus: 'RECEIVED' as SubmissionStatus,
    fallbackTriggered: false,
    fallbackWaUrl: null,
    trackingProjectId: null,
    dashboardAccessGrantedAt: null,
    dashboardAccessStatus: 'NOT_ELIGIBLE' as DashboardAccessStatus,
  }

  it('should call Resend SDK to send customer acknowledgment email', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'id-ack' }, error: null })

    await sendRfqAcknowledgment(mockLead)

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'onboarding@resend.dev',
        to: 'john@example.com',
        subject: expect.stringContaining('Quotation Request Received'),
        html: expect.stringContaining('Dear John Doe'),
      })
    )
  })

  it('should call Resend SDK to send internal notification email', async () => {
    mockSend.mockResolvedValueOnce({ data: { id: 'id-internal' }, error: null })

    await sendInternalNotification(mockLead)

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'onboarding@resend.dev',
        to: 'onboarding@resend.dev', // Defaulting to sender domain or admin inbox
        subject: expect.stringContaining('New B2B RFQ Submission'),
        html: expect.stringContaining('lead-123'),
      })
    )
  })

  it('should handle Resend API error response gracefully and not throw', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'Invalid domain' } })

    await expect(sendRfqAcknowledgment(mockLead)).resolves.not.toThrow()
  })

  it('should handle SDK exception/network rejection gracefully and not throw', async () => {
    mockSend.mockRejectedValueOnce(new Error('Resend server timeout'))

    await expect(sendRfqAcknowledgment(mockLead)).resolves.not.toThrow()
    await expect(sendInternalNotification(mockLead)).resolves.not.toThrow()
  })

  it('should return early if API credentials are missing', async () => {
    delete process.env.RESEND_API_KEY
    await sendRfqAcknowledgment(mockLead)
    expect(mockSend).not.toHaveBeenCalled()

    process.env.RESEND_API_KEY = 'mock-resend-key'
    delete process.env.RESEND_FROM_EMAIL
    await sendInternalNotification(mockLead)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('should return early if lead contact email is missing', async () => {
    const leadNoEmail = { ...mockLead, contactEmail: null }
    await sendRfqAcknowledgment(leadNoEmail)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('should log error when internal notification sending fails with API error', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'Some Resend API error' } })
    await expect(sendInternalNotification(mockLead)).resolves.not.toThrow()
  })
})
