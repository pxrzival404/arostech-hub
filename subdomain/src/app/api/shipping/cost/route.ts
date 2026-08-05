import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/shipping/cost?city=<city_name>&weight=<weight_kg>
 *
 * Calculate JNT Cargo shipping cost from Surabaya/Sidoarjo to destination city.
 * 
 * For cities within Surabaya/Sidoarjo: FREE if order >= 1.000.000
 * For outside: uses JNT Cargo pricing table
 * 
 * This is a placeholder implementation with common routes.
 * In production, integrate with JNT Cargo API or RajaOngkir/Komerce.
 */

// JNT Cargo estimated rates from Surabaya (per kg, approximate)
// Source: JNT Cargo tariff 2024, weight-based
const JNT_CARGO_RATES: Record<string, { minKg: number; perKgRate: number; minCharge: number }> = {
  // Jawa
  "surabaya": { minKg: 0, perKgRate: 0, minCharge: 0 },
  "sidoarjo": { minKg: 0, perKgRate: 0, minCharge: 0 },
  "gresik": { minKg: 0, perKgRate: 0, minCharge: 0 },
  "mojokerto": { minKg: 10, perKgRate: 1500, minCharge: 15000 },
  "jombang": { minKg: 10, perKgRate: 1500, minCharge: 15000 },
  "kediri": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "malang": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "blitar": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "tulungagung": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "madiun": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "nganjuk": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "ponorogo": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "pacitan": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "tuban": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "lamongan": { minKg: 10, perKgRate: 1500, minCharge: 15000 },
  "bojonegoro": { minKg: 10, perKgRate: 2000, minCharge: 20000 },
  "banyuwangi": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "jember": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "situbondo": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "bondowoso": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "sumenep": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "pasuruan": { minKg: 10, perKgRate: 1500, minCharge: 15000 },
  "probolinggo": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "semarang": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "yogyakarta": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "solo": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "surakarta": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "magelang": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "purwokerto": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "cilacap": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "pekalongan": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "tegal": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "brebes": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  // Jakarta & Jabodetabek
  "jakarta": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "jakarta selatan": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "jakarta barat": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "jakarta timur": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "jakarta utara": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "jakarta pusat": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "tangerang": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "tangerang selatan": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "bekasi": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "depok": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  "bogor": { minKg: 10, perKgRate: 3500, minCharge: 35000 },
  // Bandung & West Java
  "bandung": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "cimahi": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "garut": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "tasikmalaya": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "sukabumi": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  "cirebon": { minKg: 10, perKgRate: 2500, minCharge: 25000 },
  "karawang": { minKg: 10, perKgRate: 3000, minCharge: 30000 },
  // Sumatra
  "medan": { minKg: 10, perKgRate: 7000, minCharge: 70000 },
  "palembang": { minKg: 10, perKgRate: 6000, minCharge: 60000 },
  "lampung": { minKg: 10, perKgRate: 5000, minCharge: 50000 },
  "bandar lampung": { minKg: 10, perKgRate: 5000, minCharge: 50000 },
  "pekanbaru": { minKg: 10, perKgRate: 7000, minCharge: 70000 },
  "jambi": { minKg: 10, perKgRate: 6000, minCharge: 60000 },
  "padang": { minKg: 10, perKgRate: 7000, minCharge: 70000 },
  "bengkulu": { minKg: 10, perKgRate: 6000, minCharge: 60000 },
  // Kalimantan
  "balikpapan": { minKg: 10, perKgRate: 10000, minCharge: 100000 },
  "samarinda": { minKg: 10, perKgRate: 10000, minCharge: 100000 },
  "banjarmasin": { minKg: 10, perKgRate: 9000, minCharge: 90000 },
  "pontianak": { minKg: 10, perKgRate: 9000, minCharge: 90000 },
  "palangkaraya": { minKg: 10, perKgRate: 10000, minCharge: 100000 },
  // Sulawesi
  "makassar": { minKg: 10, perKgRate: 9000, minCharge: 90000 },
  "manado": { minKg: 10, perKgRate: 10000, minCharge: 100000 },
  "palu": { minKg: 10, perKgRate: 10000, minCharge: 100000 },
  "kendari": { minKg: 10, perKgRate: 9000, minCharge: 90000 },
  // Bali & Nusa Tenggara
  "denpasar": { minKg: 10, perKgRate: 4000, minCharge: 40000 },
  "bali": { minKg: 10, perKgRate: 4000, minCharge: 40000 },
  "lombok": { minKg: 10, perKgRate: 5000, minCharge: 50000 },
  "mataram": { minKg: 10, perKgRate: 5000, minCharge: 50000 },
  "kupang": { minKg: 10, perKgRate: 7000, minCharge: 70000 },
  // Papua
  "jayapura": { minKg: 10, perKgRate: 15000, minCharge: 150000 },
  "sorong": { minKg: 10, perKgRate: 15000, minCharge: 150000 },
};

