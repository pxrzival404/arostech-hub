import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateRFQStatus } from "@/lib/rfq-processor";
import { sanitizeNumber, safeParseInt } from "@/lib/sanitize";

/**
 * Resolve tier pricing for RFQ items that don't have admin overrides.
 * For each item, looks up the ProductPricing and resolves the tier price
 * based on the item's quantity. Returns resolvedUnitPrice and resolvedDiscountPercent
 * that the frontend should use when item.unitPrice is null.
 */
async function resolveItemTierPricing(
  items: Array<{
    id: string;
    productSlug: string;
    subcategory: string;
    quantity: number;
    unitPrice: number | null;
    baseUnitPrice: number | null;
    discountPercent: number;
  }>
): Promise<Map<string, { resolvedUnitPrice: number; resolvedDiscountPercent: number }>> {
  const result = new Map<string, { resolvedUnitPrice: number; resolvedDiscountPercent: number }>();

  for (const item of items) {
    // If admin has already set an override price, no need to resolve tiers
    if (item.unitPrice !== null && item.unitPrice !== undefined) {
      result.set(item.id, {
        resolvedUnitPrice: item.unitPrice,
        resolvedDiscountPercent: item.discountPercent ?? 0,
      });
      continue;
    }

    // Try product-level pricing first
    const productPricing = await db.productPricing.findFirst({
      where: { productSlug: item.productSlug, scope: "PRODUCT", isActive: true },
      include: { tiers: { orderBy: { minQuantity: "asc" } } },
    });

    let pricing = productPricing;
    if (!pricing) {
      // Try category-level
      const categorySlug = item.subcategory
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      pricing = await db.productPricing.findFirst({
        where: {
          scope: "CATEGORY",
          isActive: true,
          OR: [
            { categorySlug: item.subcategory },
            { categorySlug: categorySlug },
            { categorySlug: { equals: item.subcategory, mode: "insensitive" } },
          ],
        },
        include: { tiers: { orderBy: { minQuantity: "asc" } } },
      });
    }

    if (!pricing) {
      // No pricing found — use stored baseUnitPrice
      result.set(item.id, {
        resolvedUnitPrice: item.baseUnitPrice ?? 0,
        resolvedDiscountPercent: item.discountPercent ?? 0,
      });
      continue;
    }

    if (pricing.pricingType === "FIXED" || !pricing.tiers || pricing.tiers.length === 0) {
      result.set(item.id, {
        resolvedUnitPrice: pricing.unitPrice,
        resolvedDiscountPercent: item.discountPercent ?? 0,
      });
      continue;
    }

    // TIERED — resolve based on quantity
    let matchedTier: { minQuantity: number; discountPercent: number; tierPrice: number | null } | null = null;
    for (const tier of pricing.tiers) {
      if (item.quantity >= tier.minQuantity) {
        matchedTier = tier as { minQuantity: number; discountPercent: number; tierPrice: number | null };
      }
    }

    if (!matchedTier) {
      result.set(item.id, {
        resolvedUnitPrice: pricing.unitPrice,
        resolvedDiscountPercent: 0,
      });
    } else if (matchedTier.tierPrice !== null && matchedTier.tierPrice !== undefined) {
      result.set(item.id, {
        resolvedUnitPrice: matchedTier.tierPrice,
        resolvedDiscountPercent: 0,
      });
    } else {
      result.set(item.id, {
        resolvedUnitPrice: pricing.unitPrice,
        resolvedDiscountPercent: matchedTier.discountPercent,
      });
    }
  }

  return result;
}

// H9: Valid status transitions map
// Mendefinisikan status apa yang bisa dituju dari status saat ini
const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PROCESSING", "QUOTED", "REJECTED"],
  PROCESSING: ["QUOTED", "REJECTED"],
  QUOTED: ["ACCEPTED", "REJECTED", "PROCESSING"], // PROCESSING = revisi penawaran
  ACCEPTED: [], // Status akhir — tidak bisa diubah lagi
  REJECTED: ["SUBMITTED", "PROCESSING"], // Bisa di-reopen
};

const VALID_STATUSES = ["DRAFT", "SUBMITTED", "PROCESSING", "QUOTED", "ACCEPTED", "REJECTED"];

