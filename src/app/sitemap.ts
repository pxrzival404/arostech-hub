import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { extractSubdomain, isSpokeDomain } from '../lib/middleware/config'
import { getProductSlugsWithSpokes, getArticleSlugs, getPortfolioSlugs } from '../lib/api/sanity/queries'

export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host') || 'dayaberkah.id'
  const subdomain = extractSubdomain(host)
  const isSpoke = isSpokeDomain(host)

  const lastModified = new Date()

  if (isSpoke) {
    const baseUrl = `https://${subdomain}.dayaberkah.id`
    const entries: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
    ]

    try {
      const products = await getProductSlugsWithSpokes()
      if (products) {
        const spokeProducts = products.filter(p => p.subdomain === subdomain)
        for (const p of spokeProducts) {
          entries.push({
            url: `${baseUrl}/products/${p.slug}`,
            lastModified,
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        }
      }
    } catch {
      // Safe fallback: just serve the spoke home page
    }

    return entries
  }

  // Hub domain sitemap
  const baseUrl = 'https://dayaberkah.id'
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/certifications',
    '/portfolio',
    '/products',
    '/articles',
    '/faq',
  ]

  const entries: MetadataRoute.Sitemap = staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: page === '' ? 1.0 : 0.8,
  }))

  try {
    const articles = await getArticleSlugs()
    if (articles) {
      for (const a of articles) {
        entries.push({
          url: `${baseUrl}/articles/${a.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Ignore error
  }

  try {
    const portfolios = await getPortfolioSlugs()
    if (portfolios) {
      for (const p of portfolios) {
        entries.push({
          url: `${baseUrl}/portfolio/${p.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // Ignore error
  }

  return entries
}
