import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/rfq/mine
 * Get all RFQs for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rfqs = await db.rFQ.findMany({
      where: { clientId: user.id },
      select: {
        id: true,
        folderName: true,
        status: true,
        totalProducts: true,
        submittedAt: true,
        createdAt: true,
        companyName: true,
        items: {
          select: {
            productName: true,
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ rfqs });
  } catch (error) {
    console.error("[My RFQs API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data RFQ" },
      { status: 500 }
    );
  }
}
