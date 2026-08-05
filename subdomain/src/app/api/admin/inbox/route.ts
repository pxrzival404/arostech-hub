import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/inbox
 * List all ContactMessages for the current subdomain (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    // Always filter by subdomain
    const where: Record<string, unknown> = { subdomain };
    if (status && ["UNREAD", "READ", "REPLIED", "ARCHIVED"].includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          repliedAt: true,
          repliedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.contactMessage.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      messages,
      subdomain,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[Admin Inbox API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat pesan" },
      { status: 500 }
    );
  }
}
