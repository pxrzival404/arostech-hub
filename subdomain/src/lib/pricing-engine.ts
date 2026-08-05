/**
 * RFQ Pricing Engine
 *
 * Menghitung estimasi harga untuk RFQ berdasarkan:
 * - Kategori produk (PJU LED, PJU Tenaga Surya, Smart PJU)
 * - Kuantitas (bulk discount / tiered pricing)
 * - Faktor instalasi (opsional)
 * - Ongkos kirim berdasarkan kota (dari ShippingCost table)
 *
 * Dua mode:
 * 1. calculateRFQPricing (sync, DEPRECATED) — hardcoded harga, untuk backward compat
 * 2. calculateRFQPricingFromDB (async) — baca dari ProductPricing + PricingTier + ShippingCost tables
 */

import { db } from "@/lib/db";

// ============================================================================
// INTERFACES (backward compat)
// ============================================================================

export interface ProductPriceTier {
  subcategory: string;
  unitPrice: number; // harga per unit (Rp)
  currency: string;
}

export interface BulkDiscountTier {
  minQuantity: number;
  discountPercent: number; // 0-100
}

export interface PricingBreakdown {
  items: Array<{
    productId: string;
    productName: string;
    subcategory: string;
    quantity: number;
    unitPrice: number;
    baseSubtotal: number;
    discountPercent: number;
    discountedSubtotal: number;
  }>;
  baseTotal: number;
  totalDiscount: number;
  installationFee: number;
  grandTotal: number;
  currency: string;
  estimatedDeliveryDays: number;
  notes: string[];
}

/**
 * Extended breakdown yang menyertakan info shipping & overall discount.
 * Digunakan oleh calculateRFQPricingFromDB.
 */
export interface DBPricingBreakdown extends PricingBreakdown {
  shippingCost: number;
  shippingCostFormatted: string;
  shippingCity: string;
  freeShippingApplied: boolean;
  shippingSource: "database" | "estimation"; // indicates where shipping cost came from
  overallDiscount: number; // percent
  overallDiscountAmount: number;
  netBeforeShipping: number;
}

export interface PricingItem {
  productId: string;
  productName: string;
  subcategory: string;
  quantity: number;
}

// ============================================================================
// HARDCODED DATA (DEPRECATED — kept for backward compat)
// ============================================================================

/** @deprecated Use ProductPricing table instead */
export const productPriceTiers: ProductPriceTier[] = [
  { subcategory: "PJU LED", unitPrice: 1500000, currency: "IDR" },
  { subcategory: "PJU Tenaga Surya", unitPrice: 4500000, currency: "IDR" },
  { subcategory: "Smart PJU", unitPrice: 3500000, currency: "IDR" },
];

/** @deprecated Use PricingTier table instead */
export const bulkDiscountTiers: BulkDiscountTier[] = [
  { minQuantity: 1, discountPercent: 0 },
  { minQuantity: 10, discountPercent: 5 },
  { minQuantity: 50, discountPercent: 10 },
  { minQuantity: 100, discountPercent: 15 },
  { minQuantity: 500, discountPercent: 20 },
];

/** @deprecated Use ProductPricing.installationFee instead */
export const installationFeePerUnit = 250000; // IDR

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** @deprecated Use DB lookup instead */
export function getUnitPrice(subcategory: string): number {
  const tier = productPriceTiers.find((t) => t.subcategory === subcategory);
  return tier?.unitPrice || 0;
}

/** @deprecated Use DB lookup instead */
export function getBulkDiscount(quantity: number): number {
  let discount = 0;
  for (const tier of bulkDiscountTiers) {
    if (quantity >= tier.minQuantity) {
      discount = tier.discountPercent;
    }
  }
  return discount;
}

/**
 * Estimasi waktu pengiriman berdasarkan total kuantitas
 */
export function estimateDeliveryDays(totalQuantity: number): number {
  if (totalQuantity <= 10) return 7;
  if (totalQuantity <= 50) return 14;
  if (totalQuantity <= 100) return 21;
  if (totalQuantity <= 500) return 30;
  return 45;
}

