/**
 * Sanity CMS content type definitions.
 * These interfaces mirror the Sanity schema structure and GROQ projections.
 */

// ============================================================================
// Shared Types
// ============================================================================

import type { PortableTextBlock as SanityPortableTextBlock } from '@portabletext/types'

/**
 * Portable text block from Sanity CMS.
 * Processed with @portabletext/react in components.
 */
export type PortableTextBlock = SanityPortableTextBlock

/**
 * SEO metadata for CMS content.
 */
export interface SeoMeta {
  title: string
  description: string
  ogImage?: ImageAsset
}

/**
 * Sanity image asset structure.
 */
export interface ImageAsset {
  _key: string
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

/**
 * Sanity file asset structure.
 */
export interface FileAsset {
  _key: string
  _type: 'file'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

// ============================================================================
// Product
// ============================================================================

export interface Specification {
  key: string
  value: string
}

export interface Product {
  _id: string
  _type: 'product'
  title: string
  slug: {
    current: string
  }
  spoke: {
    _ref: string
  }
  shortDescription: string
  fullDescription: PortableTextBlock[]
  specifications: Specification[]
  images: ImageAsset[]
  datasheetUrl?: string
  relatedCertifications: CertificationRef[]
  seoMeta: SeoMeta
}

/**
 * Lightweight certification reference within Product.
 */
export interface CertificationRef {
  _ref: string
  _type: 'reference'
}

// ============================================================================
// Certification
// ============================================================================

export type CertType = 'SNI' | 'TKDN' | 'LKPP' | 'ISO' | 'Other'

export interface Certification {
  _id: string
  _type: 'certification'
  title: string
  slug: string
  certificationBody: string
  certType: CertType
  issueDate: string
  expiryDate: string
  documentUrl?: string
  coverImage?: ImageAsset
  isIndexable: boolean
  seoMeta: SeoMeta
}

// ============================================================================
// Portfolio Entry
// ============================================================================

export type ClientCategory = 'Government' | 'BUMN' | 'Private' | 'EPC'

export interface PortfolioEntry {
  _id: string
  _type: 'portfolioEntry'
  title: string
  slug: {
    current: string
  }
  projectType: string
  clientCategory: ClientCategory
  location: string
  completionYear: number
  scopeDescription: PortableTextBlock[]
  outcome: string
  images: ImageAsset[]
  relatedSpoke?: {
    _ref: string
  }
  relatedProducts: ProductRef[]
  seoMeta: SeoMeta
}

/**
 * Lightweight product reference within PortfolioEntry.
 */
export interface ProductRef {
  _ref: string
  _type: 'reference'
}

// ============================================================================
// Spoke Configuration
// ============================================================================

export interface SpokeConfig {
  _id: string
  _type: 'spokeConfig'
  name: string
  subdomain: string
  tagline: string
  heroImage?: ImageAsset
  primaryColor: string
  featuredProducts: FeaturedProduct[]
  seoDefaults: SeoMeta
}

/**
 * Featured product with expanded fields.
 */
export interface FeaturedProduct {
  _id: string
  title: string
  slug: {
    current: string
  }
  shortDescription: string
  images: ImageAsset[]
}

// ============================================================================
// Page
// ============================================================================

export interface Page {
  _id: string
  _type: 'page'
  title: string
  slug: {
    current: string
  }
  targetSpoke?: {
    _ref: string
  }
  sections: PortableTextBlock[] | CustomBlock[]
  seoMeta: SeoMeta
}

/**
 * Custom block for page sections.
 */
export interface CustomBlock {
  _key: string
  _type: string
  [key: string]: unknown
}

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Product with spoke and certifications expanded.
 */
export interface ProductWithRelations extends Omit<Product, 'spoke' | 'relatedCertifications' | 'slug'> {
  slug: string
  spoke: {
    _id: string
    subdomain: string
    name: string
  }
  relatedCertifications: Array<{
    _id: string
    title: string
    slug: string
  }>
}

/**
 * Portfolio entry with spoke and products expanded.
 */
export interface PortfolioWithRelations extends Omit<PortfolioEntry, 'relatedSpoke' | 'relatedProducts' | 'slug'> {
  slug: string
  relatedSpoke?: {
    _id: string
    subdomain: string
    name: string
  }
  relatedProducts: Array<{
    _id: string
    title: string
    slug: string
  }>
}

/**
 * Spoke config with products fully expanded.
 */
export interface SpokeConfigWithProducts extends Omit<SpokeConfig, 'featuredProducts'> {
  featuredProducts: Array<{
    _id: string
    title: string
    slug: string
    shortDescription: string
    images: ImageAsset[]
  }>
}

/**
 * Page with optional spoke reference expanded.
 */
export interface PageWithSpoke extends Omit<Page, 'targetSpoke' | 'slug'> {
  slug: string
  targetSpoke?: {
    _id: string
    subdomain: string
    name: string
  } | null
}

// ============================================================================
// Article
// ============================================================================

export interface Article {
  _id: string
  _type: 'article'
  title: string
  slug: {
    current: string
  }
  category: string
  excerpt: string
  content: PortableTextBlock[]
  author: string | null
  publishedAt: string
  readingTime: number
  seoMeta?: SeoMeta
}

export interface ArticleWithRelations extends Omit<Article, 'slug'> {
  slug: string
}