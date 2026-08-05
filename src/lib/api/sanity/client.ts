import { createClient, type FilterDefault } from 'next-sanity'
import { getSanityEnv } from '@/lib/config/env'

/**
 * Filter for stega source map encoding.
 * Excludes URL fields from stega encoding to prevent data leakage.
 */
const encodeSourceMapAtPath: FilterDefault = (props) => {
  if (props.sourcePath.at(-1) === 'url') {
    return false
  }
  return props.filterDefault(props)
}

/**
 * Configured Sanity client for the application.
 * Uses CDN for production with proper caching and ISR support.
 *
 * @example
 * ```tsx
 * import { client } from '@/lib/api/sanity/client'
 *
 * const products = await client.fetch('*[_type == "product"]')
 * ```
 */
export const client = createClient({
  projectId: getSanityEnv().SANITY_PROJECT_ID,
  dataset: getSanityEnv().SANITY_DATASET,
  apiVersion: getSanityEnv().SANITY_API_VERSION,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
  token: getSanityEnv().SANITY_API_READ_TOKEN,
  stega: {
    enabled:
      process.env.NODE_ENV === 'development' ||
      (process.env.CF_PAGES === '1' && process.env.CF_PAGES_BRANCH !== 'main') ||
      process.env.SANITY_SOURCE_MAP === 'true',
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio',
    filter: encodeSourceMapAtPath,
  },
})

/**
 * Cache tags for ISR revalidation.
 * Tags follow the pattern: `sanity:{documentType}` or `sanity:{documentType}:{id}`
 */
export const CACHE_TAGS = {
  product: (id?: string) => (id ? `sanity:product:${id}` : 'sanity:product'),
  certification: (id?: string) =>
    id ? `sanity:certification:${id}` : 'sanity:certification',
  portfolio: (id?: string) => (id ? `sanity:portfolio:${id}` : 'sanity:portfolio'),
  article: (id?: string) => (id ? `sanity:article:${id}` : 'sanity:article'),
  spoke: (subdomain: string) => `sanity:spoke:${subdomain}`,
  spokeConfig: (id?: string) =>
    id ? `sanity:spokeConfig:${id}` : 'sanity:spokeConfig',
  page: (id?: string) => (id ? `sanity:page:${id}` : 'sanity:page'),
  all: 'sanity:all',
} as const

export type CacheTag = typeof CACHE_TAGS

/**
 * Fetch options with cache tags for ISR.
 */
export interface FetchOptions {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

/**
 * Create fetch options with proper cache tags.
 *
 * @param tags - Cache tags to apply
 * @param revalidate - Optional revalidation time in seconds
 * @returns Next.js fetch options
 */
export function createFetchOptions(
  tags: string[],
  revalidate?: number,
): FetchOptions {
  return {
    next: {
      revalidate: revalidate ?? 3600,
      tags,
    },
  }
}