/**
 * Format harga ke format Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ============================================================================
// DB-BACKED PRICING LOOKUP
// ============================================================================

/**
 * Look up pricing for a single item from the ProductPricing table.
 * Priority: product-level (scope=PRODUCT) > category-level (scope=CATEGORY)
 *
 * Returns the pricing record with tiers included, or null if not found.
 */
async function lookupPricing(
  productSlug: string,
  subcategory: string
): Promise<{
  pricingType: "FIXED" | "TIERED";
  unitPrice: number;
  installationFee: number;
  label: string;
  tiers: Array<{
    minQuantity: number;
    discountPercent: number;
    tierPrice: number | null;
  }>;
} | null> {
  // 1. Try product-level match (scope=PRODUCT)
  const productPricing = await db.productPricing.findFirst({
    where: {
      productSlug,
      scope: "PRODUCT",
      isActive: true,
    },
    include: { tiers: { orderBy: { minQuantity: "asc" } } },
  });

  if (productPricing) {
    return {
      pricingType: productPricing.pricingType as "FIXED" | "TIERED",
      unitPrice: productPricing.unitPrice,
      installationFee: productPricing.installationFee,
      label: productPricing.label,
      tiers: productPricing.tiers.map((t) => ({
        minQuantity: t.minQuantity,
        discountPercent: t.discountPercent,
        tierPrice: t.tierPrice,
      })),
    };
  }

  // 2. Try category-level match (scope=CATEGORY) by matching categorySlug to subcategory
  //    Normalize: compare case-insensitive, also try slugified version
  const categorySlug = subcategory
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const categoryPricing = await db.productPricing.findFirst({
    where: {
      scope: "CATEGORY",
      isActive: true,
      OR: [
        { categorySlug: subcategory },
        { categorySlug: categorySlug },
        { categorySlug: { equals: subcategory, mode: "insensitive" } },
      ],
    },
    include: { tiers: { orderBy: { minQuantity: "asc" } } },
  });

  if (categoryPricing) {
    return {
      pricingType: categoryPricing.pricingType as "FIXED" | "TIERED",
      unitPrice: categoryPricing.unitPrice,
      installationFee: categoryPricing.installationFee,
      label: categoryPricing.label,
      tiers: categoryPricing.tiers.map((t) => ({
        minQuantity: t.minQuantity,
        discountPercent: t.discountPercent,
        tierPrice: t.tierPrice,
      })),
    };
  }

  return null;
}

/**
 * Resolve the effective unit price for a tiered pricing item based on quantity.
 * - If a matching tier has tierPrice set, use that directly.
 * - Otherwise, apply discountPercent to the base unitPrice.
 */
function resolveTierPrice(
  baseUnitPrice: number,
  quantity: number,
  tiers: Array<{ minQuantity: number; discountPercent: number; tierPrice: number | null }>
): { unitPrice: number; discountPercent: number } {
  // Find the best matching tier (highest minQuantity that quantity >=)
  let matchedTier: { minQuantity: number; discountPercent: number; tierPrice: number | null } | null = null;
  for (const tier of tiers) {
    if (quantity >= tier.minQuantity) {
      matchedTier = tier;
    }
  }

  if (!matchedTier) {
    // No tier matches, use base price with no discount
    return { unitPrice: baseUnitPrice, discountPercent: 0 };
  }

  if (matchedTier.tierPrice !== null && matchedTier.tierPrice !== undefined) {
    // Tier has a direct price per pcs
    return { unitPrice: matchedTier.tierPrice, discountPercent: 0 };
  }

  // Apply discount percent to base price
  return { unitPrice: baseUnitPrice, discountPercent: matchedTier.discountPercent };
}

/**
 * Look up shipping cost from the ShippingCost table by city name.
 * If the city is not in the table, estimate shipping cost using
 * a distance/weight-based formula (same logic as /api/admin/estimate-shipping).
 * Returns { cost, source } where source indicates "database" or "estimation".
 */
async function lookupShippingCost(city: string, itemQuantity: number = 1): Promise<{ cost: number; source: "database" | "estimation" }> {
  if (!city) return { cost: 0, source: "estimation" };

  const shippingRecord = await db.shippingCost.findFirst({
    where: {
      city: { equals: city, mode: "insensitive" },
      isActive: true,
    },
  });

  if (shippingRecord) {
    return { cost: shippingRecord.baseCost, source: "database" };
  }

  // City not in DB — estimate using distance/weight formula
  const estimatedCost = estimateShippingCost(city, itemQuantity);
  return { cost: estimatedCost, source: "estimation" };
}

