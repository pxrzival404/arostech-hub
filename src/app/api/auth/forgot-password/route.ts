import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { createRateLimiter } from '@/lib/rate-limiter'
import { sendPasswordResetEmail } from '@/lib/api/notifications/resend'

export const runtime = 'edge'

// Rate limiter: 3 requests per minute per email
const limiter = createRateLimiter({
  interval: 60 * 1000,
  maxRequests: 3,
})

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      )
    }

    const { email } = body
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email tidak valid' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Apply rate limit per email address
    const rateLimitResult = limiter.check(normalizedEmail)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan reset. Silakan coba lagi nanti.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // If user does not exist, return success to prevent email enumeration
    if (!user || !user.isActive) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
      })
    }

    // Clean up any old verification tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    })

    // Generate token and expiry (1 hour)
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Store token in database
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    })

    // Construct reset URL
    const host = request.headers.get('host') || 'dashboard.dayaberkah.id'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const resetUrl = `${protocol}://${host}/konfirmasi-reset?token=${token}`

    // Send reset email
    await sendPasswordResetEmail(normalizedEmail, resetUrl)

    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, instruksi reset kata sandi telah dikirim.',
    })
  } catch (error) {
    console.error('Forgot password API failure:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
