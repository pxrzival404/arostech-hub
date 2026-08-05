import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/shipping
 * List all shipping costs for the current subdomain (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const where: Prisma.ShippingCostWhereInput = { subdomain };
    if (activeOnly) {
      where.isActive = true;
    }

    const shipping = await db.shippingCost.findMany({
      where,
      orderBy: { city: "asc" },
    });

    return NextResponse.json({ shipping, subdomain });
  } catch (error) {
    console.error("[Admin Shipping API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data ongkos kirim" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shipping
 * Create a new shipping cost entry for the current subdomain (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const body = await request.json();
    const { city, province, baseCost, freeThreshold, isActive } = body;

    if (!city || typeof city !== "string" || city.trim() === "") {
      return NextResponse.json(
        { error: "Kota wajib diisi" },
        { status: 400 }
      );
    }

    if (baseCost === undefined || baseCost === null || typeof baseCost !== "number" || baseCost < 0) {
      return NextResponse.json(
        { error: "Biaya dasar wajib diisi dan harus berupa angka positif" },
        { status: 400 }
      );
    }

    const shipping = await db.shippingCost.create({
      data: {
        city: city.trim(),
        province: province?.trim() || "Jawa Timur",
        baseCost,
        freeThreshold: freeThreshold ?? null,
        isActive: isActive ?? true,
        subdomain, // Set subdomain automatically
      },
    });

    return NextResponse.json({ shipping }, { status: 201 });
  } catch (error) {
    console.error("[Admin Shipping API] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat data ongkos kirim" },
      { status: 500 }
    );
  }
}
