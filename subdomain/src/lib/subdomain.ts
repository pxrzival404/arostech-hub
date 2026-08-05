/**
 * Subdomain Detection Utility
 *
 * Menentukan subdomain aktif berdasarkan request host header.
 * Dipakai di:
 * - middleware.ts → set x-subdomain header
 * - Server Components → baca dari headers()
 * - API routes → baca dari request headers
 *
 * Supported subdomains:
 * - pju → pju.dayaberkah.id
 * - baterai → baterai.dayaberkah.id
 * - solarpanel → solarpanel.dayaberkah.id
 * - penangkalpetir → penangkalpetir.dayaberkah.id
 */

export const SUPPORTED_SUBDOMAINS = ["pju", "baterai", "solarpanel", "penangkalpetir"] as const;
export type Subdomain = (typeof SUPPORTED_SUBDOMAINS)[number];

export const DEFAULT_SUBDOMAIN: Subdomain = "pju";

/** Mapping subdomain → display label */
export const SUBDOMAIN_LABELS: Record<Subdomain, string> = {
  pju: "PJU",
  baterai: "Baterai",
  solarpanel: "Solar Panel",
  penangkalpetir: "Penangkal Petir",
};

/** Mapping subdomain → full brand name */
export const SUBDOMAIN_BRAND_NAMES: Record<Subdomain, string> = {
  pju: "Arostech PJU",
  baterai: "Arostech Baterai",
  solarpanel: "Arostech Solar Panel",
  penangkalpetir: "Arostech Penangkal Petir",
};

/** Mapping subdomain → tagline */
export const SUBDOMAIN_TAGLINES: Record<Subdomain, string> = {
  pju: "Solusi Penerangan Jalan Umum Terpercaya",
  baterai: "Solusi Baterai & Penyimpanan Energi Terpercaya",
  solarpanel: "Solusi Panel Surya & Energi Terbarukan Terpercaya",
  penangkalpetir: "Solusi Penangkal Petir & Proteksi Kilat Terpercaya",
};

/** Mapping subdomain → domain */
export const SUBDOMAIN_DOMAINS: Record<Subdomain, string> = {
  pju: "pju.dayaberkah.id",
  baterai: "baterai.dayaberkah.id",
  solarpanel: "solarpanel.dayaberkah.id",
  penangkalpetir: "penangkalpetir.dayaberkah.id",
};

/**
 * Extract subdomain dari host header.
 *
 * Contoh:
 * - "pju.dayaberkah.id" → "pju"
 * - "baterai.dayaberkah.id" → "baterai"
 * - "localhost:3000" → fallback ke default
 * - "47.57.242.119:81" → fallback ke default
 * - "preview-chat-xxx.space-z.ai" → fallback ke default
 */
export function extractSubdomain(host: string): Subdomain {
  // Remove port if present
  const hostname = host.split(":")[0].toLowerCase();

  // Check if it's a known subdomain pattern: xxx.dayaberkah.id
  if (hostname.endsWith(".dayaberkah.id")) {
    const sub = hostname.replace(".dayaberkah.id", "");
    if (isSupportedSubdomain(sub)) {
      return sub as Subdomain;
    }
  }

  // Check x-subdomain-style: sub-pju, sub-baterai, etc (for preview/testing)
  // Also support subdomain passed as prefix: pju.localhost, baterai.localhost
  if (hostname.includes(".")) {
    const parts = hostname.split(".");
    const first = parts[0];
    if (isSupportedSubdomain(first)) {
      return first as Subdomain;
    }
  }

  // Fallback: default subdomain
  return DEFAULT_SUBDOMAIN;
}

/**
 * Check if the host can resolve a specific subdomain (production pattern).
 * Returns true for hosts like xxx.dayaberkah.id or pju.localhost
 * Returns false for hosts like localhost, IP addresses, preview domains
 */
export function isHostResolvable(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();

  // Production: xxx.dayaberkah.id
  if (hostname.endsWith(".dayaberkah.id")) {
    const sub = hostname.replace(".dayaberkah.id", "");
    return isSupportedSubdomain(sub);
  }

  // Development: pju.localhost, baterai.localhost
  if (hostname.includes(".")) {
    const first = hostname.split(".")[0];
    return isSupportedSubdomain(first);
  }

  // localhost, IP addresses, preview domains — NOT resolvable
  return false;
}

function isSupportedSubdomain(value: string): boolean {
  return SUPPORTED_SUBDOMAINS.includes(value as Subdomain);
}

/**
 * Type guard: check if string is a valid Subdomain
 */
export function isValidSubdomain(value: string): value is Subdomain {
  return SUPPORTED_SUBDOMAINS.includes(value as Subdomain);
}

/**
 * Per-spoke hero images (different per subdomain category)
 */
