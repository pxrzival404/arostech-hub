import { NextRequest, NextResponse } from "next/server";
import { getRFQStatus, formatRFQStatus, getRFQStatusColor } from "@/lib/rfq-processor";

export async function GET(request: NextRequest) {
  try {
    const rfqId = request.nextUrl.searchParams.get("id");

    if (!rfqId) {
      return NextResponse.json(
        { error: "RFQ ID wajib diisi" },
        { status: 400 }
      );
    }

    const rfq = await getRFQStatus(rfqId);

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      rfq: {
        ...rfq,
        statusFormatted: formatRFQStatus(rfq.status),
        statusColor: getRFQStatusColor(rfq.status),
      },
    });
  } catch (error) {
    console.error("Track RFQ error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat melacak RFQ" },
      { status: 500 }
    );
  }
}