/**
 * Estimate shipping cost for a city not in the ShippingCost table.
 * Uses distance from Surabaya and weight-based calculation.
 * Same logic as /api/admin/estimate-shipping route.
 */
function estimateShippingCost(city: string, itemQuantity: number): number {
  const normalizedCity = city.trim().toLowerCase();
  const qty = Math.max(1, itemQuantity);
  const weight = qty * 25; // ~25kg per PJU unit

  const isJava = isJavaIsland(normalizedCity);
  const baseRatePerKg = isJava ? 5000 : 12000;
  const distanceMultiplier = getDistanceMultiplier(normalizedCity);

  let estimatedCost = Math.round(weight * baseRatePerKg * distanceMultiplier);

  // Minimum cost
  const minCost = isJava ? 50000 : 150000;
  estimatedCost = Math.max(estimatedCost, minCost);

  // Round up to nearest 10,000
  estimatedCost = Math.ceil(estimatedCost / 10000) * 10000;

  return estimatedCost;
}

/**
 * Check if a city is on Java island
 */
function isJavaIsland(city: string): boolean {
  const javaCities = [
    "surabaya", "sidoarjo", "gresik", "malang", "kediri", "blitar", "mojokerto",
    "jombang", "lamongan", "tuban", "pasuruan", "probolinggo", "situbondo",
    "jember", "banyuwangi", "madiun", "magetan", "nganjuk", "ponorogo",
    "semarang", "solo", "surakarta", "yogyakarta", "pekalongan", "tegal",
    "purwokerto", "cilacap", "magelang", "kudus", "jepara", "demak",
    "jakarta", "bandung", "bogor", "bekasi", "tangerang", "depok",
    "cirebon", "sukabumi", "tasikmalaya", "garut", "karawang", "subang",
  ];
  return javaCities.includes(city);
}

/**
 * Get distance multiplier from Surabaya
 */
function getDistanceMultiplier(city: string): number {
  // East Java (close to Surabaya)
  const eastJavaCities = [
    "surabaya", "sidoarjo", "gresik", "malang", "kediri", "blitar", "mojokerto",
    "jombang", "lamongan", "tuban", "pasuruan", "probolinggo", "situbondo",
    "jember", "banyuwangi", "madiun", "magetan", "nganjuk", "ponorogo",
  ];
  if (eastJavaCities.includes(city)) return 1.0;

  // Central Java
  const centralJavaCities = [
    "semarang", "solo", "surakarta", "yogyakarta", "pekalongan", "tegal",
    "purwokerto", "cilacap", "magelang", "kudus", "jepara", "demak",
  ];
  if (centralJavaCities.includes(city)) return 1.3;

  // West Java / Jakarta
  const westJavaCities = [
    "jakarta", "bandung", "bogor", "bekasi", "tangerang", "depok",
    "cirebon", "sukabumi", "tasikmalaya", "garut", "karawang", "subang",
  ];
  if (westJavaCities.includes(city)) return 1.5;

  // Default: outside Java
  return 3.0;
}

// ============================================================================
// DB-BACKED PRICING CALCULATION (NEW)
// ============================================================================

/**
 * Hitung harga RFQ dari database (ProductPricing + PricingTier + ShippingCost).
 *
 * Flow:
 * 1. Untuk setiap item, cari harga di ProductPricing:
 *    - Prioritas: product-level (scope=PRODUCT, match productSlug) > category-level (scope=CATEGORY, match categorySlug ~ subcategory)
 *    - Jika tidak ditemukan → unitPrice = 0 dengan note
 * 2. Jika pricingType=FIXED → gunakan unitPrice langsung
 * 3. Jika pricingType=TIERED → cari tier yang cocok berdasarkan quantity
 *    - Jika tier.tierPrice ada → gunakan sebagai unitPrice
 *    - Jika tier.tierPrice null → apply discountPercent ke base unitPrice
 * 4. Hitung subtotal, diskon
 * 5. Cari ongkos kirim dari ShippingCost table berdasarkan kota
 * 6. Free shipping: jika subtotal > 1.000.000 DAN kota = "Surabaya" / "Sidoarjo"
 * 7. Apply overall discount (clamp minimum 0)
 * 8. Return DBPricingBreakdown
 */
