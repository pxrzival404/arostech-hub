/**
 * GROQ Queries — Runtime Multi-Tenant
 *
 * Semua query Sanity pakai GROQ (Graph-Relational Object Queries).
 * Filter otomatis by `spoke->subdomain == $subdomain` untuk multi-tenant isolation.
 *
 * PENTING: $subdomain sekarang parameter runtime (dari headers),
 * BUKAN lagi build-time constant string interpolation.
 *
 * Dokumentasi GROQ: https://www.sanity.io/docs/groq
 */

import { groq } from "next-sanity";

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/** Semua produk untuk sub-domain ini, urut by highlight + nama */
export const allProductsQuery = groq`
  *[_type == "product" && spoke->subdomain == $subdomain] | order(isHighlight desc, name asc) {
    "id": slug.current,
    name,
    "slug": slug.current,
    category,
    "resolvedCategory": spoke->subdomain,
    subcategory,
    description,
    specifications,
    "images": images[]{ "url": asset->url, "alt": alt },
    "imageUrls": images[].asset->url,
    highlights,
    isHighlight,
    tags,
    specificationFileUrl,
  }
`;

/** Produk by slug */
export const productBySlugQuery = groq`
  *[_type == "product" && spoke->subdomain == $subdomain && slug.current == $slug][0] {
    "id": slug.current,
    name,
    "slug": slug.current,
    category,
    "resolvedCategory": spoke->subdomain,
    subcategory,
    description,
    specifications,
    "images": images[]{ "url": asset->url, "alt": alt },
    "imageUrls": images[].asset->url,
    highlights,
    isHighlight,
    tags,
    specificationMethod,
    specificationManualContent,
    specificationFileUrl,
    "specificationFileUrl_fromFile": specificationFile.asset->url,
  }
`;

/** Produk highlight saja (untuk homepage) */
export const highlightProductsQuery = groq`
  *[_type == "product" && spoke->subdomain == $subdomain && isHighlight == true] | order(name asc) {
    "id": slug.current,
    name,
    "slug": slug.current,
    category,
    "resolvedCategory": spoke->subdomain,
    subcategory,
    description,
    "imageUrls": images[].asset->url,
    highlights,
    isHighlight,
    tags,
  }
`;

/** Produk terkait by tags (untuk RelatedProducts) */
export const relatedProductsQuery = groq`
  *[_type == "product" && spoke->subdomain == $subdomain && slug.current != $slug && count(tags[@ in $tags]) > 0]
  | order(count(tags[@ in $tags]) desc, name asc) [0...3] {
    "id": slug.current,
    name,
    "slug": slug.current,
    category,
    "resolvedCategory": spoke->subdomain,
    subcategory,
    description,
    "imageUrls": images[].asset->url,
    highlights,
    isHighlight,
    tags,
  }
`;

// ============================================================================
// ARTICLE QUERIES
// ============================================================================

/** Semua artikel, urut by publishedAt desc */
export const allArticlesQuery = groq`
  *[_type == "article" && spoke->subdomain == $subdomain] | order(publishedAt desc) {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    excerpt,
    content,
    "coverImage": coverImage.asset->url,
    tags,
    "readingTime": round(length(content) / 1000) + 1,
    isHighlight,
    publishedAt,
    author,
  }
`;

/** Artikel by slug */
export const articleBySlugQuery = groq`
  *[_type == "article" && spoke->subdomain == $subdomain && slug.current == $slug][0] {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    excerpt,
    content,
    "coverImage": coverImage.asset->url,
    tags,
    "readingTime": round(length(content) / 1000) + 1,
    isHighlight,
    publishedAt,
    author,
  }
`;

/** Artikel highlight (untuk homepage) */
export const highlightArticlesQuery = groq`
  *[_type == "article" && spoke->subdomain == $subdomain && isHighlight == true] | order(publishedAt desc) [0...3] {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    excerpt,
    "coverImage": coverImage.asset->url,
    tags,
    "readingTime": round(length(content) / 1000) + 1,
    isHighlight,
    publishedAt,
    author,
  }
`;

// ============================================================================
// PROJECT QUERIES
// ============================================================================

/** Semua project, urut by year desc */
export const allProjectsQuery = groq`
  *[_type == "portfolioEntry" && spoke->subdomain == $subdomain] | order(year desc) {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    client,
    location,
    year,
    description,
    scope,
    results,
    productCategory,
    projectScale,
    duration,
    "coverImage": coverImage.asset->url,
    "images": images[]{ "url": asset->url, "alt": alt },
    isHighlight,
    tags,
  }
`;

/** Project by slug */
export const projectBySlugQuery = groq`
  *[_type == "portfolioEntry" && spoke->subdomain == $subdomain && slug.current == $slug][0] {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    client,
    location,
    year,
    description,
    scope,
    results,
    productCategory,
    projectScale,
    duration,
    "coverImage": coverImage.asset->url,
    "images": images[]{ "url": asset->url, "alt": alt },
    isHighlight,
    tags,
  }
`;

/** Project highlight (untuk homepage) */
export const highlightProjectsQuery = groq`
  *[_type == "portfolioEntry" && spoke->subdomain == $subdomain && isHighlight == true] | order(year desc) [0...3] {
    "id": slug.current,
    title,
    "slug": slug.current,
    category,
    client,
    location,
    year,
    description,
    "coverImage": coverImage.asset->url,
    isHighlight,
    tags,
  }
`;

// ============================================================================
// COMPANY INFO QUERY
// ============================================================================

/** Info perusahaan untuk sub-domain ini (singleton by subdomain) */
export const companyInfoQuery = groq`
  *[_type == "companyInfo" && spoke->subdomain == $subdomain][0] {
    category,
    companyName,
    companyDescription,
    vision,
    mission,
    certifications,
    contactEmail,
    contactPhone,
    whatsappNumber,
    address,
    projectsCompleted,
    yearsExperience,
    citiesCovered,
  }
`;

// ============================================================================
// SPOKE CONFIG QUERY
// ============================================================================

/** Spoke config untuk sub-domain ini */
export const spokeConfigQuery = groq`
  *[_type == "spokeConfig" && subdomain == $subdomain][0] {
    name,
    subdomain,
    tagline,
    primaryColor,
    "heroImage": heroImage.asset->url,
    "heroImages": heroImages[].asset->url,
    seoDefaults,
  }
`;
