import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl || dbUrl.includes('user:password@host') || dbUrl.includes('host/database')) {
      return NextResponse.json({ success: true, targetUrl: null })
    }

    const { searchParams } = request.nextUrl
    const pathname = searchParams.get('pathname')
    const spoke = searchParams.get('spoke') || null

    if (!pathname) {
      return NextResponse.json({ success: false, error: 'pathname is required' }, { status: 400 })
    }

    const normalizedPath = pathname === '/' ? '/' : (pathname.endsWith('/') ? pathname.slice(0, -1) : pathname)
    const legacyUrl = spoke ? `/${spoke}${normalizedPath}` : normalizedPath

    const host = spoke ? `${spoke}.dayaberkah.id` : 'dayaberkah.id'
    const variations = [
      legacyUrl,
      `http://${host}${normalizedPath}`,
      `https://${host}${normalizedPath}`,
    ]

    const { prisma } = await import('@/lib/db/prisma')

    const record = await prisma.redirectMap.findFirst({
      where: {
        OR: variations.map((url) => ({ legacyUrl: url })),
      },
    })

    if (record) {
      // Increment hitCount asynchronously without blocking response
      prisma.redirectMap.update({
        where: { legacyUrl: record.legacyUrl },
        data: { hitCount: { increment: 1 } },
      }).catch((err) => {
        console.error('Failed to increment hitCount in lookup route:', err)
      })

      return NextResponse.json({ success: true, targetUrl: record.targetUrl })
    }

    return NextResponse.json({ success: true, targetUrl: null })
  } catch (error) {
    console.error('GET /api/redirects/lookup failed (returning null fallback):', error)
    return NextResponse.json({ success: true, targetUrl: null })
  }
}
