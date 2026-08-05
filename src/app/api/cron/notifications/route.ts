import { NextResponse } from 'next/server'
import { NotificationQueue } from '../../../../lib/api/notifications/queue'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'


export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is missing')
    return NextResponse.json(
      { success: false, error: 'Cron authorization is not configured' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  const customHeader = request.headers.get('x-cron-secret')
  const isAuthorized = authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret

  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    await NotificationQueue.processAllPending()
    return NextResponse.json({
      success: true,
      message: 'Notification queue processed successfully',
    })
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    console.error('Notification queue processing failed:', errorObj)
    return NextResponse.json(
      {
        success: false,
        error: errorObj.message,
      },
      { status: 500 }
    )
  }
}
