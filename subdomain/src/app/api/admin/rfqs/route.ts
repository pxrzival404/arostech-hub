import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { safeParseInt } from "@/lib/sanitize";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/rfqs
 * List all RFQs for the current subdomain (admin only)
 * Query params: status, search, page, limit
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
    const search = searchParams.get("search");
    const page = Math.max(1, safeParseInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, safeParseInt(searchParams.get("limit"), 20)));
    const skip = (page - 1) * limit;

    // Build where clause — always filter by subdomain
    const where: Prisma.RFQWhereInput = { subdomain };
    if (status && status !== "ALL") {
      where.status = status as Prisma.EnumRFQStatusFilter;
    }
    if (search) {
      where.OR = [
        { folderName: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
        { client: { email: { contains: search, mode: "insensitive" } } },
        { client: { company: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [rfqs, total] = await Promise.all([
      db.rFQ.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, company: true, phone: true } },
          items: true,
          reports: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.rFQ.count({ where }),
    ]);

    return NextResponse.json({
      rfqs,
      subdomain,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Admin RFQs API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data RFQ" },
      { status: 500 }
    );
  }
}
