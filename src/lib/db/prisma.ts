import { PrismaClient } from '@prisma/client'
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined
}

function getPrismaInstance(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString || connectionString.includes('user:password@host') || connectionString.includes('host/database')) {
    throw new Error('DATABASE_URL environment variable is missing or unconfigured. Please configure a valid PostgreSQL connection string.')
  }
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient = globalForPrisma.__prisma ?? new Proxy({} as unknown as PrismaClient, {
  get(_target: Record<string, unknown> & { _instance?: PrismaClient }, prop: string | symbol) {
    if (!_target._instance) {
      _target._instance = getPrismaInstance()
    }
    const instance = _target._instance
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma
}
