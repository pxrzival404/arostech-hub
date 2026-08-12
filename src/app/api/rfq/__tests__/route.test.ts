import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { prisma } from '../../../../lib/db/prisma'
import { NotificationQueue } from '../../../../lib/api/notifications/queue'
import { alertRfqFailure } from '../../../../lib/api/notifications/telegram'
import { buildWhatsAppFallbackUrl } from '../../../../lib/api/notifications/whatsapp'

const mockNextRequest = jest.fn()
const mockNextResponse = { json: jest.fn() }
jest.mock('next/server', () => ({
  NextRequest: mockNextRequest,
  NextResponse: mockNextResponse,
}))

// Mock Prisma client singleton
jest.mock('../../../../lib/db/prisma', () => ({
  prisma: {
    lead: {
      create: jest.fn(),
    },
  },
}))

// Mock Notification Queue
jest.mock('../../../../lib/api/notifications/queue', () => ({
  NotificationQueue: {
    enqueue: jest.fn(),
  },
  NotificationType: {
    EMAIL_ACK: 'EMAIL_ACK',
    EMAIL_INTERNAL: 'EMAIL_INTERNAL',
    TELEGRAM: 'TELEGRAM',
  },
}))

// Mock Notification services
jest.mock('../../../../lib/api/notifications/telegram', () => ({
  alertRfqFailure: jest.fn(),
}))

jest.mock('../../../../lib/api/notifications/whatsapp', () => ({
  buildWhatsAppFallbackUrl: jest.fn(),
}))

const mockLeadCreate = prisma.lead.create as any
const mockEnqueue = NotificationQueue.enqueue as any
const mockAlertFail = alertRfqFailure as any
const mockBuildWaUrl = buildWhatsAppFallbackUrl as any

function createMockRequest(payload: any, shouldFail = false): NextRequest {
  return {
    text: jest.fn(() => shouldFail ? Promise.reject(new Error('JSON parse error')) : Promise.resolve(JSON.stringify(payload))) as any,
    json: jest.fn(() => shouldFail ? Promise.reject(new Error('JSON parse error')) : Promise.resolve(payload)) as any,
  } as unknown as NextRequest
}

describe('GET /api/rfq', () => {
  let GET: () => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    jest.isolateModules(() => {
      const route = require('../route')
      GET = route.GET as () => Promise<unknown>
    })
  })

  it('should return health check status', async () => {
    await GET()
    expect(mockNextResponse.json).toHaveBeenCalledWith({
      status: 'ok',
      api: 'rfq-ingestion',
      version: '1.0.0',
    })
  })
})

