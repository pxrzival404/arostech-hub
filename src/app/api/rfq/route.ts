import { NextRequest, NextResponse } from 'next/server'
import { rfqB2BSchema, rfqB2GSchema } from '@/lib/schema/rfq-schemas'
import { prisma } from '@/lib/db/prisma'
import { Segment, NotificationType } from '@prisma/client'
import { NotificationQueue } from '../../../lib/api/notifications/queue'
import { alertRfqFailure } from '@/lib/api/notifications/telegram'
import { buildWhatsAppFallbackUrl } from '@/lib/api/notifications/whatsapp'
import { getClientIp, createRateLimiter } from '@/lib/rate-limiter'

const limiter = createRateLimiter({
  interval: 60 * 1000,
  maxRequests: 5,
})

export const runtime = 'edge'


/**
 * POST /api/rfq
 *
 * Handles RFQ form submissions for B2B and B2G segments.
 * Validates request payload against Zod schemas, returning structured
 * errors for validation failures or a 201 response envelope on success.
 * Persists lead to Postgres, triggers notifications, and offers WhatsApp fallback on failure.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateLimitResult = limiter.check(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: {
          code: 'rate_limited',
          message: 'Too many RFQ submissions. Please try again in a minute.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  let body: any
  try {
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_json',
            message: 'Malformed JSON payload',
          },
        },
        { status: 400 }
      )
    }

    const { segment } = body || {}

    if (segment !== 'B2B' && segment !== 'B2G') {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_segment',
            message: 'Segment must be B2B or B2G',
          },
        },
        { status: 400 }
      )
    }

    const schema = segment === 'B2B' ? rfqB2BSchema : rfqB2GSchema
    const parseResult = schema.safeParse(body)

    if (!parseResult.success) {
      const details = parseResult.error.issues.map((issue) => {
        let code: string = issue.code
        // Map common Zod codes to business-friendly codes
        const issueAny = issue as any
        if (issueAny.code === 'invalid_type' && issueAny.received === 'undefined') {
          code = 'required_field'
        } else if (issueAny.code === 'invalid_string' && issueAny.validation === 'email') {
          code = 'invalid_format'
        }
        return {
          field: issue.path.join('.'),
          message: issue.message,
          code,
        }
      })

      return NextResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Request validation failed',
            details,
          },
        },
        { status: 422 }
      )
    }

    const validatedData = parseResult.data

    // Map Zod-validated fields to Prisma Lead model fields
    const productCategory = validatedData.items.map(item => item.product_name).join(', ').substring(0, 255)
    const quantity = validatedData.items.reduce((sum, item) => sum + item.quantity, 0)

    const lead = await prisma.lead.create({
      data: {
        segment: validatedData.segment as Segment,
        sourceDomain: validatedData.source_domain,
        sourcePagePath: validatedData.source_page_path || '',
        sourceCampaignTag: validatedData.source_campaign_tag || null,
        utmSource: validatedData.utm_source || null,
        utmMedium: validatedData.utm_medium || null,
        utmCampaign: validatedData.utm_campaign || null,
        contactName: validatedData.contact_name,
        contactEmail: validatedData.contact_email,
        contactPhone: validatedData.contact_phone || null,
        companyName: validatedData.company_name || null,
        productCategory,
        quantity,
        projectScope: validatedData.project_scope || null,
        timeline: validatedData.timeline || null,
        procurementType: (validatedData as any).procurement_type || null,
        notes: validatedData.notes || null,
      },
    })

    // Enqueue notifications to database-backed queue for resilient processing
    void Promise.allSettled([
      NotificationQueue.enqueue(NotificationType.EMAIL_ACK, lead.id, null),
      NotificationQueue.enqueue(NotificationType.EMAIL_INTERNAL, lead.id, null),
      NotificationQueue.enqueue(NotificationType.TELEGRAM, lead.id, null),
    ]).catch(err => {
      console.error('Failed to enqueue notifications:', err)
    })

    return NextResponse.json(
      {
        data: {
          id: lead.id,
          submission_status: lead.submissionStatus.toLowerCase(),
          dashboard_access_status: lead.dashboardAccessStatus.toLowerCase(),
          created_at: lead.createdAt.toISOString(),
        },
      },
      {
        status: 201,
        headers: {
          Location: `/api/rfq/${lead.id}`,
        },
      }
    )
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error('RFQ Submission Infrastructure Failure:', errorObj)

    // Build WhatsApp fallback URL from raw body or validated data
    let whatsAppUrl = ''
    try {
      whatsAppUrl = buildWhatsAppFallbackUrl(body)
    } catch (waErr) {
      console.error('Failed to build WhatsApp fallback URL:', waErr)
    }

    // Fire Telegram failure alert (non-blocking)
    void alertRfqFailure(errorObj, body).catch(tgErr => {
      console.error('Failed to trigger Telegram failure alert:', tgErr)
    })

    return NextResponse.json(
      {
        error: {
          code: 'infrastructure_error',
          fallback_url: whatsAppUrl,
        },
      },
      { status: 503 }
    )
  }
}

/**
 * GET /api/rfq
 *
 * Health-check endpoint for the RFQ ingestion route.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    api: 'rfq-ingestion',
    version: '1.0.0',
  })
}
