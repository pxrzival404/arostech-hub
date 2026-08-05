import { createTokenHandler } from '@21st-sdk/nextjs/server'
import { validateANSDKEnv } from '@/lib/config/env'
import { auth } from '@/lib/auth/auth.config'
import { getClientIp, createRateLimiter } from '@/lib/rate-limiter'

import { NextResponse } from 'next/server'

export const runtime = 'edge'


const limiter = createRateLimiter({
  interval: 60 * 1000,
  maxRequests: 10,
})

export const getTokenHandler = () => {
  const { API_KEY_21ST } = validateANSDKEnv()
  return createTokenHandler({
    apiKey: API_KEY_21ST,
  })
}

export const POST = async (req: Request) => {
  const ip = getClientIp(req)
  const rateLimitResult = limiter.check(ip)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too Many Requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  const session = await auth()
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  return getTokenHandler()(req)
}

