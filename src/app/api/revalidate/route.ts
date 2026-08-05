import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/lib/api/sanity/client'
import { getSanityEnv } from '@/lib/config/env'

export const runtime = 'edge'

/**
 * Webhook payload from Sanity.
 */
interface SanityWebhookPayload {
  _id: string
  _type: string
  slug?: {
    current: string
  }
  operation: 'create' | 'update' | 'delete'
}

/**
 * Verify Sanity webhook signature using Web Crypto API (Edge compatible).
 * 
 * @param body - Raw request body
 * @param signature - Signature from 'sanity-webhook-signature' header
 * @param secret - Webhook secret
 * @returns True if signature is valid
 */
async function isValidSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )

    const parts = signature.split('=')
    if (parts.length !== 2 || parts[0] !== 'sha256') return false
    const signatureHash = parts[1]

    // Convert hex string to Uint8Array
    const hexMatch = signatureHash.match(/.{1,2}/g)
    if (!hexMatch) return false
    
    const sigBytes = new Uint8Array(
      hexMatch.map(byte => parseInt(byte, 16)),
    )

    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(body),
    )
  } catch (err) {
    console.error('Error in isValidSignature:', err)
    return false
  }
}

/**
 * POST handler for Sanity webhook revalidation.
 *
 * Validates webhook signature and invalidates cache based on document type.
 *
 * @param request - Next.js request with Sanity webhook payload
 * @returns 200 on success, 401 on invalid signature, 500 on error
 */
export async function POST(request: NextRequest) {
  try {
    const { SANITY_WEBHOOK_SECRET: secret } = getSanityEnv()

    if (!secret && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Webhook secret is not configured' },
        { status: 500 },
      )
    }

    const rawBody = await request.text()

    if (secret) {
      const signature = request.headers.get('sanity-webhook-signature')

      if (!signature) {
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 },
        )
      }

      const isValid = await isValidSignature(rawBody, signature, secret)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 },
        )
      }
    }

    const body: SanityWebhookPayload = JSON.parse(rawBody)
    const { _id, _type } = body

    const tags = getTagsForDocumentType(_type, body)

    if (tags.length === 0) {
      return NextResponse.json(
        { error: 'Unknown document type' },
        { status: 400 },
      )
    }

    tags.forEach((tag) => {
      revalidateTag(tag, 'max')
    })

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      documentId: _id,
      tags,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Revalidation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Get cache tags for a document type and payload.
 *
 * @param type - Document type from Sanity
 * @param payload - Webhook payload with document details
 * @returns Array of cache tags to revalidate
 */
function getTagsForDocumentType(
  type: string,
  payload: SanityWebhookPayload,
): string[] {
  const tags: string[] = [CACHE_TAGS.all]

  switch (type) {
    case 'product':
      tags.push(CACHE_TAGS.product(payload._id))
      tags.push(CACHE_TAGS.product())
      break

    case 'certification':
      tags.push(CACHE_TAGS.certification(payload._id))
      tags.push(CACHE_TAGS.certification())
      break

    case 'portfolioEntry':
      tags.push(CACHE_TAGS.portfolio(payload._id))
      tags.push(CACHE_TAGS.portfolio())
      break

    case 'spokeConfig':
      tags.push(CACHE_TAGS.spokeConfig(payload._id))
      tags.push(CACHE_TAGS.spokeConfig())
      break

    case 'page':
      tags.push(CACHE_TAGS.page(payload._id))
      tags.push(CACHE_TAGS.page())
      break

    default:
      return []
  }

  return tags
}

/**
 * GET handler for health check.
 *
 * @returns 200 OK with webhook status
 */
export async function GET() {
  const isConfigured = !!process.env.SANITY_WEBHOOK_SECRET

  return NextResponse.json({
    status: 'ok',
    webhookConfigured: isConfigured,
  })
}