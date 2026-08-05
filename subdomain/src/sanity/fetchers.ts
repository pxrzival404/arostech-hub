/**
 * Sanity Fetcher dengan Fallback — Runtime Multi-Tenant
 *
 * Strategi: Sanity-first, hardcoded-second.
 * - Jika Sanity return data → pakai Sanity
 * - Jika Sanity error / empty → fallback ke hardcoded data (src/data/*.ts)
 *
 * Semua fetcher sekarang menerima subdomain parameter runtime
 * (dari x-subdomain header via getSubdomain()).
 */

import { client, getSubdomain } from "./client";
import {
  allProductsQuery,
  productBySlugQuery,
  highlightProductsQuery,
  relatedProductsQuery,
  allArticlesQuery,
  articleBySlugQuery,
  highlightArticlesQuery,
  allProjectsQuery,
  projectBySlugQuery,
  highlightProjectsQuery,
  companyInfoQuery,
  spokeConfigQuery,
} from "./queries";
import type { Product, Article, Project, CompanyInfo } from "@/types";

import { products as pjuProducts } from "@/data/products";
import { articles as pjuArticles } from "@/data/articles";
import { projects as pjuProjects } from "@/data/projects";
import { companyInfo as pjuCompanyInfo } from "@/data/company";

import { products as bateraiProducts, articles as bateraiArticles, projects as bateraiProjects, companyInfo as bateraiCompanyInfo } from "@/data/baterai-data";
import { products as solarpanelProducts, articles as solarpanelArticles, projects as solarpanelProjects, companyInfo as solarpanelCompanyInfo } from "@/data/solarpanel-data";
import { products as penangkalpetirProducts, articles as penangkalpetirArticles, projects as penangkalpetirProjects, companyInfo as penangkalpetirCompanyInfo } from "@/data/penangkalpetir-data";

import { DEFAULT_SUBDOMAIN, type Subdomain } from "@/lib/subdomain";

// ============================================================================
// HARDCODED DATA MAP (per subdomain)
// ============================================================================

const fallbackData: Record<Subdomain, {
  products: Product[];
  articles: Article[];
  projects: Project[];
  companyInfo: CompanyInfo;
}> = {
  pju: { products: pjuProducts, articles: pjuArticles, projects: pjuProjects, companyInfo: pjuCompanyInfo },
  baterai: { products: bateraiProducts, articles: bateraiArticles, projects: bateraiProjects, companyInfo: bateraiCompanyInfo },
  solarpanel: { products: solarpanelProducts, articles: solarpanelArticles, projects: solarpanelProjects, companyInfo: solarpanelCompanyInfo },
  penangkalpetir: { products: penangkalpetirProducts, articles: penangkalpetirArticles, projects: penangkalpetirProjects, companyInfo: penangkalpetirCompanyInfo },
};

function getFallback(sd: Subdomain) {
  return fallbackData[sd] || fallbackData[DEFAULT_SUBDOMAIN];
}

// ============================================================================
// TYPES (Sanity return shape)
// ============================================================================

interface SanityProduct extends Omit<Product, "images"> {
  images?: { url: string; alt?: string }[];
  imageUrls?: string[];
  specificationFileUrl_fromFile?: string;
  resolvedCategory?: string; // from spoke->subdomain, used as fallback for category
}

interface SanityArticle extends Omit<Article, "coverImage"> {
  coverImage?: string;
}

interface SanityProject extends Omit<Project, "coverImage"> {
  coverImage?: string;
  images?: { url: string; alt?: string }[];
}

export interface SpokeConfig {
  name: string;
  subdomain: string;
  tagline?: string;
  primaryColor?: string;
  heroImage?: string;
  heroImages?: string[];
  seoDefaults?: {
    title?: string;
    description?: string;
  };
}

// ============================================================================
// MAPPERS (Sanity → App Type)
// ============================================================================

function mapProduct(p: SanityProduct): Product {
  const images = p.imageUrls || p.images?.map((img) => img.url) || [];
  // Use resolvedCategory (from spoke->subdomain) if available, fallback to stored category
  const category = p.resolvedCategory || p.category;
  return {
    id: p.id || p.slug,
    name: p.name,
    slug: p.slug,
    category,
    subcategory: p.subcategory,
    description: p.description,
    specifications: p.specifications || [],
    images: images.length > 0 ? images : [`/images/products/${p.slug}.jpg`],
    highlights: p.highlights || [],
    isHighlight: p.isHighlight ?? false,
    tags: p.tags || [],
    specificationMethod: p.specificationMethod || "from-specs",
    specificationManualContent: p.specificationManualContent,
    specificationFileUrl: p.specificationFileUrl || p.specificationFileUrl_fromFile,
  };
}

