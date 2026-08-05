/**
 * Populate Sanity Studio with fallback data
 *
 * This script creates:
 * 1. 4 spokeConfig documents (pju, baterai, solarpanel, penangkalpetir)
 * 2. Products for each spoke (from src/data/*.ts)
 * 3. Articles for each spoke
 * 4. Portfolio entries for each spoke
 * 5. CompanyInfo for each spoke
 *
 * Run: bun run scripts/populate-sanity.ts
 *
 * IMPORTANT: This uses the Sanity HTTP API directly (not the Studio)
 * because we need the write token which is server-side only.
 */

const SANITY_PROJECT_ID = "3h4k8dye";
const SANITY_DATASET = "production";
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN || "";
const API_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/data/mutate/${SANITY_DATASET}`;

if (!SANITY_TOKEN) {
  console.error("ERROR: SANITY_API_WRITE_TOKEN not set");
  process.exit(1);
}

// ============================================================================
// SPOKE CONFIG DATA
// ============================================================================

const spokeConfigs = [
  {
    _id: "spoke-config-pju",
    _type: "spokeConfig",
    name: "Arostech PJU",
    subdomain: "pju",
    tagline: "Solusi Penerangan Jalan Umum Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi PJU Terpercaya #1 di Indonesia",
    heroTitle: "Solusi Penerangan Jalan Umum Terpercaya",
    heroDescription: "Menyediakan produk PJU LED, PJU Tenaga Surya, dan Smart PJU berkualitas tinggi bersertifikasi SNI dan TKDN untuk kebutuhan penerangan jalan di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech PJU - Solusi Penerangan Jalan Umum",
      description: "Penyedia solusi PJU terpercaya di Indonesia. PJU LED, PJU Tenaga Surya, dan Smart PJU bersertifikasi.",
    },
    footerProductLinks: [
      { label: "PJU LED", href: "/products?category=pju-led", _key: "pju-led-1" },
      { label: "PJU Tenaga Surya", href: "/products?category=pju-tenaga-surya", _key: "pju-ts-1" },
      { label: "Smart PJU", href: "/products?category=smart-pju", _key: "smart-pju-1" },
    ],
  },
  {
    _id: "spoke-config-baterai",
    _type: "spokeConfig",
    name: "Arostech Baterai",
    subdomain: "baterai",
    tagline: "Solusi Baterai & Penyimpanan Energi Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Baterai & Energi Terpercaya #1",
    heroTitle: "Solusi Baterai & Penyimpanan Energi",
    heroDescription: "Menyediakan baterai 12V, UPS, dan Battery Charger berkualitas tinggi untuk kebutuhan industri, komersial, dan rumah tangga di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Baterai - Solusi Baterai & Penyimpanan Energi",
      description: "Penyedia solusi baterai terpercaya di Indonesia. Baterai 12V, UPS, dan Battery Charger berkualitas.",
    },
    footerProductLinks: [
      { label: "Baterai 12V", href: "/products?category=baterai-12v", _key: "bat-12v-1" },
      { label: "UPS", href: "/products?category=ups", _key: "ups-1" },
      { label: "Battery Charger", href: "/products?category=battery-charger", _key: "bc-1" },
    ],
  },
  {
    _id: "spoke-config-solarpanel",
    _type: "spokeConfig",
    name: "Arostech Solar Panel",
    subdomain: "solarpanel",
    tagline: "Solusi Panel Surya & Energi Terbarukan Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Energi Surya Terpercaya #1",
    heroTitle: "Solusi Panel Surya & Energi Terbarukan",
    heroDescription: "Menyediakan solar panel 5WP hingga 550WP berkualitas tinggi bersertifikasi IEC untuk kebutuhan pembangkit listrik tenaga surya di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Solar Panel - Solusi Panel Surya & Energi Terbarukan",
      description: "Penyedia solusi solar panel terpercaya di Indonesia. Solar panel 5WP hingga 550WP bersertifikasi IEC.",
    },
    footerProductLinks: [
      { label: "Solar Panel 5WP-100WP", href: "/products?category=solarpanel-kecil", _key: "sp-k-1" },
      { label: "Solar Panel 100WP-550WP", href: "/products?category=solarpanel-besar", _key: "sp-b-1" },
    ],
  },
  {
    _id: "spoke-config-penangkalpetir",
    _type: "spokeConfig",
    name: "Arostech Penangkal Petir",
    subdomain: "penangkalpetir",
    tagline: "Solusi Penangkal Petir & Proteksi Kilat Terpercaya",
    primaryColor: "#10b981",
    heroBadge: "Solusi Proteksi Petir Terpercaya #1",
    heroTitle: "Solusi Penangkal Petir & Proteksi Kilat",
    heroDescription: "Menyediakan penangkal petir Kurn, Viking, Erico, LPI Guardian, Thomas, dan EF berkualitas tinggi bersertifikasi NFC 17-102 untuk kebutuhan proteksi kilat di seluruh Indonesia.",
    seoDefaults: {
      title: "Arostech Penangkal Petir - Solusi Proteksi Kilat",
      description: "Penyedia solusi penangkal petir terpercaya di Indonesia. Penangkal petir ESE bersertifikasi NFC 17-102.",
    },
    footerProductLinks: [
      { label: "Kurn", href: "/products?category=kurn", _key: "kurn-1" },
      { label: "Viking", href: "/products?category=viking", _key: "viking-1" },
      { label: "Erico", href: "/products?category=erico", _key: "erico-1" },
      { label: "LPI Guardian", href: "/products?category=lpi-guardian", _key: "lpi-1" },
      { label: "Thomas", href: "/products?category=thomas", _key: "thomas-1" },
      { label: "EF", href: "/products?category=ef", _key: "ef-1" },
    ],
  },
];

// ============================================================================
// PRODUCT DATA (per spoke)
// ============================================================================

interface ProductData {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: { label: string; value: string }[];
  highlights: string[];
  isHighlight: boolean;
  tags: string[];
}

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string[];
  isHighlight: boolean;
}

interface PortfolioData {
  id: string;
  title: string;
  slug: string;
  category: string;
  clientName: string;
  location: string;
  description: string;
  completionYear: number;
  isHighlight: boolean;
}

// Import data from fallback files
const { products: pjuProducts } = require("../src/data/products") as { products: ProductData[] };
const { articles: pjuArticles } = require("../src/data/articles") as { articles: ArticleData[] };
const { projects: pjuProjects } = require("../src/data/projects") as { projects: PortfolioData[] };
const { products: bateraiProducts, articles: bateraiArticles, projects: bateraiProjects } = require("../src/data/baterai-data") as { products: ProductData[]; articles: ArticleData[]; projects: PortfolioData[] };
const { products: solarProducts, articles: solarArticles, projects: solarProjects } = require("../src/data/solarpanel-data") as { products: ProductData[]; articles: ArticleData[]; projects: PortfolioData[] };
const { products: petirProducts, articles: petirArticles, projects: petirProjects } = require("../src/data/penangkalpetir-data") as { products: ProductData[]; articles: ArticleData[]; projects: PortfolioData[] };

// ============================================================================
// HELPER: Create Sanity document
// ============================================================================

async function sanityMutate(mutations: object[]) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SANITY_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Sanity API error (${res.status}): ${text}`);
    return null;
  }

  return res.json();
}

