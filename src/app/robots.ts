import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { extractSubdomain, isSpokeDomain, isDashboardDomain } from '../lib/middleware/config'

export const runtime = 'edge'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers()
  const host = headersList.get('host') || 'dayaberkah.id'
  const subdomain = extractSubdomain(host)
  const isSpoke = isSpokeDomain(host)

  // Block search indexing entirely on dashboard domains
  if (isDashboardDomain(host)) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  let sitemapUrl = 'https://dayaberkah.id/sitemap.xml'
  if (isSpoke) {
    sitemapUrl = `https://${subdomain}.dayaberkah.id/sitemap.xml`
  }

  const disallowList = ['/dashboard/', '/api/', '/_next/']
  if (!isSpoke) {
    disallowList.push('/login', '/lupa-kata-sandi')
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallowList,
    },
    sitemap: sitemapUrl,
  }
}