export async function calculateRFQPricingFromDB(
  items: PricingItem[],
  shippingCity?: string,
  includeInstallation: boolean = false,
  overallDiscount: number = 0
): Promise<DBPricingBreakdown> {
  const notes: string[] = [];

  // Process each item
  const itemBreakdown = await Promise.all(
    items.map(async (item) => {
      const pricing = await lookupPricing(item.productId, item.subcategory);

      if (!pricing) {
        notes.push(
          `Harga untuk ${item.productName} (${item.subcategory}) belum tersedia di database, perlu konfirmasi tim sales.`
        );
        return {
          productId: item.productId,
          productName: item.productName,
          subcategory: item.subcategory,
          quantity: item.quantity,
          unitPrice: 0,
          baseSubtotal: 0,
          discountPercent: 0,
          discountedSubtotal: 0,
          installationFee: 0,
          pricingType: "FIXED" as const,
        };
      }

      let effectiveUnitPrice: number;
      let discountPercent: number;

      if (pricing.pricingType === "FIXED") {
        effectiveUnitPrice = pricing.unitPrice;
        discountPercent = 0;
      } else {
        // TIERED
        const resolved = resolveTierPrice(pricing.unitPrice, item.quantity, pricing.tiers);
        effectiveUnitPrice = resolved.unitPrice;
        discountPercent = resolved.discountPercent;
      }

      const baseSubtotal = pricing.unitPrice * item.quantity;
      const discountAmount = (baseSubtotal * discountPercent) / 100;
      const discountedSubtotal = baseSubtotal - discountAmount;

      if (discountPercent > 0) {
        notes.push(
          `${item.productName}: diskon ${discountPercent}% untuk ${item.quantity} unit.`
        );
      }

      return {
        productId: item.productId,
        productName: item.productName,
        subcategory: item.subcategory,
        quantity: item.quantity,
        unitPrice: effectiveUnitPrice,
        baseSubtotal,
        discountPercent,
        discountedSubtotal,
        installationFee: pricing.installationFee,
        pricingType: pricing.pricingType,
      };
    })
  );

  const baseTotal = itemBreakdown.reduce((sum, i) => sum + i.baseSubtotal, 0);
  const totalItemDiscount = itemBreakdown.reduce(
    (sum, i) => sum + (i.baseSubtotal - i.discountedSubtotal),
    0
  );

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  // Installation fee from DB pricing (sum per-item installationFee × quantity)
  const installationFee = includeInstallation
    ? itemBreakdown.reduce((sum, i) => sum + i.installationFee * i.quantity, 0)
    : 0;

  if (includeInstallation && installationFee > 0) {
    notes.push(
      `Biaya instalasi termasuk: ${formatRupiah(installationFee)}.`
    );
  }

  // Overall discount (applied after item-level discounts)
  const clampedOverallDiscount = Math.max(0, Math.min(100, overallDiscount));
  const netAfterItemDiscounts = baseTotal - totalItemDiscount + installationFee;
  const overallDiscountAmount = (netAfterItemDiscounts * clampedOverallDiscount) / 100;
  const netBeforeShipping = netAfterItemDiscounts - overallDiscountAmount;

  if (clampedOverallDiscount > 0) {
    notes.push(
      `Diskon keseluruhan ${clampedOverallDiscount}% = ${formatRupiah(overallDiscountAmount)}.`
    );
  }

  // Shipping cost — auto-estimate for cities not in DB
  let shippingCost = 0;
  let freeShippingApplied = false;
  let shippingSource: "database" | "estimation" = "estimation";
  const normalizedCity = (shippingCity || "").trim();

  if (normalizedCity) {
    const shippingLookup = await lookupShippingCost(normalizedCity, totalQuantity);
    shippingCost = shippingLookup.cost;
    shippingSource = shippingLookup.source;

    // Free shipping logic: subtotal > 1,000,000 AND city is Surabaya or Sidoarjo
    const lowerCity = normalizedCity.toLowerCase();
    if (netBeforeShipping > 1_000_000 && (lowerCity === "surabaya" || lowerCity === "sidoarjo")) {
      if (shippingCost > 0) {
        freeShippingApplied = true;
        notes.push(
          `Free shipping diterapkan untuk pengiriman ke ${normalizedCity} (subtotal > ${formatRupiah(1_000_000)}).`
        );
      }
      shippingCost = 0;
    } else if (shippingCost > 0) {
      if (shippingSource === "estimation") {
        notes.push(`Estimasi ongkir ke ${normalizedCity}: ${formatRupiah(shippingCost)} (estimasi sistem, dapat berubah).`);
      } else {
        notes.push(`Ongkos kirim ke ${normalizedCity}: ${formatRupiah(shippingCost)}.`);
      }
    }
  }

  const grandTotal = netBeforeShipping + shippingCost;

  notes.push(
    "Harga penawaran bersifat mengikat. Harga final dapat berubah setelah konfirmasi tim sales."
  );

  return {
    items: itemBreakdown.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      subcategory: i.subcategory,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      baseSubtotal: i.baseSubtotal,
      discountPercent: i.discountPercent,
      discountedSubtotal: i.discountedSubtotal,
    })),
    baseTotal,
    totalDiscount: totalItemDiscount + overallDiscountAmount,
    installationFee,
    grandTotal,
    currency: "IDR",
    estimatedDeliveryDays: estimateDeliveryDays(totalQuantity),
    notes,
    // DBPricingBreakdown extensions
    shippingCost,
    shippingCostFormatted: formatRupiah(shippingCost),
    shippingCity: normalizedCity,
    freeShippingApplied,
    shippingSource,
    overallDiscount: clampedOverallDiscount,
    overallDiscountAmount,
    netBeforeShipping,
  };
}

