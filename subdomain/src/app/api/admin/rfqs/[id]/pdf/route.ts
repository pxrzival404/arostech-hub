import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

/**
 * GET /api/admin/rfqs/[id]/pdf?type=raw|processed
 *
 * Download a PDF file for an RFQ. Admin-only.
 *
 * Strategy:
 * 1. Try to read the PDF from filesystem (multiple possible paths)
 * 2. If file not found, regenerate the PDF on-the-fly using the PDF generator
 * 3. Save the regenerated file and update the DB record
 * 4. Return the PDF as a downloadable binary
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
    const type = request.nextUrl.searchParams.get("type") || "raw";
    const reportType = type === "processed" ? "PROCESSED_RESULT" : "ORIGINAL_REQUEST";

    // Fetch the RFQ with items and client data
    const rfq = await db.rFQ.findUnique({
      where: { id },
      include: {
        items: true,
        client: true,
        reports: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json({ error: "RFQ tidak ditemukan" }, { status: 404 });
    }

    // Try to find existing PDF file on disk
    const fileBuffer = await findExistingPdf(rfq.id, type);

    if (fileBuffer) {
      return returnPdfResponse(fileBuffer, id, type);
    }

    // File not found on disk — regenerate on-the-fly
    console.log(`[PDF Download] File not found for RFQ ${id}, regenerating ${type} PDF...`);

    try {
      const regenerated = await regeneratePdf(rfq, type);
      if (regenerated) {
        return returnPdfResponse(regenerated, id, type);
      }
    } catch (regenError) {
      console.error(`[PDF Download] Regeneration failed for RFQ ${id}:`, regenError);
    }

    // If no report exists at all and type is raw, we can still generate a fresh one
    if (rfq.reports.length === 0 && type === "raw") {
      try {
        const regenerated = await regeneratePdf(rfq, type);
        if (regenerated) {
          return returnPdfResponse(regenerated, id, type);
        }
      } catch {
        // Fall through to error
      }
    }

    return NextResponse.json(
      { error: `PDF ${type} tidak tersedia untuk RFQ ini. File belum digenerate.` },
      { status: 404 }
    );
  } catch (error) {
    console.error("[PDF Download API] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengunduh PDF" },
      { status: 500 }
    );
  }
}

/**
 * Search for existing PDF file in multiple possible locations
 */
async function findExistingPdf(rfqId: string, type: string): Promise<Buffer | null> {
  const filename = `${rfqId}-${type}.pdf`;
  const relativePath = path.join("public", "rfq-pdfs", filename);

  // Possible locations to search (in order of likelihood)
  const searchPaths = [
    path.join(process.cwd(), relativePath),                              // Standalone mode: cwd = .next/standalone/
    path.join(process.cwd(), "..", "..", relativePath),                  // Two levels up from standalone
    path.join("/home/z/my-project", relativePath),                       // Absolute project root
  ];

  for (const filePath of searchPaths) {
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile() && stat.size > 0) {
        console.log(`[PDF Download] Found file at: ${filePath}`);
        return await fs.readFile(filePath);
      }
    } catch {
      // File not found at this path, try next
    }
  }

  return null;
}

/**
 * Regenerate a PDF on-the-fly for the given RFQ
 */
