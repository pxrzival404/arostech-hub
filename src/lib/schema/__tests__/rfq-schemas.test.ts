import { describe, it, expect } from '@jest/globals'
import { z } from 'zod'

// Import the schemas
import {
  rfqB2GSchema,
  rfqB2BSchema,
  sharedRfqFieldsSchema,
  contactInfoSchema,
  rfqMetaSchema,
  rfqCartItemSchema,
  rfqItemsArraySchema,
} from '../rfq-schemas'

// ─── Helper: create a valid cart item ───────────────────────────────────────

function makeCartItem(overrides: Partial<z.infer<typeof rfqCartItemSchema>> = {}) {
  return {
    product_id: 'sanity-doc-abc123',
    product_name: 'PJU Solar Cell',
    quantity: 100,
    ...overrides,
  }
}

// ─── Cart Item Schema ───────────────────────────────────────────────────────

describe('RFQ Cart Item Schema', () => {
  it('should validate a complete cart item', () => {
    const item = makeCartItem({
      variant: '300W Monocrystalline',
      item_notes: 'Need IP65 rating',
    })

    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.product_id).toBe('sanity-doc-abc123')
      expect(result.data.product_name).toBe('PJU Solar Cell')
      expect(result.data.quantity).toBe(100)
      expect(result.data.variant).toBe('300W Monocrystalline')
      expect(result.data.item_notes).toBe('Need IP65 rating')
    }
  })

  it('should require product_id', () => {
    const item = makeCartItem({ product_id: '' })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['product_id'] })
      )
    }
  })

  it('should require product_name', () => {
    const item = makeCartItem({ product_name: '' })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['product_name'] })
      )
    }
  })

  it('should enforce minimum quantity of 1', () => {
    const item = makeCartItem({ quantity: 0 })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['quantity'] })
      )
    }
  })

  it('should enforce maximum quantity of 100000', () => {
    const item = makeCartItem({ quantity: 100001 })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['quantity'] })
      )
    }
  })

  it('should allow variant and item_notes to be optional', () => {
    const item = makeCartItem() // no variant or item_notes
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(true)
  })

  it('should trim product_name whitespace', () => {
    const item = makeCartItem({ product_name: '  Solar Panel  ' })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.product_name).toBe('Solar Panel')
    }
  })

  it('should enforce item_notes max length of 1000', () => {
    const item = makeCartItem({ item_notes: 'x'.repeat(1001) })
    const result = rfqCartItemSchema.safeParse(item)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['item_notes'] })
      )
    }
  })
})

// ─── Items Array Schema ─────────────────────────────────────────────────────

describe('RFQ Items Array Schema', () => {
  it('should accept an array with valid items', () => {
    const data = { items: [makeCartItem(), makeCartItem({ product_id: 'item-2', product_name: 'Battery Pack' })] }
    const result = rfqItemsArraySchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(2)
    }
  })

  it('should reject an empty items array', () => {
    const data = { items: [] }
    const result = rfqItemsArraySchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['items'] })
      )
    }
  })

  it('should reject more than 50 items', () => {
    const items = Array.from({ length: 51 }, (_, i) =>
      makeCartItem({ product_id: `item-${i}`, product_name: `Product ${i}` })
    )
    const data = { items }
    const result = rfqItemsArraySchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['items'] })
      )
    }
  })

  it('should validate each item in the array individually', () => {
    const data = {
      items: [
        makeCartItem(),
        makeCartItem({ quantity: -1 }), // invalid
      ],
    }
    const result = rfqItemsArraySchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['items', 1, 'quantity'] })
      )
    }
  })
})

// ─── Contact Info Schema ────────────────────────────────────────────────────

describe('Contact Info Schema', () => {
  it('should validate required contact fields', () => {
    const validData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
    }

    const result = contactInfoSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject missing required contact_email', () => {
    const invalidData = {
      contact_name: 'John Doe',
    }

    const result = contactInfoSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['contact_email'] })
      )
    }
  })

  it('should reject invalid email format', () => {
    const invalidData = {
      contact_name: 'John Doe',
      contact_email: 'invalid-email',
    }

    const result = contactInfoSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['contact_email'],
          code: 'invalid_format',
        })
      )
    }
  })

  it('should validate Indonesian phone format (+62...)', () => {
    const validData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      contact_phone: '+6281234567890',
    }

    const result = contactInfoSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should allow optional fields', () => {
    const minimalData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      // company_name and contact_phone omitted
    }

    const result = contactInfoSchema.safeParse(minimalData)
    expect(result.success).toBe(true)
  })

  it('should sanitize and trim whitespace from text fields', () => {
    const dataWithWhitespace = {
      contact_name: '  John Doe  ',
      contact_email: 'john@example.com',
      company_name: '  PT Example  ',
    }

    const result = contactInfoSchema.safeParse(dataWithWhitespace)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.contact_name).toBe('John Doe')
      expect(result.data.company_name).toBe('PT Example')
    }
  })
})

