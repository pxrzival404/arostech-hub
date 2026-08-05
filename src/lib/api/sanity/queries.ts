import { groq, defineQuery } from 'next-sanity'
import { client, CACHE_TAGS, type FetchOptions } from './client'
import type {
  ProductWithRelations,
  Certification,
  PortfolioWithRelations,
  SpokeConfig,
  SpokeConfigWithProducts,
  PageWithSpoke,
  Article,
  ArticleWithRelations,
} from './types'

/**
 * Query options for Sanity fetches.
 */
export interface QueryOptions {
  preview?: boolean
}

// ============================================================================
// Product Queries
// ============================================================================

const productFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  spoke->{_id, subdomain, name},
  shortDescription,
  fullDescription,
  specifications,
  images,
  "datasheetUrl": datasheetFile.asset->url,
  relatedCertifications->{_id, title, "slug": slug.current},
  seoMeta
`

/**
 * Fetch all products for a specific spoke subdomain.
 *
 * @param spokeSubdomain - Subdomain to filter by (e.g., "pju", "solarcell")
 * @param options - Query options
 * @returns Array of products with relations expanded, or null
 */
export async function getProductsBySpoke(
  spokeSubdomain: string,
): Promise<ProductWithRelations[] | null> {
  const query = defineQuery(groq`
    *[_type == "product" && spoke.subdomain == $subdomain]{
      ${productFields}
    }|order(title asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.product(), CACHE_TAGS.spoke(spokeSubdomain)],
    },
  }

  try {
    return await client.fetch(query, { subdomain: spokeSubdomain }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch a single product by slug.
 *
 * @param slug - Product slug
 * @param options - Query options
 * @returns Product with relations, or null
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  const query = defineQuery(groq`
    *[_type == "product" && slug.current == $slug][0]{
      ${productFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.product()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch all product slug/subdomain pairs in a single query.
 * Optimized for generateStaticParams() — avoids N+1 queries.
 */
export async function getProductSlugsWithSpokes(): Promise<
  Array<{ slug: string; subdomain: string }> | null
> {
  const query = defineQuery(groq`
    *[_type == "product"]{
      "slug": slug.current,
      "subdomain": spoke->subdomain
    }
  `)
  try {
    return await client.fetch<Array<{ slug: string; subdomain: string }>>(
      query,
      {},
      {
        next: { revalidate: 3600, tags: [CACHE_TAGS.product()] },
      },
    )
  } catch {
    return null
  }
}

// ============================================================================
// Certification Queries
// ============================================================================

const certificationFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  certificationBody,
  certType,
  issueDate,
  expiryDate,
  "documentUrl": documentFile.asset->url,
  coverImage,
  isIndexable,
  seoMeta
`

/**
 * Fetch all indexable certifications.
 *
 * @param options - Query options
 * @returns Array of certifications, or null
 */
export async function getCertifications(): Promise<Certification[] | null> {
  const query = defineQuery(groq`
    *[_type == "certification" && isIndexable == true]{
      ${certificationFields}
    }|order(certType asc, title asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.certification()],
    },
  }

  try {
    return await client.fetch(query, {}, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch a single certification by slug.
 *
 * @param slug - Certification slug
 * @param options - Query options
 * @returns Certification, or null
 */
export async function getCertificationBySlug(
  slug: string,
): Promise<Certification | null> {
  const query = defineQuery(groq`
    *[_type == "certification" && slug.current == $slug][0]{
      ${certificationFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.certification()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Portfolio Queries
// ============================================================================

const portfolioFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  projectType,
  clientCategory,
  location,
  completionYear,
  scopeDescription,
  outcome,
  images,
  relatedSpoke->{_id, subdomain, name},
  relatedProducts->{_id, title, "slug": slug.current},
  seoMeta
`

/**
 * Fetch portfolio entries, optionally filtered by spoke.
 *
 * @param spokeSubdomain - Optional subdomain filter
 * @param options - Query options
 * @returns Array of portfolio entries, or null
 */
export async function getPortfolioEntries(
  spokeSubdomain?: string,
): Promise<PortfolioWithRelations[] | null> {
  const baseQuery = spokeSubdomain
    ? `*[_type == "portfolioEntry" && relatedSpoke.subdomain == $subdomain]`
    : `*[_type == "portfolioEntry"]`

  const query = defineQuery(groq`
    ${baseQuery}{
      ${portfolioFields}
    }|order(completionYear desc, title asc)
  `)

  const tags = [CACHE_TAGS.portfolio()]
  if (spokeSubdomain) {
    tags.push(CACHE_TAGS.spoke(spokeSubdomain))
  }

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags,
    },
  }

  try {
    return await client.fetch(
      query,
      { subdomain: spokeSubdomain },
      fetchOptions,
    )
  } catch {
    return null
  }
}

/**
 * Fetch a single portfolio entry by slug.
 *
 * @param slug - Portfolio entry slug
 * @param options - Query options
 * @returns Portfolio entry with relations, or null
 */
export async function getPortfolioBySlug(
  slug: string,
): Promise<PortfolioWithRelations | null> {
  const query = defineQuery(groq`
    *[_type == "portfolioEntry" && slug.current == $slug][0]{
      ${portfolioFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.portfolio()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Spoke Config Queries
// ============================================================================

const spokeConfigFields = groq`
  _id,
  _type,
  name,
  subdomain,
  tagline,
  heroImage,
  primaryColor,
  featuredProducts->{_id, title, "slug": slug.current, shortDescription, images},
  seoDefaults
`

/**
 * Fetch spoke configuration by subdomain.
 *
 * @param subdomain - Spoke subdomain
 * @param options - Query options
 * @returns Spoke config with products, or null
 */
export async function getSpokeConfig(
  subdomain: string,
): Promise<SpokeConfigWithProducts | null> {
  const query = defineQuery(groq`
    *[_type == "spokeConfig" && subdomain == $subdomain][0]{
      ${spokeConfigFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.spokeConfig(), CACHE_TAGS.spoke(subdomain)],
    },
  }

  try {
    return await client.fetch(query, { subdomain }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch all spoke configurations for navigation.
 *
 * @param options - Query options
 * @returns Array of all spoke configs, or null
 */
export async function getAllSpokeConfigs(): Promise<SpokeConfig[] | null> {
  const query = defineQuery(groq`
    *[_type == "spokeConfig"]{
      _id,
      _type,
      name,
      subdomain,
      tagline,
      primaryColor
    }|order(name asc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.spokeConfig()],
    },
  }

  try {
    return await client.fetch(query, {}, fetchOptions)
  } catch {
    return null
  }
}

// ============================================================================
// Page Queries
// ============================================================================

const pageFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  targetSpoke->{_id, subdomain, name},
  sections,
  seoMeta
`

/**
 * Fetch a page by slug, optionally filtered by spoke.
 *
 * @param slug - Page slug
 * @param spokeSubdomain - Optional spoke subdomain filter
 * @param options - Query options
 * @returns Page with relations, or null
 */
export async function getPageBySlug(
  slug: string,
  spokeSubdomain?: string,
): Promise<PageWithSpoke | null> {
  const baseQuery = spokeSubdomain
    ? `*[_type == "page" && slug.current == $slug && targetSpoke.subdomain == $subdomain]`
    : `*[_type == "page" && slug.current == $slug]`

  const query = defineQuery(groq`
    ${baseQuery}[0]{
      ${pageFields}
    }
  `)

  const tags = [CACHE_TAGS.page()]
  if (spokeSubdomain) {
    tags.push(CACHE_TAGS.spoke(spokeSubdomain))
  }

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags,
    },
  }

  try {
    return await client.fetch(
      query,
      { slug, subdomain: spokeSubdomain },
      fetchOptions,
    )
  } catch {
    return null
  }
}

// ============================================================================
// Article Queries
// ============================================================================

const articleFields = groq`
  _id,
  _type,
  title,
  "slug": slug.current,
  category,
  excerpt,
  content,
  author,
  publishedAt,
  readingTime,
  seoMeta
`

/**
 * Fetch all articles from Sanity CMS.
 *
 * @returns Array of articles, or null
 */
export async function getArticles(): Promise<ArticleWithRelations[] | null> {
  const query = defineQuery(groq`
    *[_type == "article"]{
      ${articleFields}
    }|order(publishedAt desc)
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.article()],
    },
  }

  try {
    return await client.fetch(query, {}, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch a single article by slug.
 *
 * @param slug - Article slug
 * @returns Article with relations, or null
 */
export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithRelations | null> {
  const query = defineQuery(groq`
    *[_type == "article" && slug.current == $slug][0]{
      ${articleFields}
    }
  `)

  const fetchOptions: FetchOptions = {
    next: {
      revalidate: 3600,
      tags: [CACHE_TAGS.article()],
    },
  }

  try {
    return await client.fetch(query, { slug }, fetchOptions)
  } catch {
    return null
  }
}

/**
 * Fetch all article slugs.
 *
 * @returns Array of slugs, or null
 */
export async function getArticleSlugs(): Promise<Array<{ slug: string }> | null> {
  const query = defineQuery(groq`
    *[_type == "article" && defined(slug.current)]{
      "slug": slug.current
    }
  `)
  try {
    return await client.fetch<Array<{ slug: string }>>(
      query,
      {},
      {
        next: { revalidate: 3600, tags: [CACHE_TAGS.article()] },
      },
    )
  } catch {
    return null
  }
}

/**
 * Fetch all portfolio entry slugs.
 *
 * @returns Array of slugs, or null
 */
export async function getPortfolioSlugs(): Promise<Array<{ slug: string }> | null> {
  const query = defineQuery(groq`
    *[_type == "portfolioEntry" && defined(slug.current)]{
      "slug": slug.current
    }
  `)
  try {
    return await client.fetch<Array<{ slug: string }>>(
      query,
      {},
      {
        next: { revalidate: 3600, tags: [CACHE_TAGS.portfolio()] },
      },
    )
  } catch {
    return null
  }
}