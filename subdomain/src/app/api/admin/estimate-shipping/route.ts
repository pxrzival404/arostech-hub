import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/admin/estimate-shipping
 * 
 * Estimate shipping cost for a city that's not in the ShippingCost table.
 * Uses a calculation based on distance from Surabaya (East Java, Indonesia)
 * with realistic Indonesian logistics pricing.
 * 
 * Body: { city: string, province?: string, totalWeight?: number, itemQuantity?: number }
 * Returns: { estimatedCost: number, confidence: "high"|"medium"|"low", source: string, note: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { city, province, totalWeight, itemQuantity } = body;

    if (!city || !city.trim()) {
      return NextResponse.json({ error: "Nama kota wajib diisi" }, { status: 400 });
    }

    const normalizedCity = city.trim().toLowerCase();

    // First check if city is already in the ShippingCost table
    const existing = await db.shippingCost.findFirst({
      where: {
        city: { equals: normalizedCity, mode: "insensitive" },
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json({
        estimatedCost: existing.baseCost,
        confidence: "high" as const,
        source: "database",
        note: `Kota "${city}" sudah ada di daftar ongkir dengan biaya Rp ${existing.baseCost.toLocaleString("id-ID")}.`,
      });
    }

    // Estimate shipping cost based on Indonesian logistics pricing
    // PJU products are typically heavy (10-50 kg per unit)
    const qty = itemQuantity || 1;
    const weight = totalWeight || qty * 25; // Estimate ~25kg per PJU unit

    // Base rate: Rp 5,000 per kg for Java, higher for outside Java
    const isJava = isJavaIsland(normalizedCity, province);
    const baseRatePerKg = isJava ? 5000 : 12000;
    
    // Distance multiplier based on region from Surabaya
    const distanceMultiplier = getDistanceMultiplier(normalizedCity, province);
    
    // Calculate estimated cost
    let estimatedCost = Math.round(weight * baseRatePerKg * distanceMultiplier);
    
    // Minimum cost
    const minCost = isJava ? 50000 : 150000;
    estimatedCost = Math.max(estimatedCost, minCost);
    
    // Round up to nearest 10,000
    estimatedCost = Math.ceil(estimatedCost / 10000) * 10000;

    // Determine confidence level
    let confidence: "high" | "medium" | "low";
    let note: string;

    if (isJava) {
      confidence = "medium";
      note = `Estimasi ongkir ke ${city} (Pulau Jawa) berdasarkan berat ~${weight}kg. Harga aktual bisa berbeda tergantung ekspedisi dan waktu pengiriman. Disarankan konfirmasi dengan ekspedisi.`;
    } else {
      confidence = "low";
      note = `Estimasi ongkir ke ${city} (luar Jawa) berdasarkan berat ~${weight}kg. Harga aktual bisa berbeda signifikan tergantung ekspedisi, moda transportasi, dan waktu pengiriman. Wajib konfirmasi dengan ekspedisi.`;
    }

    return NextResponse.json({
      estimatedCost,
      confidence,
      source: "estimation",
      note,
      details: {
        estimatedWeight: weight,
        baseRatePerKg,
        distanceMultiplier,
        isJava,
      },
    });
  } catch (error) {
    console.error("[Estimate Shipping API] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengestimasi ongkir" },
      { status: 500 }
    );
  }
}

/**
 * Check if a city is on Java island
 */
function isJavaIsland(city: string, province?: string): boolean {
  const javaProvinces = [
    "jawa timur",
    "jawa tengah", 
    "jawa barat",
    "dki jakarta",
    "banten",
    "di yogyakarta",
    "daerah istimewa yogyakarta",
  ];

  if (province) {
    const normalizedProvince = province.toLowerCase().trim();
    if (javaProvinces.some((jp) => normalizedProvince.includes(jp))) {
      return true;
    }
  }

  // Major Java cities
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
function getDistanceMultiplier(city: string, province?: string): number {
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

  // Outside Java - much more expensive
  if (province) {
    const p = province.toLowerCase().trim();
    if (p.includes("bali")) return 2.0;
    if (p.includes("ntb") || p.includes("nusa tenggara barat")) return 2.5;
    if (p.includes("ntt") || p.includes("nusa tenggara timur")) return 3.0;
    if (p.includes("kalimantan")) return 3.0;
    if (p.includes("sulawesi")) return 3.5;
    if (p.includes("sumatera") || p.includes("sumatra")) return 3.0;
    if (p.includes("papua")) return 5.0;
    if (p.includes("maluku")) return 4.0;
  }

  // Default: outside Java estimate
  return 3.0;
}
