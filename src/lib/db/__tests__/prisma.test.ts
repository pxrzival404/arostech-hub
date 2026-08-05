import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

describe('Prisma Client Singleton', () => {
  const originalEnv = process.env.NODE_ENV
  const originalPrisma = (globalThis as any).__prisma

  beforeEach(() => {
    jest.resetModules()
    delete (globalThis as any).__prisma
  })

  afterEach(() => {
    ;(process.env as any).NODE_ENV = originalEnv
    ;(globalThis as any).__prisma = originalPrisma
  })

  it('should export a prisma instance and cache it in globalThis.__prisma in development', async () => {
    ;(process.env as any).NODE_ENV = 'development'
    const { prisma } = await import('../prisma')
    expect(prisma).toBeDefined()
    expect((globalThis as any).__prisma).toBe(prisma)
  })

  it('should not cache prisma instance in globalThis.__prisma in production', async () => {
    ;(process.env as any).NODE_ENV = 'production'
    const { prisma } = await import('../prisma')
    expect(prisma).toBeDefined()
    expect((globalThis as any).__prisma).toBeUndefined()
  })

  it('should reuse the existing global instance if present', async () => {
    ;(process.env as any).NODE_ENV = 'development'
    const mockPrisma = {} as any
    ;(globalThis as any).__prisma = mockPrisma

    const { prisma } = await import('../prisma')
    expect(prisma).toBe(mockPrisma)
  })
})
