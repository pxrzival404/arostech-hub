import { buildSpokeUrl } from '../../../lib/utils/url'
import { getWindowLocation } from '../../../lib/utils/location'

jest.mock('../../../lib/utils/location', () => ({
  getWindowLocation: jest.fn(),
}))

describe('buildSpokeUrl', () => {
  const mockGetWindowLocation = getWindowLocation as jest.Mock

  beforeEach(() => {
    mockGetWindowLocation.mockReset()
  })

  it('returns local relative path on server-side rendering (SSR)', () => {
    mockGetWindowLocation.mockReturnValue(null)
    const url = buildSpokeUrl('pju', '/products')
    expect(url).toBe('/pju/products')
  })

  it('builds correct url on localhost/lvh.me with custom port', () => {
    mockGetWindowLocation.mockReturnValue({
      hostname: 'lvh.me',
      port: '3000',
      protocol: 'http:',
    })

    const url = buildSpokeUrl('pju', '/products')
    expect(url).toBe('http://pju.lvh.me:3000/products')

    // Navigate to another spoke and try to build URL
    mockGetWindowLocation.mockReturnValue({
      hostname: 'solarcell.lvh.me',
      port: '3000',
      protocol: 'http:',
    })
    const urlFromSpoke = buildSpokeUrl('baterai', '/products')
    expect(urlFromSpoke).toBe('http://baterai.lvh.me:3000/products')
  })

  it('builds correct url on cloudflare pages deployment without port', () => {
    mockGetWindowLocation.mockReturnValue({
      hostname: 'dayaberkah.pages.dev',
      port: '',
      protocol: 'https:',
    })

    const url = buildSpokeUrl('pju', '/products')
    expect(url).toBe('https://pju.dayaberkah.pages.dev/products')

    mockGetWindowLocation.mockReturnValue({
      hostname: 'pju.dayaberkah.pages.dev',
      port: '',
      protocol: 'https:',
    })
    const urlFromSpoke = buildSpokeUrl('solarcell', '/products')
    expect(urlFromSpoke).toBe('https://solarcell.dayaberkah.pages.dev/products')
  })

  it('builds correct url on cloudflare pages branch preview preserving branch in root', () => {
    mockGetWindowLocation.mockReturnValue({
      hostname: 'feature-xyz.dayaberkah.pages.dev',
      port: '',
      protocol: 'https:',
    })

    const url = buildSpokeUrl('pju', '/products')
    expect(url).toBe('https://pju.feature-xyz.dayaberkah.pages.dev/products')

    mockGetWindowLocation.mockReturnValue({
      hostname: 'pju.staging.dayaberkah.pages.dev',
      port: '',
      protocol: 'https:',
    })
    const urlFromSpoke = buildSpokeUrl('solarcell', '/products')
    expect(urlFromSpoke).toBe('https://solarcell.staging.dayaberkah.pages.dev/products')
  })

  it('builds correct url on production domain without port', () => {
    mockGetWindowLocation.mockReturnValue({
      hostname: 'dayaberkah.id',
      port: '',
      protocol: 'https:',
    })

    const url = buildSpokeUrl('pju', '/products')
    expect(url).toBe('https://pju.dayaberkah.id/products')

    mockGetWindowLocation.mockReturnValue({
      hostname: 'pju.dayaberkah.id',
      port: '',
      protocol: 'https:',
    })
    const urlFromSpoke = buildSpokeUrl('baterai', '/products')
    expect(urlFromSpoke).toBe('https://baterai.dayaberkah.id/products')
  })
})
