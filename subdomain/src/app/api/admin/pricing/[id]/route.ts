import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/pricing/[id]
 * Get single ProductPricing entry with tiers (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const pricing = await db.productPricing.findUnique({
      where: { id },
      include: {
        tiers: {
          orderBy: { minQuantity: "asc" },
        },
      },
    });

    if (!pricing) {
      return NextResponse.json(
        { error: "Data pricing tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pricing });
  } catch (error) {
    console.error("[Admin Pricing Detail API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail pricing" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/pricing/[id]
 * Update a ProductPricing entry (admin only)
 * Body: { scope?, pricingType?, categorySlug?, productSlug?, label?, unitPrice?, installationFee?, isActive?, tiers?: [{minQuantity, discountPercent, tierPrice?}] }
 * If tiers is provided, existing tiers are deleted and recreated (full replacement)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
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

    // Verify pricing exists
    const existing = await db.productPricing.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Data pricing tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update pricing entry with tier replacement in a transaction
    const updated = await db.$transaction(async (tx) => {
      // If tiers provided, delete existing and recreate (full replacement)
      if (tiers !== undefined) {
        await tx.pricingTier.deleteMany({
          where: { pricingId: id },
        });
      }

      const updatedPricing = await tx.productPricing.update({
        where: { id },
        data: {
          ...(scope !== undefined && { scope }),
          ...(pricingType !== undefined && { pricingType }),
          ...(categorySlug !== undefined && { categorySlug: categorySlug || null }),
          ...(productSlug !== undefined && { productSlug: productSlug || null }),
          ...(label !== undefined && { label }),
          ...(unitPrice !== undefined && { unitPrice }),
          ...(installationFee !== undefined && { installationFee }),
          ...(isActive !== undefined && { isActive }),
          ...(tiers !== undefined && {
            tiers: {
              create: tiers.map(
                (tier: { minQuantity: number; discountPercent: number; tierPrice?: number | null }) => ({
                  minQuantity: tier.minQuantity ?? 1,
                  discountPercent: tier.discountPercent ?? 0,
                  tierPrice: tier.tierPrice ?? null,
                })
              ),
            },
          }),
        },
        include: {
          tiers: {
            orderBy: { minQuantity: "asc" },
          },
        },
      });

      return updatedPricing;
    });

    return NextResponse.json({ pricing: updated });
  } catch (error) {
    console.error("[Admin Pricing Update API] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data pricing" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pricing/[id]
 * Delete a ProductPricing entry (admin only)
 * Cascades tiers automatically via Prisma schema (onDelete: Cascade)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify pricing exists
    const existing = await db.productPricing.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Data pricing tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete pricing (tiers cascade automatically)
    await db.productPricing.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Data pricing berhasil dihapus",
    });
  } catch (error) {
    console.error("[Admin Pricing Delete API] Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data pricing" },
      { status: 500 }
    );
  }
}
