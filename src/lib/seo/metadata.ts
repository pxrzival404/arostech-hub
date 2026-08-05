import type { Metadata } from 'next'

const ROOT_DOMAIN = 'dayaberkah.id'
const DEFAULT_OG_IMAGE = `https://${ROOT_DOMAIN}/og-default.png`

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export function createHubHomeMetadata(): Metadata {
  return {
    title: 'DBSN Dayaberkah.id | Solusi Energi Terbarukan',
    description: 'Penyedia solusi energi terbarukan terpercaya di Indonesia, mengkhususkan diri pada PJU Tenaga Surya, panel surya, baterai industri, dan sistem alat penangkal petir.',
    alternates: {
      canonical: `https://${ROOT_DOMAIN}`,
    },
    openGraph: {
      type: 'website',
      url: `https://${ROOT_DOMAIN}`,
      title: 'DBSN Dayaberkah.id | Solusi Energi Terbarukan',
      description: 'Penyedia solusi energi terbarukan terpercaya di Indonesia.',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'DBSN Dayaberkah.id',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'DBSN Dayaberkah.id | Solusi Energi Terbarukan',
      description: 'Penyedia solusi energi terbarukan terpercaya di Indonesia.',
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

const PAGE_TITLE_MAP: Record<string, string> = {
  about: 'Tentang Kami',
  contact: 'Hubungi Kami',
  certifications: 'Sertifikasi',
  portfolio: 'Portofolio',
  products: 'Produk',
  articles: 'Artikel',
  faq: 'FAQ',
}

export function createHubPageMetadata(
  page: 'about' | 'contact' | 'certifications' | 'portfolio' | 'products' | 'articles' | 'faq'
): Metadata {
  const pageTitle = PAGE_TITLE_MAP[page]
  if (!pageTitle) {
    throw new Error(`Invalid page name: ${page}`)
  }

  const title = `${pageTitle} | DBSN Dayaberkah.id`
  const url = `https://${ROOT_DOMAIN}/${page}`

  return {
    title,
    description: `Halaman ${pageTitle} resmi dari DBSN Dayaberkah.id. Pelajari lebih lanjut tentang layanan dan solusi kami.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description: `Halaman ${pageTitle} resmi dari DBSN Dayaberkah.id.`,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description: `Halaman ${pageTitle} resmi dari DBSN Dayaberkah.id.`,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export function createSpokeHomeMetadata(
  spoke: string,
  config: { name: string; tagline?: string }
): Metadata {
  const title = `${config.name} | DBSN Dayaberkah.id`
  const description = config.tagline || `Halaman resmi produk ${config.name} dari DBSN Dayaberkah.id.`
  const url = `https://${spoke}.${ROOT_DOMAIN}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

interface SpokeProduct {
  title: string
  shortDescription?: string
  slug?: string | { current: string }
  seoMeta?: {
    title?: string
    description?: string
  }
}

export function createSpokeProductMetadata(
  spoke: string,
  product: SpokeProduct
): Metadata {
  const customTitle = product.seoMeta?.title
  const customDescription = product.seoMeta?.description

  const title = customTitle || `${product.title} | DBSN Dayaberkah.id`
  const description = customDescription || product.shortDescription || `Pelajari detail produk ${product.title} dari DBSN Dayaberkah.id.`

  let productSlug = ''
  if (product.slug) {
    productSlug = typeof product.slug === 'string' ? product.slug : product.slug.current
  } else {
    productSlug = slugify(product.title)
  }

  const url = `https://${spoke}.${ROOT_DOMAIN}/products/${productSlug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}
