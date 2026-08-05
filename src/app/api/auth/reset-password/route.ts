import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    let body: { token?: string; newPassword?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload' },
        { status: 400 }
      )
    }

    const { token, newPassword } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Kata sandi minimal harus 8 karakter' },
        { status: 400 }
      )
    }

    // Lookup token
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid atau telah kedaluwarsa' },
        { status: 400 }
      )
    }

    const email = tokenRecord.identifier

    // Hash the new password
    const saltRounds = process.env.NODE_ENV === 'test' ? 4 : 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    })

    // Clean up verification token
    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json({
      success: true,
      message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru.',
    })
  } catch (error) {
    console.error('Reset password API failure:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
