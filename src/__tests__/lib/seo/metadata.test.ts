import { describe, it, expect } from '@jest/globals'
import {
  createHubHomeMetadata,
  createHubPageMetadata,
  createSpokeHomeMetadata,
  createSpokeProductMetadata,
} from '../../../lib/seo/metadata'

describe('SEO Metadata Utilities', () => {
  describe('createHubHomeMetadata', () => {
    it('returns correct metadata for hub home page', () => {
      const meta = createHubHomeMetadata()
      expect(meta.title).toBe('DBSN Dayaberkah.id | Solusi Energi Terbarukan')
      expect(meta.description?.toLowerCase()).toContain('energi terbarukan')
      expect(meta.alternates?.canonical).toBe('https://dayaberkah.id')
      expect((meta.openGraph as any)?.type).toBe('website')
      expect(meta.openGraph?.images).toContainEqual(
        expect.objectContaining({
          url: 'https://dayaberkah.id/og-default.png',
        })
      )
    })

    it('returns a new object instance on every call (immutability)', () => {
      const meta1 = createHubHomeMetadata()
      const meta2 = createHubHomeMetadata()
      expect(meta1).not.toBe(meta2)
      expect(meta1.openGraph).not.toBe(meta2.openGraph)
    })
  })

  describe('createHubPageMetadata', () => {
    it('returns correct metadata for static hub sub-pages', () => {
      const meta = createHubPageMetadata('about')
      expect(meta.title).toBe('Tentang Kami | DBSN Dayaberkah.id')
      expect(meta.alternates?.canonical).toBe('https://dayaberkah.id/about')
    })

    it('throws error for invalid page name', () => {
      expect(() => {
        createHubPageMetadata('invalid' as any)
      }).toThrow()
    })
  })

  describe('createSpokeHomeMetadata', () => {
    it('returns subdomain-aware metadata for spoke home page', () => {
      const spokeConfig = {
        name: 'PJU Tenaga Surya',
        tagline: 'Penerangan Jalan Umum hemat energi',
      }
      const meta = createSpokeHomeMetadata('pju', spokeConfig)
      expect(meta.title).toBe('PJU Tenaga Surya | DBSN Dayaberkah.id')
      expect(meta.description).toBe('Penerangan Jalan Umum hemat energi')
      expect(meta.alternates?.canonical).toBe('https://pju.dayaberkah.id')
      expect((meta.openGraph as any)?.type).toBe('website')
    })
  })

  describe('createSpokeProductMetadata', () => {
    it('returns enriched product metadata', () => {
      const product = {
        title: 'Solar Panel 100Wp',
        shortDescription: 'Panel surya efisiensi tinggi',
        seoMeta: {
          title: 'Custom Product Title',
          description: 'Custom description',
        },
      }
      const meta = createSpokeProductMetadata('solarcell', product)
      expect(meta.title).toBe('Custom Product Title')
      expect(meta.description).toBe('Custom description')
      expect(meta.alternates?.canonical).toBe('https://solarcell.dayaberkah.id/products/solar-panel-100wp')
      expect((meta.openGraph as any)?.type).toBe('article')
    })

    it('uses fallback product title and description if seoMeta is missing', () => {
      const product = {
        title: 'Solar Panel 100Wp',
        shortDescription: 'Panel surya efisiensi tinggi',
      }
      const meta = createSpokeProductMetadata('solarcell', product)
      expect(meta.title).toBe('Solar Panel 100Wp | DBSN Dayaberkah.id')
      expect(meta.description).toBe('Panel surya efisiensi tinggi')
    })
  })
})