function mapArticle(a: SanityArticle): Article {
  return {
    id: a.id || a.slug,
    title: a.title,
    slug: a.slug,
    category: a.category,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage || `/images/articles/${a.slug}.jpg`,
    tags: a.tags || [],
    readingTime: a.readingTime || 5,
    isHighlight: a.isHighlight ?? false,
    publishedAt: a.publishedAt || new Date().toISOString().split("T")[0],
    author: a.author || "Tim Arostech",
  };
}

function mapProject(p: SanityProject): Project {
  return {
    id: p.id || p.slug,
    title: p.title,
    slug: p.slug,
    category: p.category,
    client: p.client,
    location: p.location,
    year: p.year,
    description: p.description,
    scope: p.scope || [],
    results: p.results || [],
    productCategory: p.productCategory || "",
    projectScale: (p.projectScale as Project["projectScale"]) || "Menengah",
    duration: p.duration || "",
    coverImage: p.coverImage || `/images/projects/${p.slug}.jpg`,
    isHighlight: p.isHighlight ?? false,
    tags: p.tags || [],
  };
}

// ============================================================================
// FETCHERS (dengan fallback hardcoded)
// ============================================================================

const REVALIDATE = 60; // 60 detik ISR
const REVALIDATE_DETAIL = 10; // 10 detik untuk detail page (lebih cepat refresh setelah publish)

/**
 * Helper: resolve subdomain parameter.
 * If caller provides one, use it. Otherwise, detect from headers.
 */
async function resolveSubdomain(subdomain?: Subdomain): Promise<Subdomain> {
  return subdomain || await getSubdomain();
}

/** Semua produk (Sanity-first, fallback ke hardcoded) */
export async function getAllProducts(subdomain?: Subdomain): Promise<Product[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProduct[]>(allProductsQuery, { subdomain: sd }, {
      next: { revalidate: REVALIDATE },
    });
    if (result && result.length > 0) {
      return result.map(mapProduct);
    }
    console.warn("[sanity:products] Empty from Sanity, fallback to hardcoded");
    return getFallback(sd).products;
  } catch (error) {
    console.error("[sanity:products] Fetch failed, fallback to hardcoded:", error);
    return getFallback(sd).products;
  }
}

/** Produk by slug (Sanity-first, fallback ke hardcoded) */
export async function getProductBySlug(slug: string, subdomain?: Subdomain): Promise<Product | null> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProduct>(
      productBySlugQuery,
      { slug, subdomain: sd },
      { next: { revalidate: REVALIDATE_DETAIL } }
    );
    if (result) {
      return mapProduct(result);
    }
    return getFallback(sd).products.find((p) => p.slug === slug) || null;
  } catch (error) {
    console.error(`[sanity:product] Fetch failed for slug "${slug}":`, error);
    return getFallback(sd).products.find((p) => p.slug === slug) || null;
  }
}

/** Produk highlight untuk homepage */
export async function getHighlightProducts(subdomain?: Subdomain): Promise<Product[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProduct[]>(
      highlightProductsQuery,
      { subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result && result.length > 0) {
      return result.map(mapProduct);
    }
    return getFallback(sd).products.filter((p) => p.isHighlight);
  } catch (error) {
    console.error("[sanity:highlight-products] Fetch failed:", error);
    return getFallback(sd).products.filter((p) => p.isHighlight);
  }
}

/** Produk terkait by tags */
export async function getRelatedProducts(slug: string, tags: string[], subdomain?: Subdomain): Promise<Product[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProduct[]>(
      relatedProductsQuery,
      { slug, tags, subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result && result.length > 0) {
      return result.map(mapProduct);
    }
    return getFallback(sd).products
      .filter((p) => p.slug !== slug && p.tags.some((t) => tags.includes(t)))
      .slice(0, 3);
  } catch (error) {
    console.error("[sanity:related-products] Fetch failed:", error);
    return getFallback(sd).products
      .filter((p) => p.slug !== slug && p.tags.some((t) => tags.includes(t)))
      .slice(0, 3);
  }
}

