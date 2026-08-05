import { describe, it, expect, jest } from '@jest/globals'

jest.mock('../../../lib/api/sanity/image', () => ({
  getOptimizedImageUrl: jest.fn(() => 'https://mocked-sanity-image.url'),
}))

import {
  createOrganizationSchema,
  createProductSchema,
  createBreadcrumbSchema,
  createLocalBusinessSchema,
  createFAQSchema,
  createArticleSchema,
} from '../../../lib/seo/json-ld'

describe('SEO JSON-LD Schemas', () => {
  describe('createOrganizationSchema', () => {
    it('returns valid Organization schema', () => {
      const schema = createOrganizationSchema()
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Organization')
      expect(schema.name).toBe('DBSN Dayaberkah.id')
      expect(schema.url).toBe('https://dayaberkah.id')
      expect(schema.logo).toBe('https://dayaberkah.id/logo.png')
    })
  })

  describe('createProductSchema', () => {
    it('returns valid Product schema', () => {
      const product = {
        title: 'Solar Panel 100Wp',
        shortDescription: 'Panel surya efisiensi tinggi',
        images: [{ asset: { _ref: 'image-ref' } }], // sanity image
        specifications: [
          { key: 'Daya Maksimum', value: '100Wp' },
          { key: 'Efisiensi', value: '18%' },
        ],
      }
      const schema = createProductSchema(product, 'solarcell')
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Solar Panel 100Wp')
      expect(schema.description).toBe('Panel surya efisiensi tinggi')
      expect(schema.brand?.name).toBe('DBSN Dayaberkah.id')
      expect(schema.offers?.priceCurrency).toBe('IDR')
      expect(schema.offers?.availability).toBe('https://schema.org/InStock')
    })
  })

  describe('createBreadcrumbSchema', () => {
    it('returns valid BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', url: 'https://dayaberkah.id' },
        { name: 'Products', url: 'https://dayaberkah.id/products' },
      ]
      const schema = createBreadcrumbSchema(items)
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BreadcrumbList')
      expect(schema.itemListElement).toHaveLength(2)
      expect(schema.itemListElement[0].position).toBe(1)
      expect(schema.itemListElement[0].name).toBe('Home')
      expect(schema.itemListElement[0].item).toBe('https://dayaberkah.id')
      expect(schema.itemListElement[1].position).toBe(2)
    })
  })

  describe('createLocalBusinessSchema', () => {
    it('returns valid LocalBusiness schema', () => {
      const schema = createLocalBusinessSchema()
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('LocalBusiness')
      expect(schema.name).toBe('DBSN Dayaberkah.id')
      expect(schema.address?.addressLocality).toBe('Surabaya')
      expect(schema.telephone).toBe('+62-31-xxxxxx')
    })
  })

  describe('createFAQSchema', () => {
    it('returns valid FAQPage schema', () => {
      const items = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ]
      const schema = createFAQSchema(items)
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('FAQPage')
      expect(schema.mainEntity).toHaveLength(2)
      expect(schema.mainEntity[0]['@type']).toBe('Question')
      expect(schema.mainEntity[0].name).toBe('Q1')
      expect(schema.mainEntity[0].acceptedAnswer?.text).toBe('A1')
    })
  })

  describe('createArticleSchema', () => {
    it('returns valid BlogPosting schema', () => {
      const article = {
        title: 'Judul Artikel',
        publishedAt: '2026-06-21T05:00:00Z',
        excerpt: 'Ringkasan artikel',
        slug: 'judul-artikel',
        author: 'Admin DBSN',
      }
      const schema = createArticleSchema(article)
      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('BlogPosting')
      expect(schema.headline).toBe('Judul Artikel')
      expect(schema.description).toBe('Ringkasan artikel')
      expect(schema.author?.name).toBe('Admin DBSN')
      expect(schema.publisher?.name).toBe('PT. Daya Berkah Sentosa Nusantara (DBSN)')
    })
  })
})