// Average weight per PJU unit (kg)
const AVG_WEIGHT_PER_UNIT_KG = 15;

interface ShippingCostResult {
  city: string;
  isFreeZone: boolean;
  weightKg: number;
  perKgRate: number;
  minCharge: number;
  totalCost: number;
  courier: string;
  estimatedDays: number;
  note: string;
}

export function calculateJNTShippingCost(city: string, totalUnits: number, orderTotal: number): ShippingCostResult {
  const normalizedCity = city.toLowerCase().trim();
  const estimatedWeight = Math.max(totalUnits * AVG_WEIGHT_PER_UNIT_KG, 10);
  
  // Check if Surabaya/Sidoarjo/Gresik — free zone
  const freeZoneCities = ["surabaya", "sidoarjo", "gresik"];
  if (freeZoneCities.includes(normalizedCity)) {
    const isFree = orderTotal >= 1000000;
    return {
      city,
      isFreeZone: true,
      weightKg: estimatedWeight,
      perKgRate: 0,
      minCharge: 0,
      totalCost: isFree ? 0 : Math.round(estimatedWeight * 2000),
      courier: "Internal Delivery",
      estimatedDays: 2,
      note: isFree 
        ? "Gratis ongkir untuk area Surabaya & Sidoarjo (pembelian min. Rp 1.000.000)"
        : "Ongkir area Surabaya/Sidoarjo di bawah min. Rp 1.000.000",
    };
  }

  // Look up city in rate table
  const rate = JNT_CARGO_RATES[normalizedCity];
  
  if (rate) {
    const costByWeight = Math.round(estimatedWeight * rate.perKgRate);
    const totalCost = Math.max(costByWeight, rate.minCharge);
    
    let estimatedDays = 4;
    if (normalizedCity.includes("jakarta") || normalizedCity.includes("tangerang") || 
        normalizedCity.includes("bekasi") || normalizedCity.includes("depok") ||
        normalizedCity.includes("bandung") || normalizedCity.includes("bogor")) {
      estimatedDays = 3;
    } else if (normalizedCity.includes("medan") || normalizedCity.includes("palembang") ||
               normalizedCity.includes("balikpapan") || normalizedCity.includes("makassar")) {
      estimatedDays = 5;
    } else if (normalizedCity.includes("jayapura") || normalizedCity.includes("sorong")) {
      estimatedDays = 7;
    }

    return {
      city,
      isFreeZone: false,
      weightKg: estimatedWeight,
      perKgRate: rate.perKgRate,
      minCharge: rate.minCharge,
      totalCost,
      courier: "JNT Cargo (Bayar Tujuan)",
      estimatedDays,
      note: `Estimasi biaya pengiriman JNT Cargo dari Surabaya ke ${city}. Biaya aktual bisa berbeda, bayar di tujuan.`,
    };
  }

  // City not found — return estimated default
  return {
    city,
    isFreeZone: false,
    weightKg: estimatedWeight,
    perKgRate: 5000,
    minCharge: 50000,
    totalCost: Math.max(Math.round(estimatedWeight * 5000), 50000),
    courier: "JNT Cargo (Bayar Tujuan)",
    estimatedDays: 5,
    note: `Kota "${city}" belum ada di tarif standar. Estimasi menggunakan tarif rata-rata. Biaya aktual akan dikonfirmasi setelah PO.`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const totalUnits = parseInt(searchParams.get("units") || "1", 10);
    const orderTotal = parseFloat(searchParams.get("orderTotal") || "0");
    const itemsParam = searchParams.get("items");

    if (!city) {
      return NextResponse.json(
        { error: "Parameter city wajib diisi" },
        { status: 400 }
      );
    }

    // If items are provided, calculate orderTotal from ProductPricing
    let effectiveOrderTotal = orderTotal;
    if (itemsParam) {
      try {
        const items = JSON.parse(itemsParam) as Array<{ subcategory: string; quantity: number; productName?: string }>;
        const { getTieredPrice } = await import("@/lib/pricing-engine");
        let calculatedTotal = 0;
        for (const item of items) {
          const priceData = await getTieredPrice(item.subcategory, item.quantity, item.productName);
          const disc = Math.max(0, priceData.discountPercent);
          const base = priceData.unitPrice * item.quantity;
          calculatedTotal += base - (base * disc) / 100;
        }
        effectiveOrderTotal = calculatedTotal;
      } catch (err) {
        console.warn("[Shipping Cost API] Could not calculate orderTotal from items:", err);
        // Fall back to provided orderTotal or 0
      }
    }

    const result = calculateJNTShippingCost(city, totalUnits, effectiveOrderTotal);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Shipping Cost API] Error:", error);
    return NextResponse.json(
      { error: "Gagal menghitung biaya pengiriman" },
      { status: 500 }
    );
  }
}
