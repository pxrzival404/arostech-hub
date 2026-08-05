import { z } from 'zod'

/**
 * Environment variable validation schema.
 * Ensures all required Sanity CMS configuration is present and valid.
 *
 * @throws {Error} If any required environment variable is missing or invalid
 */
export const sanityEnvSchema = z.object({
  SANITY_PROJECT_ID: z
    .string()
    .min(1, 'Sanity project ID is required')
    .regex(/^[a-z0-9]+$/, 'Project ID must be lowercase alphanumeric'),
  SANITY_DATASET: z
    .string()
    .min(1, 'Sanity dataset is required')
    .regex(
      /^[a-z0-9_-]+$/,
      'Dataset name must be lowercase alphanumeric, hyphens, or underscores',
    ),
  SANITY_API_VERSION: z
    .string()
    .min(1, 'Sanity API version is required')
    .regex(
      /^v\d{4}-\d{2}-\d{2}$/,
      'API version must be in format vYYYY-MM-DD',
    ),
  SANITY_API_READ_TOKEN: z
    .string()
    .min(1, 'Sanity API read token is required')
    .startsWith('sk', 'Read token must start with "sk"'),
  SANITY_API_WRITE_TOKEN: z
    .string()
    .startsWith('sk', 'Write token must start with "sk"')
    .optional(),
  SANITY_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Webhook secret is required in production')
    .optional(),
})

export type SanityEnv = z.infer<typeof sanityEnvSchema>

/**
 * Validate all Sanity environment variables.
 *
 * @returns Validated environment configuration
 * @throws {Error} If validation fails
 */
export function validateSanityEnv(): SanityEnv {
  const isTest = process.env.NODE_ENV === 'test'
  const raw = {
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID || (isTest ? undefined : '3h4k8dye'),
    SANITY_DATASET: process.env.SANITY_DATASET || (isTest ? undefined : 'production'),
    SANITY_API_VERSION: process.env.SANITY_API_VERSION || 'v2025-05-21',
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN || (isTest ? undefined : 'skDummyTokenForBuildAndBrowser'),
    SANITY_API_WRITE_TOKEN: process.env.SANITY_API_WRITE_TOKEN,
    SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
  }

  const result = sanityEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Sanity environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated Sanity environment configuration.
 * Caches the result after first call.
 */
let cachedEnv: SanityEnv | null = null

export function getSanityEnv(): SanityEnv {
  if (cachedEnv) {
    return cachedEnv
  }

  cachedEnv = validateSanityEnv()
  return cachedEnv
}

/**
 * Middleware environment variable validation schema.
 */
export const middlewareEnvSchema = z.object({
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1, 'Root domain is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be a valid URL'),
})

export type MiddlewareEnv = z.infer<typeof middlewareEnvSchema>

/**
 * Validate all middleware environment variables with dynamic environment defaults.
 *
 * @returns Validated environment configuration
 * @throws {Error} If validation fails
 */
export function validateMiddlewareEnv(): MiddlewareEnv {
  const isProd = process.env.NODE_ENV === 'production'
  const defaultDomain = isProd ? 'dayaberkah.id' : 'lvh.me'
  const defaultUrl = isProd ? 'https://dayaberkah.id' : 'http://lvh.me:3000'

  const raw = {
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN || defaultDomain,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || defaultUrl,
  }

  const result = middlewareEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Middleware environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated middleware environment configuration.
 * Caches the result after first call.
 */
let cachedMiddlewareEnv: MiddlewareEnv | null = null

export function getMiddlewareEnv(): MiddlewareEnv {
  if (cachedMiddlewareEnv) {
    return cachedMiddlewareEnv
  }

  cachedMiddlewareEnv = validateMiddlewareEnv()
  return cachedMiddlewareEnv
}

/**
 * Database environment variable validation schema.
 */
export const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'Database URL is required')
    .startsWith('postgresql://', 'Database URL must start with "postgresql://"'),
})

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>

