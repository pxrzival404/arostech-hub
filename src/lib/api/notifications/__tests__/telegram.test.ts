import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { alertNewRfq, alertRfqFailure } from '../telegram'
import { Lead, Segment, SubmissionStatus, DashboardAccessStatus } from '@prisma/client'

describe('Telegram Alerts Service', () => {
  const originalEnv = process.env
  let mockFetch: any

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.TELEGRAM_BOT_TOKEN = 'mock-bot-token'
    process.env.TELEGRAM_CHAT_ID = 'mock-chat-id'

    mockFetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })) as any
    global.fetch = mockFetch as any
    globalThis.fetch = mockFetch as any
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
    contactName: 'Jane Doe',
    contactEmail: 'jane@example.com',
    contactPhone: '+6281234567890',
    companyName: 'PT Solar Cell',
    productCategory: 'Solar Module 100W, Solar Inverter 3kW',
    quantity: 12,
    projectScope: 'Rooftop solar installation',
    timeline: '2026-11-30',
    procurementType: null,
    notes: 'Urgent request',
    submissionStatus: 'RECEIVED' as SubmissionStatus,
    fallbackTriggered: false,
    fallbackWaUrl: null,
    trackingProjectId: null,
    dashboardAccessGrantedAt: null,
    dashboardAccessStatus: 'NOT_ELIGIBLE' as DashboardAccessStatus,
  }

  it('should call Telegram API with correct endpoint and payload for new RFQ', async () => {
    await alertNewRfq(mockLead)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.telegram.org/botmock-bot-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      })
    )

    const requestBody = JSON.parse((mockFetch.mock.calls[0] as any)[1].body)
    expect(requestBody.chat_id).toBe('mock-chat-id')
    expect(requestBody.parse_mode).toBe('HTML')
    expect(requestBody.text).toContain('NEW RFQ RECEIVED')
    expect(requestBody.text).toContain('Lead ID: <code>lead-123</code>')
    expect(requestBody.text).toContain('Segment: B2B')
    expect(requestBody.text).toContain('Name: Jane Doe')
    expect(requestBody.text).toContain('Email: jane@example.com')
  })

  it('should call Telegram API for failure alerts', async () => {
    const error = new Error('Database connection failed')
    const payload = { contact_name: 'Failing Submitter', segment: 'B2G' }

    await alertRfqFailure(error, payload)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const requestBody = JSON.parse((mockFetch.mock.calls[0] as any)[1].body)
    expect(requestBody.chat_id).toBe('mock-chat-id')
    expect(requestBody.text).toContain('RFQ SUBMISSION FAILURE')
    expect(requestBody.text).toContain('Error: Database connection failed')
    expect(requestBody.text).toContain('Failing Submitter')
  })

  it('should handle fetch rejection/errors gracefully and not throw', async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network disconnected')))

    await expect(alertNewRfq(mockLead)).resolves.not.toThrow()
    await expect(alertRfqFailure(new Error('Test error'), {})).resolves.not.toThrow()
  })

  it('should handle non-ok HTTP responses from Telegram without throwing', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: () => Promise.resolve({ error_code: 400, description: 'Chat not found' }),
    }))

    await expect(alertNewRfq(mockLead)).resolves.not.toThrow()
  })

  it('should return early if Telegram bot credentials are missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN
    await alertNewRfq(mockLead)
    expect(mockFetch).not.toHaveBeenCalled()

    process.env.TELEGRAM_BOT_TOKEN = 'mock-bot-token'
    delete process.env.TELEGRAM_CHAT_ID
    await alertRfqFailure(new Error('error'), {})
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle non-ok response for failure alerts without throwing', async () => {
    mockFetch.mockImplementationOnce(() => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    }))
    await expect(alertRfqFailure(new Error('Db error'), {})).resolves.not.toThrow()
  })
})
