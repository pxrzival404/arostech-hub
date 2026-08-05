import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";

/**
 * GET /api/admin/dashboard/stats
 * Dashboard statistics (admin only) — filtered by subdomain
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subdomain = getSubdomainFromRequest(request);

    // Get RFQ counts by status for this subdomain
    const rfqWhere = { subdomain };
    const [
      totalRfqs,
      draftRfqs,
      submittedRfqs,
      processingRfqs,
      quotedRfqs,
      acceptedRfqs,
      rejectedRfqs,
      totalClients,
      unreadMessages,
      recentRfqs,
    ] = await Promise.all([
      db.rFQ.count({ where: rfqWhere }),
      db.rFQ.count({ where: { ...rfqWhere, status: "DRAFT" } }),
      db.rFQ.count({ where: { ...rfqWhere, status: "SUBMITTED" } }),
      db.rFQ.count({ where: { ...rfqWhere, status: "PROCESSING" } }),
      db.rFQ.count({ where: { ...rfqWhere, status: "QUOTED" } }),
      db.rFQ.count({ where: { ...rfqWhere, status: "ACCEPTED" } }),
      db.rFQ.count({ where: { ...rfqWhere, status: "REJECTED" } }),
      db.client.count({ where: { subdomain } }),
      db.contactMessage.count({ where: { subdomain, status: "UNREAD" } }),
      db.rFQ.findMany({
        where: rfqWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { name: true, email: true, company: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalRfqs,
        draftRfqs,
        submittedRfqs,
        processingRfqs,
        quotedRfqs,
        acceptedRfqs,
        rejectedRfqs,
        totalClients,
        unreadMessages,
      },
      subdomain,
      recentRfqs,
    });
  } catch (error) {
    console.error("[Admin Dashboard Stats API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik dashboard" },
      { status: 500 }
    );
  }
}
