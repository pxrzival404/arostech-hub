import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-guard'
import { prisma } from '@/lib/db/prisma'
import { clearCache } from '@/lib/middleware/redirect-engine'
import { z } from 'zod'

export const runtime = 'edge'


const redirectSchema = z.object({
  legacyUrl: z.string().min(1, 'Legacy URL is required').max(1024),
  targetUrl: z.string().min(1, 'Target URL is required').max(1024),
  spoke: z.string().max(100).default('hub'),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth('ADMIN')
    
    const redirects = await prisma.redirectMap.findMany({
      orderBy: { hitCount: 'desc' },
    })

    return NextResponse.json({ success: true, redirects })
  } catch (error: any) {
    if (error && (error.digest?.startsWith('NEXT_REDIRECT') || error.message?.includes('Redirect to'))) {
      throw error
    }
    console.error('GET /api/admin/redirects failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch redirect maps' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth('ADMIN')

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const parseResult = redirectSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.format() },
        { status: 400 }
      )
    }

    const { legacyUrl, targetUrl, spoke } = parseResult.data

    const existing = await prisma.redirectMap.findUnique({
      where: { legacyUrl },
    })

    let record
    if (existing) {
      record = await prisma.redirectMap.update({
        where: { legacyUrl },
        data: { targetUrl, spoke },
      })
    } else {
      record = await prisma.redirectMap.create({
        data: { legacyUrl, targetUrl, spoke },
      })
    }

    clearCache()

    return NextResponse.json({ success: true, redirect: record }, { status: existing ? 200 : 201 })
  } catch (error: any) {
    if (error && (error.digest?.startsWith('NEXT_REDIRECT') || error.message?.includes('Redirect to'))) {
      throw error
    }
    console.error('POST /api/admin/redirects failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save redirect map' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth('ADMIN')

    const { searchParams } = request.nextUrl
    let legacyUrl = searchParams.get('legacyUrl')

    if (!legacyUrl) {
      try {
        const body = await request.json()
        legacyUrl = body.legacyUrl
      } catch {
        // Fallback if no body or malformed JSON
      }
    }

    if (!legacyUrl) {
      return NextResponse.json(
        { success: false, error: 'legacyUrl query parameter or body field is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.redirectMap.findUnique({
      where: { legacyUrl },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Redirect map not found' },
        { status: 404 }
      )
    }

    await prisma.redirectMap.delete({
      where: { legacyUrl },
    })

    clearCache()

    return NextResponse.json({ success: true, message: 'Redirect map deleted successfully' })
  } catch (error: any) {
    if (error && (error.digest?.startsWith('NEXT_REDIRECT') || error.message?.includes('Redirect to'))) {
      throw error
    }
    console.error('DELETE /api/admin/redirects failed:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete redirect map' },
      { status: 500 }
    )
  }
}