/**
 * GET /api/admin/rfqs/[id]
 * Get single RFQ detail (admin only)
 * Includes resolved tier pricing for each item so the admin view shows
 * the correct tier-resolved price even for existing RFQs.
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
    const rfq = await db.rFQ.findUnique({
      where: { id },
      include: {
        client: true,
        items: true,
        reports: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
    }

    // Resolve tier pricing for items without admin override
    const tierPricingMap = await resolveItemTierPricing(rfq.items);

    // Attach resolved pricing to each item
    const itemsWithResolvedPricing = rfq.items.map((item) => {
      const resolved = tierPricingMap.get(item.id);
      return {
        ...item,
        resolvedUnitPrice: resolved?.resolvedUnitPrice ?? item.baseUnitPrice ?? 0,
        resolvedDiscountPercent: resolved?.resolvedDiscountPercent ?? item.discountPercent ?? 0,
      };
    });

    return NextResponse.json({
      rfq: {
        ...rfq,
        items: itemsWithResolvedPricing,
      },
    });
  } catch (error) {
    console.error("[Admin RFQ Detail API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail RFQ" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/rfqs/[id]
 * Update RFQ — admin only
 *
 * Body fields:
 * - status?: string — new RFQ status (optional — if omitted, only saves overrides without status change)
 * - salesName?, salesNotes?, validUntil?, includeInstallation? — passed to updateRFQStatus
 * - overallDiscount?: number (0-100) — update RFQ-level overall discount
 * - adminNotes?: string — update admin notes on RFQ
 * - items?: Array<{ id: string, unitPrice?: number, discountPercent?: number, customNote?: string }>
 *   — update individual RFQItem overrides (admin edits per-item pricing)
 *
 * When status changes to QUOTED, automatically generates Processed PDF + sends email.
 * Admin overrides (items, overallDiscount) are persisted BEFORE the status change,
 * so the Processed PDF uses the admin-edited values.
 *
 * If status is omitted or same as current, only the overrides are saved (edit mode save).
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
      status,
      salesName,
      salesNotes,
      validUntil,
      includeInstallation,
      overallDiscount,
      adminNotes,
      shippingCost,
      signatureUrl,
      items,
    } = body;

    // Verify RFQ exists
    const existing = await db.rFQ.findUnique({
      where: { id },
      include: { client: true, items: true, reports: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
    }

    // --- Persist admin overrides BEFORE status change ---

    // Update RFQ-level fields: overallDiscount, adminNotes
    const rfqUpdateData: Record<string, unknown> = {};
    if (overallDiscount !== undefined && overallDiscount !== null) {
      rfqUpdateData.overallDiscount = Math.max(0, Math.min(100, Number(overallDiscount)));
    }
    if (adminNotes !== undefined) {
      rfqUpdateData.adminNotes = adminNotes;
    }
    if (shippingCost !== undefined && shippingCost !== null) {
      rfqUpdateData.shippingCost = Math.max(0, Number(shippingCost));
    }

    if (Object.keys(rfqUpdateData).length > 0) {
      await db.rFQ.update({
        where: { id },
        data: rfqUpdateData,
      });
    }

    // Update individual RFQItem overrides (unitPrice, discountPercent, customNote)
    if (Array.isArray(items) && items.length > 0) {
      // H7: Limit item update count to prevent abuse
      if (items.length > 50) {
        return NextResponse.json(
          { error: "Maksimal 50 item yang bisa diupdate sekaligus" },
          { status: 400 }
        );
      }

      for (const itemUpdate of items) {
        if (!itemUpdate.id) continue;

        const itemData: Record<string, unknown> = {};
        if (itemUpdate.unitPrice !== undefined && itemUpdate.unitPrice !== null) {
          // H9: Clamp unitPrice ≥ 0 to prevent negative prices
          itemData.unitPrice = Math.max(0, Number(itemUpdate.unitPrice) || 0);
        }
        if (itemUpdate.discountPercent !== undefined && itemUpdate.discountPercent !== null) {
          itemData.discountPercent = Math.max(0, Math.min(100, Number(itemUpdate.discountPercent) || 0));
        }
        if (itemUpdate.customNote !== undefined) {
          // H6: Sanitize customNote
          itemData.customNote = String(itemUpdate.customNote).substring(0, 500);
        }

        if (Object.keys(itemData).length > 0) {
          // Verify this item belongs to this RFQ
          const existingItem = await db.rFQItem.findFirst({
            where: { id: itemUpdate.id, rfqId: id },
          });
          if (existingItem) {
            await db.rFQItem.update({
              where: { id: itemUpdate.id },
              data: itemData,
            });
          }
        }
      }
    }

    // --- Status change (only if status is provided and different from current) ---
    const statusChanged = status && status !== existing.status;

    if (statusChanged) {
      // H9: Validate that the status is a valid enum value
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Status "${status}" tidak valid. Status yang valid: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }

      // H9: Validate that the transition is allowed
      const allowedNext = VALID_TRANSITIONS[existing.status] || [];
      if (!allowedNext.includes(status)) {
        return NextResponse.json(
          {
            error: `Perubahan status dari "${existing.status}" ke "${status}" tidak diizinkan. Status yang bisa dituju dari "${existing.status}": ${allowedNext.length > 0 ? allowedNext.join(", ") : "tidak ada (status akhir)"}`,
          },
          { status: 400 }
        );
      }

      // Update status — this will auto-generate Processed PDF + send email if status → QUOTED
      const result = await updateRFQStatus(id, status, {
        salesName,
        // salesNotes is expected as string[] by rfq-processor, but UI sends a single string
        salesNotes: salesNotes ? [salesNotes] : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        includeInstallation,
        signatureUrl,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.message || "Gagal mengupdate status RFQ" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        rfqId: result.rfqId,
        status: result.status,
        pricing: result.pricing ?? undefined,
      });
    }

    // No status change — just return success for the override save
    return NextResponse.json({
      success: true,
      message: "Perubahan penawaran berhasil disimpan",
      rfqId: id,
      status: existing.status,
    });
  } catch (error) {
    console.error("[Admin RFQ Status API] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate status RFQ" },
      { status: 500 }
    );
  }
}