// ─── RFQ Meta Schema ────────────────────────────────────────────────────────

describe('RFQ Meta Schema', () => {
  it('should accept valid timeline in YYYY-MM-DD format', () => {
    const validData = {
      timeline: '2025-06-30',
    }

    const result = rfqMetaSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject invalid date format', () => {
    const invalidData = {
      timeline: '30-06-2025',
    }

    const result = rfqMetaSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should allow all meta fields to be optional', () => {
    const result = rfqMetaSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

// ─── Shared RFQ Fields Schema (backward compat) ────────────────────────────

describe('Shared RFQ Fields Schema', () => {
  it('should validate shared fields with items array', () => {
    const validData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      contact_phone: '+6281234567890',
      company_name: 'PT Example',
      items: [makeCartItem()],
      project_scope: 'Street lighting for Jakarta area',
      timeline: '2024-12-31',
    }

    const result = sharedRfqFieldsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject missing items array', () => {
    const invalidData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
    }

    const result = sharedRfqFieldsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject empty items array', () => {
    const invalidData = {
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      items: [],
    }

    const result = sharedRfqFieldsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

// ─── B2G RFQ Schema ─────────────────────────────────────────────────────────

describe('B2G RFQ Schema', () => {
  it('should validate complete B2G RFQ with all required fields', () => {
    const validB2G = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      source_page_path: '/pju/rfq',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      contact_phone: '+6281234567890',
      company_name: 'Dinas PUPR Jakarta',
      items: [
        makeCartItem({ product_name: 'PJU Solar Cell', quantity: 500 }),
      ],
      project_scope: 'Renovasi PJU 100 titik',
      timeline: '2025-03-31',
      procurement_type: 'Tender Langsung',
      dipa_reference: 'DIPA-2025-12345',
      notes: 'Membutuhkan sertifikasi TKDN',
    }

    const result = rfqB2GSchema.safeParse(validB2G)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.segment).toBe('B2G')
      expect(result.data.procurement_type).toBe('Tender Langsung')
      expect(result.data.items).toHaveLength(1)
      expect(result.data.items[0].product_name).toBe('PJU Solar Cell')
    }
  })

  it('should validate B2G with multiple cart items', () => {
    const validB2G = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [
        makeCartItem({ product_id: 'pju-100w', product_name: 'PJU 100W', quantity: 200 }),
        makeCartItem({ product_id: 'pju-200w', product_name: 'PJU 200W', quantity: 300, variant: 'Monocrystalline' }),
        makeCartItem({ product_id: 'battery-12v', product_name: 'Battery 12V', quantity: 200, item_notes: 'Lithium preferred' }),
      ],
      procurement_type: 'Tender Langsung',
    }

    const result = rfqB2GSchema.safeParse(validB2G)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(3)
      expect(result.data.items[2].item_notes).toBe('Lithium preferred')
    }
  })

  it('should require procurement_type for B2G', () => {
    const invalidB2G = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [makeCartItem()],
      // Missing procurement_type
    }

    const result = rfqB2GSchema.safeParse(invalidB2G)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ['procurement_type'] })
      )
    }
  })

  it('should validate against allowed procurement types', () => {
    const allowedTypes = [
      'Tender Langsung',
      'Tender Umum',
      'Penunjukan Langsung',
      'E-Purchasing',
    ]

    allowedTypes.forEach((type) => {
      const data = {
        segment: 'B2G',
        source_domain: 'dayaberkah.id',
        contact_name: 'PPK Officer',
        contact_email: 'ppk@gov.id',
        items: [makeCartItem()],
        procurement_type: type,
      }

      const result = rfqB2GSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should reject invalid procurement_type', () => {
    const invalidB2G = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [makeCartItem()],
      procurement_type: 'Invalid Type',
    }

    const result = rfqB2GSchema.safeParse(invalidB2G)
    expect(result.success).toBe(false)
  })

  it('should validate DIPA reference format', () => {
    const validData = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [makeCartItem()],
      procurement_type: 'Tender Langsung',
      dipa_reference: 'DIPA-2025-12345',
    }

    const result = rfqB2GSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should allow DIPA reference to be optional', () => {
    const dataWithoutDipa = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [makeCartItem()],
      procurement_type: 'Tender Langsung',
      // dipa_reference omitted
    }

    const result = rfqB2GSchema.safeParse(dataWithoutDipa)
    expect(result.success).toBe(true)
  })

  it('should include source tracking fields', () => {
    const dataWithTracking = {
      segment: 'B2G',
      source_domain: 'pju.dayaberkah.id',
      source_page_path: '/products/street-light',
      source_campaign_tag: 'google-ads',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'pju-promo',
      contact_name: 'PPK Officer',
      contact_email: 'ppk@gov.id',
      items: [makeCartItem()],
      procurement_type: 'Tender Langsung',
    }

    const result = rfqB2GSchema.safeParse(dataWithTracking)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.source_domain).toBe('pju.dayaberkah.id')
      expect(result.data.source_page_path).toBe('/products/street-light')
      expect(result.data.utm_source).toBe('google')
    }
  })
})

