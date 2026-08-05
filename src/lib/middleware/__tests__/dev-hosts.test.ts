import { describe, it, expect } from '@jest/globals'
import { DEV_HOSTNAMES, getExpectedRoute } from '../dev-hosts'

describe('Dev Hosts Helper', () => {
  it('should export DEV_HOSTNAMES with correct mappings', () => {
    expect(DEV_HOSTNAMES['lvh.me']).toBe('(hub)')
    expect(DEV_HOSTNAMES['www.lvh.me']).toBe('(hub)')
    expect(DEV_HOSTNAMES['dashboard.lvh.me']).toBe('/dashboard')
    expect(DEV_HOSTNAMES['pju.lvh.me']).toBe('(spokes)/pju')
    expect(DEV_HOSTNAMES['solarcell.lvh.me']).toBe('(spokes)/solarpanel')
    expect(DEV_HOSTNAMES['alatpetir.lvh.me']).toBe('(spokes)/penangkalpetir')
    expect(DEV_HOSTNAMES['baterai.lvh.me']).toBe('(spokes)/baterai')
  })

  it('should return correct route group for dev hostnames via getExpectedRoute', () => {
    expect(getExpectedRoute('lvh.me')).toBe('(hub)')
    expect(getExpectedRoute('lvh.me:3000')).toBe('(hub)')
    expect(getExpectedRoute('www.lvh.me:3000')).toBe('(hub)')
    expect(getExpectedRoute('dashboard.lvh.me:3000')).toBe('/dashboard')
    expect(getExpectedRoute('pju.lvh.me:3000')).toBe('(spokes)/pju')
    expect(getExpectedRoute('solarcell.lvh.me')).toBe('(spokes)/solarpanel')
    expect(getExpectedRoute('alatpetir.lvh.me')).toBe('(spokes)/penangkalpetir')
    expect(getExpectedRoute('baterai.lvh.me')).toBe('(spokes)/baterai')
  })

  it('should return null for unknown or non-development hostnames', () => {
    expect(getExpectedRoute('unknown.lvh.me')).toBeNull()
    expect(getExpectedRoute('dayaberkah.id')).toBeNull()
    expect(getExpectedRoute('')).toBeNull()
    expect(getExpectedRoute(null)).toBeNull()
    expect(getExpectedRoute(undefined)).toBeNull()
  })
})
