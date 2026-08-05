import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'

/**
 * Generate an image URL builder for a Sanity image source.
 *
 * @param source - Sanity image asset or reference
 * @returns Image URL builder with chainable methods
 *
 * @example
 * ```tsx
 * import { urlForImage } from '@/lib/api/sanity/image'
 * import Image from 'next/image'
 *
 * const imageUrl = urlForImage(product.images[0])
 *   .width(800)
 *   .height(600)
 *   .quality(80)
 *   .auto('format')
 *   .url()
 *
 * <Image
 *   src={imageUrl}
 *   alt={product.title}
 *   width={800}
 *   height={600}
 * />
 * ```
 */
export function urlForImage(source: {
  _type: 'image'
  asset?: { _ref: string }
}) {
  return createImageUrlBuilder(client).image(source)
}

/**
 * Get an optimized image URL for use with Next.js Image component.
 * Returns a string URL with appropriate transformations.
 *
 * @param source - Sanity image asset or reference
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels (optional)
 * @param quality - Image quality (0-100, default 80)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  source: { _type: 'image'; asset?: { _ref: string } } | null | undefined,
  width: number,
  height?: number,
  quality = 80,
): string | null {
  if (!source) {
    return null
  }

  let builder = urlForImage(source).width(width).quality(quality).auto('format')

  if (height) {
    builder = builder.height(height)
  }

  return builder.url()
}

/**
 * Default image loader for Next.js Image component.
 * Configure in next.config.ts to use this loader for Sanity images.
 *
 * @example
 * // next.config.ts
 * import { sanityImageLoader } from '@/lib/api/sanity/image'
 *
 * const nextConfig = {
 *   images: {
 *     loader: sanityImageLoader,
 *   },
 * }
 * ```
 */
export function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  const url = createImageUrlBuilder(client).image(src).width(width).quality(quality ?? 80).url()

  return url
}