// ─── B2B RFQ Schema ─────────────────────────────────────────────────────────

describe('B2B RFQ Schema', () => {
  it('should validate complete B2B RFQ with all required fields', () => {
    const validB2B = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      source_page_path: '/solarcell/rfq',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      contact_phone: '+6281234567890',
      company_name: 'PT Solar Indonesia',
      items: [
        makeCartItem({ product_name: 'Solar Cell Panel', quantity: 200 }),
      ],
      project_scope: 'Installation for warehouse',
      timeline: '2025-04-30',
      notes: 'Need datasheets and installation guide',
    }

    const result = rfqB2BSchema.safeParse(validB2B)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.segment).toBe('B2B')
      expect(result.data.items).toHaveLength(1)
    }
  })

  it('should validate B2B with multiple cart items', () => {
    const validB2B = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      items: [
        makeCartItem({ product_id: 'panel-300w', product_name: 'Solar Panel 300W', quantity: 50 }),
        makeCartItem({ product_id: 'inverter-5kw', product_name: 'Inverter 5kW', quantity: 10, variant: 'Hybrid' }),
      ],
    }

    const result = rfqB2BSchema.safeParse(validB2B)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(2)
    }
  })

  it('should reject B2B with empty items array', () => {
    const invalidB2B = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      items: [],
    }

    const result = rfqB2BSchema.safeParse(invalidB2B)
    expect(result.success).toBe(false)
  })

  it('should not require procurement_type for B2B', () => {
    const b2bWithoutProcurementType = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      items: [makeCartItem()],
      // procurement_type not included
    }

    const result = rfqB2BSchema.safeParse(b2bWithoutProcurementType)
    expect(result.success).toBe(true)
  })

  it('should allow company_name to be optional for B2B', () => {
    const b2bWithoutCompany = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Individual Buyer',
      contact_email: 'buyer@gmail.com',
      items: [makeCartItem({ quantity: 10 })],
      // company_name omitted
    }

    const result = rfqB2BSchema.safeParse(b2bWithoutCompany)
    expect(result.success).toBe(true)
  })

  it('should reject B2B with procurement_type (B2G-only field)', () => {
    const b2bWithProcurementType = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      items: [makeCartItem()],
      procurement_type: 'Tender Langsung',
    }

    const result = rfqB2BSchema.safeParse(b2bWithProcurementType)
    expect(result.success).toBe(false)
  })

  it('should include source tracking fields', () => {
    const dataWithTracking = {
      segment: 'B2B',
      source_domain: 'solarcell.dayaberkah.id',
      source_page_path: '/products/panel-300w',
      source_campaign_tag: 'linkedin-ad',
      utm_source: 'linkedin',
      contact_name: 'Procurement Manager',
      contact_email: 'procurement@company.com',
      items: [makeCartItem({ quantity: 50 })],
    }

    const result = rfqB2BSchema.safeParse(dataWithTracking)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.source_domain).toBe('solarcell.dayaberkah.id')
      expect(result.data.utm_source).toBe('linkedin')
    }
  })
})

// ─── Segment Validation ─────────────────────────────────────────────────────

describe('Segment Validation', () => {
  it('should accept B2G segment', () => {
    const data = {
      segment: 'B2G',
      source_domain: 'dayaberkah.id',
      contact_name: 'Test User',
      contact_email: 'test@example.com',
      items: [makeCartItem()],
      procurement_type: 'Tender Langsung',
    }

    const result = rfqB2GSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept B2B segment', () => {
    const data = {
      segment: 'B2B',
      source_domain: 'dayaberkah.id',
      contact_name: 'Test User',
      contact_email: 'test@example.com',
      items: [makeCartItem()],
    }

    const result = rfqB2BSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid segment', () => {
    const data = {
      segment: 'B2C',
      source_domain: 'dayaberkah.id',
      contact_name: 'Test User',
      contact_email: 'test@example.com',
      items: [makeCartItem()],
    }

    const resultB2G = rfqB2GSchema.safeParse(data)
    const resultB2B = rfqB2BSchema.safeParse(data)
    expect(resultB2G.success).toBe(false)
    expect(resultB2B.success).toBe(false)
  })
})