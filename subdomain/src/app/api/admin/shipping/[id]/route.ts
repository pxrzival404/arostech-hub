import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/admin/shipping/[id]
 * Get a single shipping cost entry (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const shipping = await db.shippingCost.findUnique({
      where: { id },
    });

    if (!shipping) {
      return NextResponse.json(
        { error: "Data ongkos kirim tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shipping });
  } catch (error) {
    console.error("[Admin Shipping Detail API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat detail ongkos kirim" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/shipping/[id]
 * Update a shipping cost entry (admin only)
 * Body: { city?, province?, baseCost?, freeThreshold?, isActive? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    // Verify entry exists
    const existing = await db.shippingCost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Data ongkos kirim tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { city, province, baseCost, freeThreshold, isActive } = body;

    // Build update data — only include fields that are provided
    const updateData: Record<string, unknown> = {};
    if (city !== undefined) updateData.city = city.trim();
    if (province !== undefined) updateData.province = province.trim();
    if (baseCost !== undefined) {
      if (typeof baseCost !== "number" || baseCost < 0) {
        return NextResponse.json(
          { error: "Biaya dasar harus berupa angka positif" },
          { status: 400 }
        );
      }
      updateData.baseCost = baseCost;
    }
    if (freeThreshold !== undefined) updateData.freeThreshold = freeThreshold;
    if (isActive !== undefined) updateData.isActive = isActive;

    const shipping = await db.shippingCost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ shipping });
  } catch (error) {
    console.error("[Admin Shipping Update API] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data ongkos kirim" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/shipping/[id]
 * Delete a shipping cost entry (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;

    // Verify entry exists
    const existing = await db.shippingCost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Data ongkos kirim tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.shippingCost.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Data ongkos kirim berhasil dihapus",
    });
  } catch (error) {
    console.error("[Admin Shipping Delete API] Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data ongkos kirim" },
      { status: 500 }
    );
  }
}
