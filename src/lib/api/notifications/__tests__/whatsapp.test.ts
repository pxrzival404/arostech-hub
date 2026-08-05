import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { buildWhatsAppFallbackUrl } from '../whatsapp'

describe('WhatsApp Fallback URL Builder', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.WHATSAPP_SALES_NUMBER = '6281234567890'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should serialize B2B RFQ data correctly into wa.me URL', () => {
    const mockB2BData = {
      segment: 'B2B' as const,
      source_domain: 'solarcell.dayaberkah.id',
      source_page_path: '/checkout',
      contact_name: 'John Doe',
      contact_email: 'john@example.com',
      contact_phone: '+628111222333',
      company_name: 'PT Sunshine',
      items: [
        {
          product_id: 'sanity-1',
          product_name: 'Solar Module 200W',
          quantity: 10,
          variant: 'Polycrystalline',
          item_notes: 'Needs quick shipping',
        },
      ],
      project_scope: 'Factory lighting installation',
      timeline: '2026-10-31',
      notes: 'Please quote ASAP',
    }

    const url = buildWhatsAppFallbackUrl(mockB2BData)
    expect(url).toBeDefined()
    expect(url.startsWith('https://wa.me/6281234567890?text=')).toBe(true)

    const textPart = decodeURIComponent(url.split('?text=')[1])
    expect(textPart).toContain('RFQ Segment: B2B')
    expect(textPart).toContain('Contact Name: John Doe')
    expect(textPart).toContain('Contact Email: john@example.com')
    expect(textPart).toContain('Company: PT Sunshine')
    expect(textPart).toContain('Solar Module 200W')
    expect(textPart).toContain('Qty: 10')
    expect(textPart).toContain('Variant: Polycrystalline')
    expect(textPart).toContain('Item Notes: Needs quick shipping')
    expect(textPart).toContain('Project Scope: Factory lighting installation')
    expect(textPart).toContain('Timeline: 2026-10-31')
    expect(textPart).toContain('Additional Notes: Please quote ASAP')
  })

  it('should serialize B2G RFQ data including procurement_type and dipa_reference', () => {
    const mockB2GData = {
      segment: 'B2G' as const,
      source_domain: 'dayaberkah.id',
      source_page_path: '/pju',
      contact_name: 'Ahmad Basuki',
      contact_email: 'ahmad@dinas.go.id',
      contact_phone: '+62899998888',
      company_name: 'Dinas Perhubungan',
      items: [
        {
          product_id: 'sanity-pju-2',
          product_name: 'PJU Smart Solar Light 80W',
          quantity: 150,
        },
      ],
      procurement_type: 'Tender Langsung' as const,
      dipa_reference: 'DIPA-2026-DISOP-01',
    }

    const url = buildWhatsAppFallbackUrl(mockB2GData)
    expect(url.startsWith('https://wa.me/6281234567890?text=')).toBe(true)

    const textPart = decodeURIComponent(url.split('?text=')[1])
    expect(textPart).toContain('RFQ Segment: B2G')
    expect(textPart).toContain('Procurement Type: Tender Langsung')
    expect(textPart).toContain('DIPA Reference: DIPA-2026-DISOP-01')
    expect(textPart).toContain('PJU Smart Solar Light 80W')
    expect(textPart).toContain('Qty: 150')
  })

  it('should URL encode special characters correctly', () => {
    const mockData = {
      segment: 'B2B' as const,
      source_domain: 'dayaberkah.id',
      contact_name: 'M. Ali & Partners',
      contact_email: 'ali@example.com',
      items: [
        {
          product_id: '1',
          product_name: 'Solar Panel 100W/12V',
          quantity: 1,
        },
      ],
    }

    const url = buildWhatsAppFallbackUrl(mockData)
    expect(url).toContain('M.%20Ali%20%26%20Partners')
    expect(url).toContain('Solar%20Panel%20100W%2F12V')
  })
})
