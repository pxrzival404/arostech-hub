import { z } from 'zod'

// Indonesian phone number regex: +62 followed by 8-12 digits
const indonesianPhoneRegex = /^\+62[1-9]\d{8,12}$/

// Allowed procurement types for B2G
export const PROCUREMENT_TYPES = [
  'Tender Langsung',
  'Tender Umum',
  'Penunjukan Langsung',
  'E-Purchasing',
] as const

// Segment types
const SEGMENT_TYPES = ['B2G', 'B2B'] as const

// ─── Source tracking schema (unchanged) ─────────────────────────────────────

const sourceTrackingSchema = z.object({
  source_domain: z.string().min(1).max(255).or(z.literal('')),
  source_page_path: z.string().min(1).max(512).optional().or(z.literal('')),
  source_campaign_tag: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_source: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_medium: z.string().min(1).max(255).optional().or(z.literal('')),
  utm_campaign: z.string().min(1).max(255).optional().or(z.literal('')),
})

// ─── Contact information schema ─────────────────────────────────────────────

export const contactInfoSchema = z.object({
  contact_name: z.string()
    .min(1, 'Contact name is required')
    .max(255, 'Contact name is too long')
    .trim(),
  contact_email: z.string()
    .min(1, 'Contact email is required')
    .email('Invalid email address'),
  contact_phone: z.string()
    .regex(indonesianPhoneRegex, 'Phone number must be in +62 format')
    .optional()
    .or(z.literal('')),
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(255, 'Company name is too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// ─── Project-level metadata (applies to entire RFQ, not per-item) ───────────

export const rfqMetaSchema = z.object({
  project_scope: z.string()
    .min(1, 'Project scope is required')
    .max(5000, 'Project scope is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  timeline: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Timeline must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(2000, 'Notes are too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// ─── Cart item schema (atomic product line) ─────────────────────────────────

/**
 * Represents a single line item in the RFQ cart.
 *
 * `product_id` is the Sanity document `_id` — stable and immutable, enabling
 * server-side cross-referencing with the product catalog.
 *
 * `product_name` is denormalized at submission time for human readability in
 * emails/CRM. If a product name changes in Sanity later, the RFQ submission
 * still reflects what the user actually saw.
 *
 * `item_notes` allows per-item specifications (e.g., "need IP65 rating").
 */
export const rfqCartItemSchema = z.object({
  product_id: z.string()
    .min(1, 'Product ID is required')
    .max(255, 'Product ID is too long'),
  product_name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name is too long')
    .trim(),
  quantity: z.number({ error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100000, 'Quantity exceeds maximum'),
  variant: z.string()
    .max(255, 'Variant description is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  item_notes: z.string()
    .max(1000, 'Item notes are too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// ─── Cart items array schema ────────────────────────────────────────────────

/**
 * Wraps cart items into a validated array.
 * Minimum 1 item prevents empty-cart submissions.
 * Maximum 50 is a sensible B2B/B2G ceiling.
 */
export const rfqItemsArraySchema = z.object({
  items: z.array(rfqCartItemSchema)
    .min(1, 'At least one product is required')
    .max(50, 'Maximum 50 items per RFQ'),
})

// ─── B2G-specific fields (unchanged) ────────────────────────────────────────

const b2GSpecificFieldsSchema = z.object({
  procurement_type: z.enum(PROCUREMENT_TYPES, {
    error: 'Procurement type is required',
  }),
  dipa_reference: z.string()
    .min(1, 'Dipa reference is required')
    .max(255, 'Dipa reference is too long')
    .trim()
    .optional()
    .or(z.literal('')),
})

// ─── Backward compatibility ─────────────────────────────────────────────────

/**
 * @deprecated Use `contactInfoSchema`, `rfqMetaSchema`, and `rfqItemsArraySchema`
 * directly. Preserved for backward compatibility with existing imports.
 */
export const sharedRfqFieldsSchema = contactInfoSchema
  .merge(rfqMetaSchema)
  .merge(rfqItemsArraySchema)

// ─── Composed final schemas ─────────────────────────────────────────────────

// B2G RFQ schema
export const rfqB2GSchema = sourceTrackingSchema
  .merge(contactInfoSchema)
  .merge(rfqMetaSchema)
  .merge(rfqItemsArraySchema)
  .merge(b2GSpecificFieldsSchema)
  .extend({
    segment: z.literal('B2G'),
  })
  .strict()

// B2B RFQ schema
export const rfqB2BSchema = sourceTrackingSchema
  .merge(contactInfoSchema)
  .merge(rfqMetaSchema)
  .merge(rfqItemsArraySchema)
  .extend({
    segment: z.literal('B2B'),
  })
  .strict()

// ─── Type exports (all inferred from Zod — no manual interfaces) ────────────

// Atomic types
export type RfqCartItem = z.infer<typeof rfqCartItemSchema>
export type ContactInfo = z.infer<typeof contactInfoSchema>
export type RfqMeta = z.infer<typeof rfqMetaSchema>

// Composite types (unchanged export names, new shapes)
export type RfqSharedFields = z.infer<typeof sharedRfqFieldsSchema>
export type RfqB2GInput = z.infer<typeof rfqB2GSchema>
export type RfqB2BInput = z.infer<typeof rfqB2BSchema>
export type SourceTracking = z.infer<typeof sourceTrackingSchema>

// Existing exports preserved
export type ProcurementType = (typeof PROCUREMENT_TYPES)[number]
export type SegmentType = (typeof SEGMENT_TYPES)[number]