describe('POST /api/rfq', () => {
  let POST: (request: NextRequest) => Promise<unknown>

  beforeEach(async () => {
    jest.clearAllMocks()
    
    // Default success mocks
    mockLeadCreate.mockResolvedValue({
      id: 'lead-db-123',
      submissionStatus: 'RECEIVED',
      dashboardAccessStatus: 'NOT_ELIGIBLE',
      createdAt: new Date(),
    })
    mockEnqueue.mockResolvedValue(undefined)
    mockAlertFail.mockResolvedValue(undefined)
    mockBuildWaUrl.mockReturnValue('https://wa.me/6281234567890?text=fallback-text')

    jest.isolateModules(() => {
      const route = require('../route')
      POST = route.POST as (request: NextRequest) => Promise<unknown>
    })
  })

  it('should return 400 when request body contains malformed JSON', async () => {
    const mockRequest = createMockRequest({}, true)

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: {
          code: 'invalid_json',
          message: 'Malformed JSON payload',
        },
      },
      { status: 400 }
    )
  })

  it('should return 400 when segment is missing or invalid', async () => {
    const payload = { contact_name: 'Test Buyer' }
    const mockRequest = createMockRequest(payload)

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: {
          code: 'invalid_segment',
          message: 'Segment must be B2B or B2G',
        },
      },
      { status: 400 }
    )
  })

  it('should accept valid B2B payload, save to DB, trigger notifications, and return 201 Created', async () => {
    const validB2BPayload = {
      segment: 'B2B',
      source_domain: 'solarcell.dayaberkah.id',
      source_page_path: '/products',
      contact_name: 'Test Buyer',
      contact_email: 'buyer@example.com',
      contact_phone: '+6281234567890',
      company_name: 'PT Solar Power',
      items: [
        {
          product_id: 'sanity-id-1',
          product_name: 'Solar Module 100W',
          quantity: 25,
          variant: 'Mono',
          item_notes: 'Needs mounting brackets',
        },
      ],
      project_scope: 'Building rooftop solar installation',
      timeline: '2026-12-31',
    }

    const mockRequest = createMockRequest(validB2BPayload)

    await POST(mockRequest)

    expect(mockLeadCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        segment: 'B2B',
        sourceDomain: 'solarcell.dayaberkah.id',
        contactEmail: 'buyer@example.com',
        productCategory: 'Solar Module 100W',
        quantity: 25,
      }),
    })

    expect(mockEnqueue).toHaveBeenCalledWith('EMAIL_ACK', 'lead-db-123', null)
    expect(mockEnqueue).toHaveBeenCalledWith('EMAIL_INTERNAL', 'lead-db-123', null)
    expect(mockEnqueue).toHaveBeenCalledWith('TELEGRAM', 'lead-db-123', null)

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'lead-db-123',
          submission_status: 'received',
          dashboard_access_status: 'not_eligible',
        }),
      }),
      expect.objectContaining({
        status: 201,
      })
    )
  })

  it('should accept valid B2G payload and return 201 Created', async () => {
    const validB2GPayload = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      source_page_path: '/pju',
      contact_name: 'Gov Officer',
      contact_email: 'officer@gov.id',
      contact_phone: '+6281234567890',
      company_name: 'Dinas Perhubungan',
      items: [
        {
          product_id: 'sanity-pju-1',
          product_name: 'PJU Street Light',
          quantity: 100,
        },
      ],
      procurement_type: 'Tender Langsung',
      dipa_reference: 'DIPA-2026-1122',
    }

    const mockRequest = createMockRequest(validB2GPayload)

    await POST(mockRequest)

    expect(mockLeadCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        segment: 'B2G',
        procurementType: 'Tender Langsung',
      }),
    })

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: 'lead-db-123',
          submission_status: 'received',
          dashboard_access_status: 'not_eligible',
        }),
      }),
      expect.objectContaining({
        status: 201,
      })
    )
  })

  it('should return 422 validation_error when fields are malformed or missing', async () => {
    const invalidPayload = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'Gov Officer',
      contact_email: 'invalid-email-format',
      contact_phone: '08123456789', // Invalid phone format (+62)
      company_name: '',
      items: [], // At least 1 item is required
    }

    const mockRequest = createMockRequest(invalidPayload)

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'validation_error',
          message: 'Request validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'contact_email',
              code: 'invalid_format',
            }),
            expect.objectContaining({
              field: 'contact_phone',
              code: 'invalid_format',
            }),
            expect.objectContaining({
              field: 'items',
              code: 'too_small',
            }),
            expect.objectContaining({
              field: 'procurement_type',
              code: 'invalid_value',
            }),
          ]),
        }),
      }),
      { status: 422 }
    )
  })

  it('should still return 201 if notifications fail', async () => {
    const payload = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Buyer Name',
      contact_email: 'buyer@example.com',
      items: [{ product_id: '1', product_name: 'Product 1', quantity: 1 }],
    }
    const mockRequest = createMockRequest(payload)

    mockEnqueue.mockRejectedValueOnce(new Error('Email failed'))

    await POST(mockRequest)

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: 'lead-db-123' }),
      }),
      expect.objectContaining({ status: 201 })
    )
  })

  it('should return 503 with fallback url and alert Telegram when database write fails', async () => {
    const payload = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Buyer Name',
      contact_email: 'buyer@example.com',
      items: [{ product_id: '1', product_name: 'Product 1', quantity: 1 }],
    }
    const mockRequest = createMockRequest(payload)

    mockLeadCreate.mockRejectedValueOnce(new Error('Prisma database unavailable'))

    await POST(mockRequest)

    expect(mockBuildWaUrl).toHaveBeenCalledWith(expect.objectContaining({
      contact_name: 'Buyer Name',
    }))
    expect(mockAlertFail).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ contact_name: 'Buyer Name' })
    )

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        error: {
          code: 'infrastructure_error',
          fallback_url: 'https://wa.me/6281234567890?text=fallback-text',
        },
      },
      { status: 503 }
    )
  })
})