export const SUBDOMAIN_HERO_IMAGES: Record<Subdomain, string[]> = {
  pju: [
    "/images/hero-1.webp",
    "/images/hero-2.webp",
    "/images/hero-3.webp",
    "/images/hero-4.webp",
  ],
  baterai: [
    "/images/hero-baterai-1.webp",
    "/images/hero-baterai-2.webp",
    "/images/hero-baterai-3.webp",
    "/images/hero-baterai-4.webp",
  ],
  solarpanel: [
    "/images/hero-solar-1.webp",
    "/images/hero-solar-2.webp",
    "/images/hero-solar-3.webp",
    "/images/hero-solar-4.webp",
  ],
  penangkalpetir: [
    "/images/hero-petir-1.webp",
    "/images/hero-petir-2.webp",
    "/images/hero-petir-3.webp",
    "/images/hero-petir-4.webp",
  ],
};

/**
 * Per-spoke hero content configuration
 */
export const SUBDOMAIN_HERO_CONFIG: Record<Subdomain, {
  badge: string;
  title: string;
  description: string;
  sectionHeading: string;
  sectionDescription: string;
  articleHeading: string;
  articleDescription: string;
  aboutHeading: string;
}> = {
  pju: {
    badge: "Solusi PJU Terpercaya #1 di Indonesia",
    title: "Solusi Penerangan\nJalan Umum Terpercaya",
    description: "Menyediakan produk PJU LED, PJU Tenaga Surya, dan Smart PJU berkualitas tinggi bersertifikasi SNI dan TKDN untuk kebutuhan penerangan jalan di seluruh Indonesia.",
    sectionHeading: "Produk PJU Terbaik Kami",
    sectionDescription: "Solusi penerangan jalan umum dengan teknologi terkini dan kualitas terjamin",
    articleHeading: "Informasi & Insight PJU",
    articleDescription: "Artikel terbaru seputar teknologi, regulasi, dan tren penerangan jalan umum",
    aboutHeading: "Penyedia Solusi PJU Terdepan di Indonesia",
  },
  baterai: {
    badge: "Solusi Baterai & Energi Terpercaya #1",
    title: "Solusi Baterai &\nPenyimpanan Energi",
    description: "Menyediakan baterai 12V, UPS, dan Battery Charger berkualitas tinggi untuk kebutuhan industri, komersial, dan rumah tangga di seluruh Indonesia.",
    sectionHeading: "Produk Baterai Terbaik Kami",
    sectionDescription: "Solusi penyimpanan energi dengan teknologi terkini dan kualitas terjamin",
    articleHeading: "Informasi & Insight Baterai",
    articleDescription: "Artikel terbaru seputar teknologi baterai, perawatan, dan tren penyimpanan energi",
    aboutHeading: "Penyedia Solusi Baterai Terdepan di Indonesia",
  },
  solarpanel: {
    badge: "Solusi Energi Surya Terpercaya #1",
    title: "Solusi Panel Surya &\nEnergi Terbarukan",
    description: "Menyediakan solar panel 5WP hingga 550WP berkualitas tinggi bersertifikasi IEC untuk kebutuhan pembangkit listrik tenaga surya di seluruh Indonesia.",
    sectionHeading: "Produk Solar Panel Terbaik Kami",
    sectionDescription: "Solusi energi terbarukan dengan teknologi terkini dan efisiensi tinggi",
    articleHeading: "Informasi & Insight Solar Panel",
    articleDescription: "Artikel terbaru seputar teknologi fotovoltaik, instalasi, dan tren energi surya",
    aboutHeading: "Penyedia Solusi Solar Panel Terdepan di Indonesia",
  },
  penangkalpetir: {
    badge: "Solusi Proteksi Petir Terpercaya #1",
    title: "Solusi Penangkal Petir &\nProteksi Kilat",
    description: "Menyediakan penangkal petir Kurn, Viking, Erico, LPI Guardian, Thomas, dan EF berkualitas tinggi bersertifikasi NFC 17-102 untuk kebutuhan proteksi kilat di seluruh Indonesia.",
    sectionHeading: "Produk Penangkal Petir Terbaik Kami",
    sectionDescription: "Solusi proteksi kilat dengan teknologi ESE terkini dan kualitas terjamin",
    articleHeading: "Informasi & Insight Penangkal Petir",
    articleDescription: "Artikel terbaru seputar teknologi proteksi petir, regulasi, dan standar keselamatan",
    aboutHeading: "Penyedia Solusi Penangkal Petir Terdepan di Indonesia",
  },
};

/**
 * Per-spoke page content configuration (for Products, Portfolio, Articles pages)
 */
