import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Middleware Env Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should validate and return default values for development environment', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'development'
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { getMiddlewareEnv, validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('lvh.me')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('http://lvh.me:3000')

    const cached = getMiddlewareEnv()
    expect(cached).toEqual(config)
  })

  it('should validate and return default values for production environment', async () => {
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_ROOT_DOMAIN
    delete process.env.NEXT_PUBLIC_SITE_URL

    const { validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('dayaberkah.id')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('https://dayaberkah.id')
  })

  it('should use environment variables when they are defined', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'customdomain.com'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://customdomain.com'

    const { validateMiddlewareEnv } = await import('../env')

    const config = validateMiddlewareEnv()
    expect(config.NEXT_PUBLIC_ROOT_DOMAIN).toBe('customdomain.com')
    expect(config.NEXT_PUBLIC_SITE_URL).toBe('https://customdomain.com')
  })

  it('should fail validation when site URL is invalid', async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'customdomain.com'
    process.env.NEXT_PUBLIC_SITE_URL = 'not-a-valid-url'

    const { validateMiddlewareEnv } = await import('../env')

    expect(() => validateMiddlewareEnv()).toThrow(/Site URL must be a valid URL/)
  })

  describe('Sanity Env Config', () => {
    beforeEach(() => {
      process.env.SANITY_PROJECT_ID = 'abcdef12'
      process.env.SANITY_DATASET = 'production'
      process.env.SANITY_API_VERSION = 'v2026-05-21'
      process.env.SANITY_API_READ_TOKEN = 'skreadsuff'
      process.env.SANITY_API_WRITE_TOKEN = 'skwritesuff'
      process.env.SANITY_WEBHOOK_SECRET = 'whsecret'
    })

    it('should validate and return sanity env successfully', async () => {
      const { validateSanityEnv, getSanityEnv } = await import('../env')
      const env = validateSanityEnv()
      expect(env.SANITY_PROJECT_ID).toBe('abcdef12')
      expect(env.SANITY_DATASET).toBe('production')
      expect(env.SANITY_WEBHOOK_SECRET).toBe('whsecret')

      const cached = getSanityEnv()
      expect(cached).toEqual(env)
    })

    it('should throw error when a required variable is missing', async () => {
      delete process.env.SANITY_PROJECT_ID
      const { validateSanityEnv } = await import('../env')
      expect(() => validateSanityEnv()).toThrow(/Sanity environment validation failed/)
    })

    it('should throw error when token is invalid', async () => {
      process.env.SANITY_API_READ_TOKEN = 'invalid-token'
      const { validateSanityEnv } = await import('../env')
      expect(() => validateSanityEnv()).toThrow(/Read token must start with "sk"/)
    })
  })

  describe('Database Env Config', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://user:pass@host/db?sslmode=require'
    })

    it('should validate and return database env successfully', async () => {
      const { validateDatabaseEnv, getDatabaseEnv } = await import('../env')
      const env = validateDatabaseEnv()
      expect(env.DATABASE_URL).toBe('postgresql://user:pass@host/db?sslmode=require')

      const cached = getDatabaseEnv()
      expect(cached).toEqual(env)
    })

    it('should throw error when DATABASE_URL is missing', async () => {
      delete process.env.DATABASE_URL
      const { validateDatabaseEnv } = await import('../env')
      expect(() => validateDatabaseEnv()).toThrow(/Database environment validation failed/)
    })

    it('should throw error when DATABASE_URL does not start with postgresql://', async () => {
      process.env.DATABASE_URL = 'mysql://user:pass@host/db'
      const { validateDatabaseEnv } = await import('../env')
      expect(() => validateDatabaseEnv()).toThrow(/Database URL must start with "postgresql:\/\/"/)
    })
  })

  describe('Auth Env Config', () => {
    beforeEach(() => {
      process.env.NEXTAUTH_SECRET = 'super-secret-key-must-be-at-least-32-characters-long'
      process.env.NEXTAUTH_URL = 'http://localhost:3000'
    })

    it('should validate and return auth env successfully', async () => {
      const { validateAuthEnv, getAuthEnv } = await import('../env')
      const env = validateAuthEnv()
      expect(env.NEXTAUTH_SECRET).toBe('super-secret-key-must-be-at-least-32-characters-long')
      expect(env.NEXTAUTH_URL).toBe('http://localhost:3000')

      const cached = getAuthEnv()
      expect(cached).toEqual(env)
    })

    it('should throw error when NEXTAUTH_SECRET is missing', async () => {
      delete process.env.NEXTAUTH_SECRET
      const { validateAuthEnv } = await import('../env')
      expect(() => validateAuthEnv()).toThrow(/Auth environment validation failed/)
    })

    it('should throw error when NEXTAUTH_SECRET is too short', async () => {
      process.env.NEXTAUTH_SECRET = 'short-secret'
      const { validateAuthEnv } = await import('../env')
      expect(() => validateAuthEnv()).toThrow(/NextAuth secret must be at least 32 characters long/)
    })

    it('should throw error when NEXTAUTH_URL is invalid', async () => {
      process.env.NEXTAUTH_URL = 'not-a-valid-url'
      const { validateAuthEnv } = await import('../env')
      expect(() => validateAuthEnv()).toThrow(/NextAuth URL must be a valid URL/)
    })
  })

  describe('Notification Env Config', () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = 're_key123'
      process.env.RESEND_FROM_EMAIL = 'sales@dayaberkah.id'
      process.env.TELEGRAM_BOT_TOKEN = 'bot123'
      process.env.TELEGRAM_CHAT_ID = 'chat456'
      process.env.WHATSAPP_SALES_NUMBER = '62812345678'
    })

    it('should validate and return notification env successfully', async () => {
      const { validateNotificationEnv, getNotificationEnv } = await import('../env')
      const env = validateNotificationEnv()
      expect(env.RESEND_API_KEY).toBe('re_key123')
      expect(env.RESEND_FROM_EMAIL).toBe('sales@dayaberkah.id')
      expect(env.TELEGRAM_BOT_TOKEN).toBe('bot123')
      expect(env.TELEGRAM_CHAT_ID).toBe('chat456')
      expect(env.WHATSAPP_SALES_NUMBER).toBe('62812345678')

      const cached = getNotificationEnv()
      expect(cached).toEqual(env)
    })

    it('should throw error when a required variable is missing', async () => {
      delete process.env.RESEND_API_KEY
      const { validateNotificationEnv } = await import('../env')
      expect(() => validateNotificationEnv()).toThrow(/Notification environment validation failed/)
    })

    it('should throw error when email format is invalid', async () => {
      process.env.RESEND_FROM_EMAIL = 'invalid-email-address'
      const { validateNotificationEnv } = await import('../env')
      expect(() => validateNotificationEnv()).toThrow(/Resend from email must be a valid email/)
    })
  })
})