/**
 * Validate database environment variables.
 *
 * @returns Validated database environment configuration
 * @throws {Error} If validation fails
 */
export function validateDatabaseEnv(): DatabaseEnv {
  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
  }

  const result = databaseEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Database environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated database environment configuration.
 * Caches the result after first call.
 */
let cachedDatabaseEnv: DatabaseEnv | null = null

export function getDatabaseEnv(): DatabaseEnv {
  if (cachedDatabaseEnv) {
    return cachedDatabaseEnv
  }

  cachedDatabaseEnv = validateDatabaseEnv()
  return cachedDatabaseEnv
}

/**
 * Auth.js environment variable validation schema.
 */
export const authEnvSchema = z.object({
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters long'),
  NEXTAUTH_URL: z.string().url('NextAuth URL must be a valid URL'),
})

export type AuthEnv = z.infer<typeof authEnvSchema>

/**
 * Validate Auth.js environment variables.
 *
 * @returns Validated auth environment configuration
 * @throws {Error} If validation fails
 */
export function validateAuthEnv(): AuthEnv {
  const raw = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  }

  const result = authEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Auth environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated Auth.js environment configuration.
 * Caches the result after first call.
 */
let cachedAuthEnv: AuthEnv | null = null

export function getAuthEnv(): AuthEnv {
  if (cachedAuthEnv) {
    return cachedAuthEnv
  }

  cachedAuthEnv = validateAuthEnv()
  return cachedAuthEnv
}

/**
 * Notification environment variable validation schema.
 */
export const notificationEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  RESEND_FROM_EMAIL: z.string().email('Resend from email must be a valid email'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'Telegram bot token is required'),
  TELEGRAM_CHAT_ID: z.string().min(1, 'Telegram chat ID is required'),
  WHATSAPP_SALES_NUMBER: z.string().min(1, 'WhatsApp sales number is required'),
})

export type NotificationEnv = z.infer<typeof notificationEnvSchema>

/**
 * 21st SDK environment variable validation schema.
 */
export const anSDKEnvSchema = z.object({
  API_KEY_21ST: z.string().min(1, '21st API key is required').startsWith('21st_', '21st API key must start with "21st_"'),
})

export type ANSDKEnv = z.infer<typeof anSDKEnvSchema>

/**
 * Validate 21st SDK environment variables.
 *
 * @returns Validated 21st SDK environment configuration
 * @throws {Error} If validation fails
 */
export function validateANSDKEnv(): ANSDKEnv {
  const raw = {
    API_KEY_21ST: process.env.API_KEY_21ST,
  }

  const result = anSDKEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`21st SDK environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated 21st SDK environment configuration.
 * Caches the result after first call.
 */
let cachedANSDKEnv: ANSDKEnv | null = null

export function getANSDKEnv(): ANSDKEnv {
  if (cachedANSDKEnv) {
    return cachedANSDKEnv
  }

  cachedANSDKEnv = validateANSDKEnv()
  return cachedANSDKEnv
}

/**
 * Validate notification environment variables.
 *
 * @returns Validated notification environment configuration
 * @throws {Error} If validation fails
 */
export function validateNotificationEnv(): NotificationEnv {
  const raw = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    WHATSAPP_SALES_NUMBER: process.env.WHATSAPP_SALES_NUMBER,
  }

  const result = notificationEnvSchema.safeParse(raw)

  if (!result.success) {
    const errors = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ')
    throw new Error(`Notification environment validation failed: ${errors}`)
  }

  return result.data
}

/**
 * Get validated notification environment configuration.
 * Caches the result after first call.
 */
let cachedNotificationEnv: NotificationEnv | null = null

export function getNotificationEnv(): NotificationEnv {
  if (cachedNotificationEnv) {
    return cachedNotificationEnv
  }

  cachedNotificationEnv = validateNotificationEnv()
  return cachedNotificationEnv
}