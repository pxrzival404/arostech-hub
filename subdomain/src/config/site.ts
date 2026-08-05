/**
 * Site Configuration — Multi-Spoke
 *
 * Setiap spoke (subdomain) punya konfigurasi sendiri.
 * Default ke "pju" jika tidak ada yang cocok.
 */

import {
  type Subdomain,
  SUBDOMAIN_BRAND_NAMES,
  SUBDOMAIN_TAGLINES,
  SUBDOMAIN_DOMAINS,
  SUBDOMAIN_LABELS,
  DEFAULT_SUBDOMAIN,
} from "@/lib/subdomain";

/** Build siteConfig for a specific subdomain */
export function getSiteConfig(subdomain: Subdomain = DEFAULT_SUBDOMAIN) {
  return {
    name: SUBDOMAIN_BRAND_NAMES[subdomain],
    description: SUBDOMAIN_TAGLINES[subdomain],
    category: subdomain,
    domain: SUBDOMAIN_DOMAINS[subdomain],
    mainDomain: "dayaberkah.id",
    badgeLabel: SUBDOMAIN_LABELS[subdomain],
  };
}

/** Default site config (for backwards compatibility) */
export const siteConfig = getSiteConfig(DEFAULT_SUBDOMAIN);

export const navigationItems = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/products" },
  { label: "Portofolio", href: "/portfolio" },
  { label: "Artikel", href: "/articles" },
  { label: "Tentang", href: "/about" },
  { label: "Kontak", href: "/contact" },
];

export const utilityNavItems = [
  { label: "Draft RFQ", href: "/draft-rfq", icon: "shopping-cart" },
];

/**
 * Per-spoke footer product links.
 * These are used by Footer component to show category-specific product links.
 */
export const FOOTER_PRODUCT_LINKS: Record<Subdomain, { label: string; href: string }[]> = {
  pju: [
    { label: "PJU LED", href: "/products?category=pju-led" },
    { label: "PJU Tenaga Surya", href: "/products?category=pju-tenaga-surya" },
    { label: "Smart PJU", href: "/products?category=smart-pju" },
  ],
  baterai: [
    { label: "Baterai 12V", href: "/products?category=baterai-12v" },
    { label: "UPS", href: "/products?category=ups" },
    { label: "Battery Charger", href: "/products?category=battery-charger" },
  ],
  solarpanel: [
    { label: "Solar Panel 5WP - 100WP", href: "/products?category=solarpanel-kecil" },
    { label: "Solar Panel 100WP - 550WP", href: "/products?category=solarpanel-besar" },
  ],
  penangkalpetir: [
    { label: "Kurn", href: "/products?category=kurn" },
    { label: "Viking", href: "/products?category=viking" },
    { label: "Erico", href: "/products?category=erico" },
    { label: "LPI Guardian", href: "/products?category=lpi-guardian" },
    { label: "Thomas", href: "/products?category=thomas" },
    { label: "EF", href: "/products?category=ef" },
  ],
};
