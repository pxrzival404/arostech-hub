import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processRFQSubmission } from "@/lib/rfq-processor";
import { generateRawRFQPdf, type RFQPdfData } from "@/lib/pdf-generator";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";
import {
  sanitizeString,
  sanitizeForHeader,
  sanitizeClientData,
  sanitizeRFQItem,
  isValidEmail,
  MAX_RFQ_ITEMS,
  MAX_FOLDER_NAME_LENGTH,
} from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  // Require authentication for RFQ submission
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Anda harus login untuk mengirim RFQ" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { folderName, items, clientData, action } = body;

    // === H6: Input Sanitization ===
    // Validasi field wajib
    if (!folderName || !items || !clientData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Sanitasi folderName
    const sanitizedFolderName = sanitizeString(folderName, MAX_FOLDER_NAME_LENGTH);
    if (!sanitizedFolderName) {
      return NextResponse.json(
        { error: "Nama folder tidak valid" },
        { status: 400 }
      );
    }

    // === H7: Limit jumlah item RFQ ===
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Item RFQ tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (items.length > MAX_RFQ_ITEMS) {
      return NextResponse.json(
        { error: `Maksimal ${MAX_RFQ_ITEMS} item per RFQ. Anda mengirim ${items.length} item.` },
        { status: 400 }
      );
    }

    // Validasi email klien
    if (!clientData.email || !isValidEmail(String(clientData.email))) {
      return NextResponse.json(
        { error: "Email klien tidak valid" },
        { status: 400 }
      );
    }

    // Sanitasi semua item
    const sanitizedItems = items.map((item: Record<string, string | number>) =>
      sanitizeRFQItem(item)
    );

    // Sanitasi data klien
    const sanitizedClientData = sanitizeClientData(clientData);

    // If action is "submit", process as RFQ submission
    if (action === "submit") {
      // Get subdomain from request header (set by middleware) or query param
      const subdomain = getSubdomainFromRequest(request);

      const result = await processRFQSubmission({
        folderId: body.folderId || sanitizedFolderName,
        folderName: sanitizedFolderName,
        items: sanitizedItems,
        subdomain,
        clientData: sanitizedClientData,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.message },
          { status: 500 }
        );
      }

      // NOTE: Pricing summary TIDAK dikirim ke client.
      // Formula harga tetap di sisi sistem (server) dan hanya muncul di
      // PDF Processed RFQ (ReportType.PROCESSED_RESULT) yang dikirim via email
      // setelah review tim sales. Halaman RFQ juga tidak menampilkan estimasi harga.
      return NextResponse.json({
        success: true,
        rfqId: result.rfqId,
        status: result.status,
        message: result.message,
        submittedAt: new Date().toISOString(),
        // Info email yang dikirim (untuk debugging & UI display)
        email: result.email,
        // 2-PDF system info (untuk ditampilkan ke klien)
        pdfWorkflow: {
          raw: {
            type: "ORIGINAL_REQUEST",
            description:
              "Konfirmasi pengajuan (Raw RFQ) — dibuat & disimpan ke sistem, akan dikirim via email",
            // fileUrl sekarang sudah disimpan di tabel RFQReport oleh processRFQSubmission
          },
          processed: {
            type: "PROCESSED_RESULT",
            description:
              "Penawaran resmi (Processed RFQ) — dibuat saat status QUOTED, dikirim dalam 1x24 jam kerja via email",
          },
        },
      });
    }

    // Default action: Generate Raw RFQ PDF inline (untuk preview/download tanpa save ke DB)
    // Berguna saat klien ingin preview PDF sebelum submit, atau admin ingin re-generate.
    const subdomain = getSubdomainFromRequest(request);
    const pdfData: RFQPdfData = {
      rfqId: body.rfqId || `preview-${Date.now()}`,
      folderName: sanitizedFolderName,
      submittedAt: new Date(),
      subdomain,
      client: {
        name: sanitizedClientData.clientName,
        email: sanitizedClientData.email,
        phone: sanitizedClientData.phone,
        company: sanitizedClientData.companyName,
        companyAddress: sanitizedClientData.companyAddress,
      },
      items: sanitizedItems.map((item) => ({
        productName: item.productName,
        subcategory: item.subcategory,
        productSerial: undefined,
        quantity: item.quantity,
      })),
    };

    const pdfBuffer = await generateRawRFQPdf(pdfData);

    // H6: Sanitasi folderName untuk Content-Disposition header (header injection prevention)
    const safeFilename = sanitizeForHeader(sanitizedFolderName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RFQ-${safeFilename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