export const SUBDOMAIN_PAGE_CONFIG: Record<Subdomain, {
  productsBadge: string;
  productsTitle: string;
  productsDescription: string;
  productCategories: { name: string; slug: string }[];
  portfolioBadge: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioCategoryOptions: string[];
  articlesBadge: string;
  articlesTitle: string;
  articlesDescription: string;
}> = {
  pju: {
    productsBadge: "Katalog Produk",
    productsTitle: "Produk PJU",
    productsDescription: "Temukan solusi penerangan jalan umum yang sesuai dengan kebutuhan proyek Anda",
    productCategories: [
      { name: "Semua", slug: "all" },
      { name: "PJU LED", slug: "pju-led" },
      { name: "PJU Tenaga Surya", slug: "pju-tenaga-surya" },
      { name: "Smart PJU", slug: "smart-pju" },
    ],
    portfolioBadge: "Portofolio Proyek",
    portfolioTitle: "Proyek PJU Kami",
    portfolioDescription: "Berbagai proyek penerangan jalan umum yang telah kami selesaikan di seluruh Indonesia",
    portfolioCategoryOptions: ["Semua", "PJU LED", "PJU Tenaga Surya", "Smart PJU"],
    articlesBadge: "Artikel & Insight",
    articlesTitle: "Artikel PJU",
    articlesDescription: "Informasi terkini seputar teknologi, regulasi, dan tren penerangan jalan umum di Indonesia",
  },
  baterai: {
    productsBadge: "Katalog Produk",
    productsTitle: "Produk Baterai",
    productsDescription: "Temukan solusi baterai dan penyimpanan energi yang sesuai dengan kebutuhan proyek Anda",
    productCategories: [
      { name: "Semua", slug: "all" },
      { name: "Baterai 12V", slug: "baterai-12v" },
      { name: "UPS", slug: "ups" },
      { name: "Battery Charger", slug: "battery-charger" },
    ],
    portfolioBadge: "Portofolio Proyek",
    portfolioTitle: "Proyek Baterai Kami",
    portfolioDescription: "Berbagai proyek baterai dan penyimpanan energi yang telah kami selesaikan di seluruh Indonesia",
    portfolioCategoryOptions: ["Semua", "UPS & Baterai", "Baterai Deep Cycle", "Battery Charger"],
    articlesBadge: "Artikel & Insight",
    articlesTitle: "Artikel Baterai",
    articlesDescription: "Informasi terkini seputar teknologi baterai, perawatan, dan tren penyimpanan energi di Indonesia",
  },
  solarpanel: {
    productsBadge: "Katalog Produk",
    productsTitle: "Produk Solar Panel",
    productsDescription: "Temukan solusi panel surya dan energi terbarukan yang sesuai dengan kebutuhan proyek Anda",
    productCategories: [
      { name: "Semua", slug: "all" },
      { name: "Solar Panel Kecil", slug: "solarpanel-kecil" },
      { name: "Solar Panel Besar", slug: "solarpanel-besar" },
      { name: "Solar Charge Controller", slug: "solar-charge-controller" },
    ],
    portfolioBadge: "Portofolio Proyek",
    portfolioTitle: "Proyek Solar Panel Kami",
    portfolioDescription: "Berbagai proyek energi terbarukan yang telah kami selesaikan di seluruh Indonesia",
    portfolioCategoryOptions: ["Semua", "Solar Panel", "PLTS", "Solar Water Heater"],
    articlesBadge: "Artikel & Insight",
    articlesTitle: "Artikel Solar Panel",
    articlesDescription: "Informasi terkini seputar teknologi fotovoltaik, instalasi, dan tren energi surya di Indonesia",
  },
  penangkalpetir: {
    productsBadge: "Katalog Produk",
    productsTitle: "Produk Penangkal Petir",
    productsDescription: "Temukan solusi proteksi petir dan kilat yang sesuai dengan kebutuhan proyek Anda",
    productCategories: [
      { name: "Semua", slug: "all" },
      { name: "Kurn", slug: "kurn" },
      { name: "Viking", slug: "viking" },
      { name: "Erico", slug: "erico" },
      { name: "LPI Guardian", slug: "lpi-guardian" },
      { name: "Thomas", slug: "thomas" },
      { name: "EF", slug: "ef" },
      { name: "Aksesoris", slug: "aksesoris-petir" },
    ],
    portfolioBadge: "Portofolio Proyek",
    portfolioTitle: "Proyek Penangkal Petir Kami",
    portfolioDescription: "Berbagai proyek proteksi petir dan kilat yang telah kami selesaikan di seluruh Indonesia",
    portfolioCategoryOptions: ["Semua", "Penangkal Petir ESE", "Grounding", "Surge Protection"],
    articlesBadge: "Artikel & Insight",
    articlesTitle: "Artikel Penangkal Petir",
    articlesDescription: "Informasi terkini seputar teknologi proteksi petir, regulasi, dan standar keselamatan di Indonesia",
  },
};
