import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/comments
 * List all comments for the current subdomain (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Always filter by subdomain
    const where: Record<string, unknown> = { subdomain };
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    const [comments, total] = await Promise.all([
      db.articleComment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.articleComment.count({ where }),
    ]);

    return NextResponse.json({
      comments,
      subdomain,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin Comments API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data komentar" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/comments
 * Bulk update comment status
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { commentId, status } = await request.json();

    if (!commentId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "commentId dan status (APPROVED/REJECTED) wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await db.articleComment.update({
      where: { id: commentId },
      data: { status },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error) {
    console.error("[Admin Comments API] Error updating:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate status komentar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/comments
 * Delete a comment
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId wajib diisi" },
        { status: 400 }
      );
    }

    await db.articleComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Comments API] Error deleting:", error);
    return NextResponse.json(
      { error: "Gagal menghapus komentar" },
      { status: 500 }
    );
  }
}