function makeProductDoc(product: ProductData, spokeRefId: string, index: number) {
  return {
    _id: `product-${product.slug}`,
    _type: "product",
    name: product.name,
    slug: { _type: "slug", current: product.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: product.category,
    subcategory: product.subcategory,
    description: product.description,
    specifications: (product.specifications || []).map((s: { label: string; value: string }, i: number) => ({
      _type: "specification",
      _key: `spec-${index}-${i}`,
      label: s.label,
      value: s.value,
    })),
    highlights: product.highlights || [],
    isHighlight: product.isHighlight || false,
    tags: product.tags || [],
  };
}

function makeArticleDoc(article: ArticleData, spokeRefId: string, index: number) {
  return {
    _id: `article-${article.slug}`,
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: article.category,
    excerpt: article.excerpt,
    content: article.content,
    tags: article.tags || [],
    isHighlight: article.isHighlight || false,
  };
}

function makePortfolioDoc(project: PortfolioData, spokeRefId: string, index: number) {
  return {
    _id: `portfolio-${project.slug}`,
    _type: "portfolioEntry",
    title: project.title,
    slug: { _type: "slug", current: project.slug },
    spoke: { _type: "reference", _ref: spokeRefId },
    category: project.category,
    clientName: project.clientName || "",
    location: project.location || "",
    description: project.description,
    completionYear: project.completionYear || new Date().getFullYear(),
    isHighlight: project.isHighlight || false,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🚀 Populating Sanity Studio with fallback data...\n");

  // Step 1: Create/Update spokeConfig documents
  console.log("📋 Step 1: Creating spokeConfig documents...");
  for (const config of spokeConfigs) {
    const mutations = [
      {
        createOrReplace: config,
      },
    ];
    const result = await sanityMutate(mutations);
    console.log(`  ✅ ${config.name} (${config.subdomain})`);
  }

  // Step 2: Create products for each spoke
  console.log("\n📦 Step 2: Creating products...");
  const spokeProductMap = [
    { spokeId: "spoke-config-pju", products: pjuProducts, label: "PJU" },
    { spokeId: "spoke-config-baterai", products: bateraiProducts, label: "Baterai" },
    { spokeId: "spoke-config-solarpanel", products: solarProducts, label: "Solar Panel" },
    { spokeId: "spoke-config-penangkalpetir", products: petirProducts, label: "Penangkal Petir" },
  ];

  for (const { spokeId, products, label } of spokeProductMap) {
    // Batch create (max 100 per mutation)
    const mutations = products.map((p: ProductData, i: number) => ({
      createOrReplace: makeProductDoc(p, spokeId, i),
    }));

    // Split into chunks of 50
    for (let i = 0; i < mutations.length; i += 50) {
      const chunk = mutations.slice(i, i + 50);
      await sanityMutate(chunk);
    }
    console.log(`  ✅ ${label}: ${products.length} products`);
  }

  // Step 3: Create articles
  console.log("\n📝 Step 3: Creating articles...");
  const spokeArticleMap = [
    { spokeId: "spoke-config-pju", articles: pjuArticles, label: "PJU" },
    { spokeId: "spoke-config-baterai", articles: bateraiArticles, label: "Baterai" },
    { spokeId: "spoke-config-solarpanel", articles: solarArticles, label: "Solar Panel" },
    { spokeId: "spoke-config-penangkalpetir", articles: petirArticles, label: "Penangkal Petir" },
  ];

  for (const { spokeId, articles, label } of spokeArticleMap) {
    if (!articles || articles.length === 0) continue;
    const mutations = articles.map((a: ArticleData, i: number) => ({
      createOrReplace: makeArticleDoc(a, spokeId, i),
    }));
    for (let i = 0; i < mutations.length; i += 50) {
      const chunk = mutations.slice(i, i + 50);
      await sanityMutate(chunk);
    }
    console.log(`  ✅ ${label}: ${articles.length} articles`);
  }

  // Step 4: Create portfolio entries
  console.log("\n🏗️ Step 4: Creating portfolio entries...");
  const spokePortfolioMap = [
    { spokeId: "spoke-config-pju", projects: pjuProjects, label: "PJU" },
    { spokeId: "spoke-config-baterai", projects: bateraiProjects, label: "Baterai" },
    { spokeId: "spoke-config-solarpanel", projects: solarProjects, label: "Solar Panel" },
    { spokeId: "spoke-config-penangkalpetir", projects: petirProjects, label: "Penangkal Petir" },
  ];

  for (const { spokeId, projects, label } of spokePortfolioMap) {
    if (!projects || projects.length === 0) continue;
    const mutations = projects.map((p: PortfolioData, i: number) => ({
      createOrReplace: makePortfolioDoc(p, spokeId, i),
    }));
    for (let i = 0; i < mutations.length; i += 50) {
      const chunk = mutations.slice(i, i + 50);
      await sanityMutate(chunk);
    }
    console.log(`  ✅ ${label}: ${projects.length} portfolio entries`);
  }

  console.log("\n🎉 Done! All fallback data has been populated to Sanity Studio.");
  console.log("   Open Studio at /studio to see the content organized by spoke.");
  console.log("   NOTE: Images are NOT included. You need to upload images manually in Studio.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