/** Semua artikel */
export async function getAllArticles(subdomain?: Subdomain): Promise<Article[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityArticle[]>(allArticlesQuery, { subdomain: sd }, {
      next: { revalidate: REVALIDATE },
    });
    if (result && result.length > 0) {
      return result.map(mapArticle);
    }
    return getFallback(sd).articles;
  } catch (error) {
    console.error("[sanity:articles] Fetch failed:", error);
    return getFallback(sd).articles;
  }
}

/** Artikel by slug */
export async function getArticleBySlug(slug: string, subdomain?: Subdomain): Promise<Article | null> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityArticle>(
      articleBySlugQuery,
      { slug, subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result) {
      return mapArticle(result);
    }
    return getFallback(sd).articles.find((a) => a.slug === slug) || null;
  } catch (error) {
    console.error(`[sanity:article] Fetch failed for slug "${slug}":`, error);
    return getFallback(sd).articles.find((a) => a.slug === slug) || null;
  }
}

/** Artikel highlight */
export async function getHighlightArticles(subdomain?: Subdomain): Promise<Article[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityArticle[]>(
      highlightArticlesQuery,
      { subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result && result.length > 0) {
      return result.map(mapArticle);
    }
    return getFallback(sd).articles.filter((a) => a.isHighlight);
  } catch (error) {
    console.error("[sanity:highlight-articles] Fetch failed:", error);
    return getFallback(sd).articles.filter((a) => a.isHighlight);
  }
}

/** Semua project */
export async function getAllProjects(subdomain?: Subdomain): Promise<Project[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProject[]>(allProjectsQuery, { subdomain: sd }, {
      next: { revalidate: REVALIDATE },
    });
    if (result && result.length > 0) {
      return result.map(mapProject);
    }
    return getFallback(sd).projects;
  } catch (error) {
    console.error("[sanity:projects] Fetch failed:", error);
    return getFallback(sd).projects;
  }
}

/** Project by slug */
export async function getProjectBySlug(slug: string, subdomain?: Subdomain): Promise<Project | null> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProject>(
      projectBySlugQuery,
      { slug, subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result) {
      return mapProject(result);
    }
    return getFallback(sd).projects.find((p) => p.slug === slug) || null;
  } catch (error) {
    console.error(`[sanity:project] Fetch failed for slug "${slug}":`, error);
    return getFallback(sd).projects.find((p) => p.slug === slug) || null;
  }
}

/** Project highlight */
export async function getHighlightProjects(subdomain?: Subdomain): Promise<Project[]> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SanityProject[]>(
      highlightProjectsQuery,
      { subdomain: sd },
      { next: { revalidate: REVALIDATE } }
    );
    if (result && result.length > 0) {
      return result.map(mapProject);
    }
    return getFallback(sd).projects.filter((p) => p.isHighlight);
  } catch (error) {
    console.error("[sanity:highlight-projects] Fetch failed:", error);
    return getFallback(sd).projects.filter((p) => p.isHighlight);
  }
}

/** Company info */
export async function getCompanyInfo(subdomain?: Subdomain): Promise<CompanyInfo> {
  const sd = await resolveSubdomain(subdomain);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await client.fetch<any>(companyInfoQuery, { subdomain: sd }, {
      next: { revalidate: REVALIDATE },
    });
    if (result) {
      const { projectsCompleted, yearsExperience, citiesCovered, ...rest } = result;
      return {
        ...rest,
        stats: {
          projectsCompleted: projectsCompleted ?? getFallback(sd).companyInfo.stats?.projectsCompleted ?? 500,
          yearsExperience: yearsExperience ?? getFallback(sd).companyInfo.stats?.yearsExperience ?? 15,
          citiesCovered: citiesCovered ?? getFallback(sd).companyInfo.stats?.citiesCovered ?? 30,
        },
      };
    }
    return getFallback(sd).companyInfo;
  } catch (error) {
    console.error("[sanity:company] Fetch failed:", error);
    return getFallback(sd).companyInfo;
  }
}

/** Spoke config */
export async function getSpokeConfig(subdomain?: Subdomain): Promise<SpokeConfig | null> {
  const sd = await resolveSubdomain(subdomain);
  try {
    const result = await client.fetch<SpokeConfig>(spokeConfigQuery, { subdomain: sd }, {
      next: { revalidate: REVALIDATE },
    });
    return result || null;
  } catch (error) {
    console.error("[sanity:spokeConfig] Fetch failed:", error);
    return null;
  }
}