async function regeneratePdf(
  rfq: {
    id: string;
    folderName: string;
    folderDesc: string | null;
    status: string;
    submittedAt: Date | null;
    createdAt: Date;
    shippingCity: string | null;
    shippingAddress: string | null;
    shippingCost: number | null;
    overallDiscount: number;
    adminNotes: string | null;
    subdomain: string | null;
    items: Array<{
      id: string;
      productName: string;
      productSlug: string;
      productSerial: string | null;
      subcategory: string | null;
      quantity: number;
      baseUnitPrice: number | null;
      unitPrice: number | null;
      discountPercent: number;
      customNote: string | null;
    }>;
    client: {
      name: string;
      email: string;
      company: string | null;
      phone: string | null;
      companyAddress: string | null;
    } | null;
  },
  type: string
): Promise<Buffer | null> {
  // Dynamic import to avoid circular dependencies at module level
  const { generateAndSaveRawPdf, generateAndSaveProcessedPdf } = await import("@/lib/pdf-generator");

  if (!rfq.client) {
    console.error(`[PDF Regenerate] RFQ ${rfq.id} has no client data`);
    return null;
  }

  const pdfData = {
    rfqId: rfq.id,
    folderName: rfq.folderName,
    folderDescription: rfq.folderDesc || undefined,
    submittedAt: rfq.submittedAt || rfq.createdAt,
    subdomain: rfq.subdomain ?? undefined,
    client: {
      name: rfq.client.name,
      email: rfq.client.email,
      company: rfq.client.company || undefined,
      phone: rfq.client.phone || undefined,
      companyAddress: rfq.client.companyAddress || rfq.shippingAddress || undefined,
    },
    shippingCity: rfq.shippingCity || undefined,
    shippingAddress: rfq.shippingAddress || undefined,
    items: rfq.items.map((item) => ({
      productName: item.productName,
      productSlug: item.productSlug,
      productSerial: item.productSerial || undefined,
      subcategory: item.subcategory || undefined,
      quantity: item.quantity,
      baseUnitPrice: item.baseUnitPrice || undefined,
      unitPrice: item.unitPrice || undefined,
      discountPercent: item.discountPercent || undefined,
      customNote: item.customNote || undefined,
    })),
  };

  try {
    if (type === "raw") {
      const result = await generateAndSaveRawPdf(pdfData);
      // Update the DB record with the new fileUrl
      await updateReportFileUrl(rfq.id, "ORIGINAL_REQUEST", result.url);
      return fs.readFile(result.path);
    } else {
      // Processed PDF requires pricing breakdown
      // Calculate pricing from DB using the pricing engine
      const { calculateRFQPricingFromDB } = await import("@/lib/pricing-engine");

      const pricingItems = rfq.items.map((item) => ({
        productId: item.productSlug || item.id,
        productName: item.productName,
        subcategory: item.subcategory || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice || item.baseUnitPrice || 0,
        discountPercent: item.discountPercent || 0,
      }));

      const pricing = await calculateRFQPricingFromDB(
        pricingItems,
        rfq.shippingCity || "",
        rfq.overallDiscount || 0
      );

      // Override shipping cost if admin has set it
      if (rfq.shippingCost !== null && rfq.shippingCost !== undefined) {
        pricing.shippingCost = rfq.shippingCost;
        pricing.grandTotal = pricing.netBeforeShipping + rfq.shippingCost;
      }

      const options = {
        salesName: "Admin",
        salesNotes: rfq.adminNotes ? [rfq.adminNotes] : undefined,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const result = await generateAndSaveProcessedPdf(pdfData, pricing, options);
      // Update the DB record with the new fileUrl
      await updateReportFileUrl(rfq.id, "PROCESSED_RESULT", result.url);
      return fs.readFile(result.path);
    }
  } catch (error) {
    console.error(`[PDF Regenerate] Error generating ${type} PDF:`, error);
    return null;
  }
}

/**
 * Update or create a report record with the fileUrl
 */
async function updateReportFileUrl(rfqId: string, reportType: string, fileUrl: string) {
  try {
    const existing = await db.rFQReport.findFirst({
      where: { rfqId, reportType },
    });

    if (existing) {
      await db.rFQReport.update({
        where: { id: existing.id },
        data: { fileUrl },
      });
    } else {
      await db.rFQReport.create({
        data: {
          rfqId,
          reportType,
          fileUrl,
        },
      });
    }
  } catch (error) {
    console.error(`[PDF Regenerate] Failed to update DB record:`, error);
  }
}

/**
 * Return a PDF response with proper headers
 */
function returnPdfResponse(fileBuffer: Buffer, id: string, type: string): NextResponse {
  const filename = type === "processed"
    ? `RFQ-Penawaran-${id.slice(0, 8)}.pdf`
    : `RFQ-Raw-${id.slice(0, 8)}.pdf`;

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "no-cache",
    },
  });
}
