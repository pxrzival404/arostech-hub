import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/pricing
 * List all ProductPricing entries for the current subdomain (admin only)
 * Query params: scope (CATEGORY | PRODUCT)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    // Build where clause — always filter by subdomain
    const where: Prisma.ProductPricingWhereInput = { subdomain };
    if (scope && (scope === "CATEGORY" || scope === "PRODUCT")) {
      where.scope = scope as Prisma.EnumPricingScopeFilter;
    }

    const pricing = await db.productPricing.findMany({
      where,
      include: {
        tiers: {
          orderBy: { minQuantity: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pricing, subdomain });
  } catch (error) {
    console.error("[Admin Pricing API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pricing" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing
 * Create a new ProductPricing entry with optional tiers (admin only)
 * Automatically sets subdomain from request header
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const body = await request.json();
    const {
      scope,
      pricingType,
      categorySlug,
      productSlug,
      label,
      unitPrice,
      installationFee,
      isActive,
      tiers,
    } = body;

    if (!scope) {
      return NextResponse.json(
        { error: "Scope wajib diisi" },
        { status: 400 }
      );
    }
    if (!label) {
      return NextResponse.json(
        { error: "Label wajib diisi" },
        { status: 400 }
      );
    }
    if (scope !== "CATEGORY" && scope !== "PRODUCT") {
      return NextResponse.json(
        { error: "Scope harus berupa CATEGORY atau PRODUCT" },
        { status: 400 }
      );
    }

    const pricing = await db.$transaction(async (tx) => {
      const newPricing = await tx.productPricing.create({
        data: {
          scope,
          pricingType: pricingType || "FIXED",
          categorySlug: categorySlug || null,
          productSlug: productSlug || null,
          label,
          unitPrice: unitPrice ?? 0,
          installationFee: installationFee ?? 0,
          isActive: isActive ?? true,
          subdomain, // Set subdomain automatically
          tiers: tiers?.length
            ? {
                create: tiers.map(
                  (tier: { minQuantity: number; discountPercent: number; tierPrice?: number | null }) => ({
                    minQuantity: tier.minQuantity ?? 1,
                    discountPercent: tier.discountPercent ?? 0,
                    tierPrice: tier.tierPrice ?? null,
                  })
                ),
              }
            : undefined,
        },
        include: {
          tiers: {
            orderBy: { minQuantity: "asc" },
          },
        },
      });

      return newPricing;
    });

    return NextResponse.json({ pricing }, { status: 201 });
  } catch (error) {
    console.error("[Admin Pricing API] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat data pricing" },
      { status: 500 }
    );
  }
}