// ============================================================================
// DEPRECATED SYNC FUNCTION (backward compat)
// ============================================================================

/**
 * Hitung estimasi harga untuk RFQ (SYNC, HARDCODED)
 *
 * @deprecated Use calculateRFQPricingFromDB() instead — reads from database
 * @param items Daftar item RFQ
 * @param includeInstallation Apakah termasuk biaya instalasi
 */
export function calculateRFQPricing(
  items: PricingItem[],
  includeInstallation: boolean = false
): PricingBreakdown {
  const notes: string[] = [];

  const itemBreakdown = items.map((item) => {
    const unitPrice = getUnitPrice(item.subcategory);
    const baseSubtotal = unitPrice * item.quantity;
    const discountPercent = getBulkDiscount(item.quantity);
    const discountAmount = (baseSubtotal * discountPercent) / 100;
    const discountedSubtotal = baseSubtotal - discountAmount;

    if (unitPrice === 0) {
      notes.push(
        `Harga untuk ${item.productName} (${item.subcategory}) belum tersedia, perlu konfirmasi tim sales.`
      );
    }

    if (discountPercent > 0) {
      notes.push(
        `${item.productName}: diskon ${discountPercent}% untuk ${item.quantity} unit.`
      );
    }

    return {
      productId: item.productId,
      productName: item.productName,
      subcategory: item.subcategory,
      quantity: item.quantity,
      unitPrice,
      baseSubtotal,
      discountPercent,
      discountedSubtotal,
    };
  });

  const baseTotal = itemBreakdown.reduce((sum, i) => sum + i.baseSubtotal, 0);
  const totalDiscount = itemBreakdown.reduce(
    (sum, i) => sum + (i.baseSubtotal - i.discountedSubtotal),
    0
  );

  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const installationFee = includeInstallation
    ? installationFeePerUnit * totalQuantity
    : 0;

  const grandTotal = baseTotal - totalDiscount + installationFee;

  if (includeInstallation) {
    notes.push(
      `Biaya instalasi ${formatRupiah(installationFeePerUnit)}/unit × ${totalQuantity} unit = ${formatRupiah(installationFee)}.`
    );
  }

  notes.push(
    "Estimasi harga bersifat indikatif. Harga final ditentukan setelah review tim sales."
  );

  return {
    items: itemBreakdown,
    baseTotal,
    totalDiscount,
    installationFee,
    grandTotal,
    currency: "IDR",
    estimatedDeliveryDays: estimateDeliveryDays(totalQuantity),
    notes,
  };
}
