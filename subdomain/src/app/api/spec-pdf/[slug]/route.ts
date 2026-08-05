import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/sanity/fetchers";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";
import { SUBDOMAIN_DOMAINS, SUBDOMAIN_BRAND_NAMES, type Subdomain } from "@/lib/subdomain";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// FONT SETUP — Use Liberation Sans TTF (always available on server)
// PDFKit's built-in Helvetica.afm is broken in standalone builds.
// ============================================================================

const FONT_PATHS = {
  regular: "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  bold: "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  italic: "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
  boldItalic: "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf",
} as const;

const registeredDocs = new WeakSet<PDFKit.PDFDocument>();

function registerFonts(doc: PDFKit.PDFDocument): void {
  if (registeredDocs.has(doc)) return;
  registeredDocs.add(doc);
  // Register TTF fonts under standard PDFKit font names
  doc.registerFont("Helvetica", FONT_PATHS.regular);
  doc.registerFont("Helvetica-Bold", FONT_PATHS.bold);
  doc.registerFont("Helvetica-Oblique", FONT_PATHS.italic);
  doc.registerFont("Helvetica-BoldOblique", FONT_PATHS.boldItalic);
}

// ============================================================================
// PDF GENERATION HELPERS
// ============================================================================

interface SpecPdfData {
  productName: string;
  subcategory?: string;
  description?: string;
  specifications?: Array<{ label: string; value: string }>;
  manualContent?: string;
  highlights?: string[];
  subdomain?: Subdomain;
}

function generateSpecPdf(data: SpecPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      // Use TTF as default font to avoid Helvetica.afm crash
      font: FONT_PATHS.regular,
      info: {
        Title: `Spesifikasi ${data.productName}`,
        Author: "Arostech - Daya Berkah Sinergi",
        Subject: `Spesifikasi Produk ${data.productName}`,
        Producer: SUBDOMAIN_BRAND_NAMES[data.subdomain || "pju"] + " System",
        Creator: "pdfkit",
      },
    });

    // Register font variants BEFORE any text rendering
    registerFonts(doc);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);

    // ─── Header ───────────────────────────────────────────────────────
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill("#059669");

    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("AROSTECH", 50, 25, { continued: true })
      .fontSize(14)
      .font("Helvetica")
      .text(" — Spesifikasi Produk", { continued: false });

    const domainLabel = SUBDOMAIN_DOMAINS[data.subdomain || "pju"];
    doc
      .fillColor("#d1fae5")
      .fontSize(10)
      .font("Helvetica")
      .text(`Daya Berkah Sinergi | ${domainLabel} | info@dayaberkah.id`, 50, 55);

    // ─── Product Name ─────────────────────────────────────────────────
    doc
      .fillColor("#1f2937")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(data.productName, 50, 110);

    if (data.subcategory) {
      doc
        .fillColor("#6b7280")
        .fontSize(12)
        .font("Helvetica")
        .text(data.subcategory, 50, 138);
    }

    // Divider
    const dividerY = data.subcategory ? 165 : 145;
    doc
      .strokeColor("#e5e7eb")
      .lineWidth(1)
      .moveTo(50, dividerY)
      .lineTo(doc.page.width - 50, dividerY)
      .stroke();

    let currentY = dividerY + 20;

    // ─── Description ──────────────────────────────────────────────────
    if (data.description) {
      doc
        .fillColor("#374151")
        .fontSize(10)
        .font("Helvetica")
        .text(data.description, 50, currentY, {
          width: doc.page.width - 100,
          lineGap: 3,
        });
      currentY = doc.y + 16;
    }

    // ─── Technical Specs Table (from-specs method) ────────────────────
    if (data.specifications && data.specifications.length > 0) {
      doc
        .fillColor("#059669")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Spesifikasi Teknis", 50, currentY);

      currentY += 30;

      const tableWidth = doc.page.width - 100;
      const colLabelWidth = tableWidth * 0.4;
      const colValueWidth = tableWidth * 0.6;

      // Table header
      doc
        .rect(50, currentY - 5, tableWidth, 25)
        .fill("#f0fdf4");

      doc
        .fillColor("#065f46")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Parameter", 55, currentY, { width: colLabelWidth })
        .text("Nilai", 55 + colLabelWidth, currentY, { width: colValueWidth });

      currentY += 25;

      for (let i = 0; i < data.specifications.length; i++) {
        const spec = data.specifications[i];

        // Page break check
        if (currentY > doc.page.height - 80) {
          doc.addPage();
          currentY = 60;
        }

        // Alternating row background
        if (i % 2 === 0) {
          doc
            .rect(50, currentY - 3, tableWidth, 22)
            .fill("#f9fafb");
        }

        doc
          .fillColor("#374151")
          .fontSize(10)
          .font("Helvetica-Bold")
          .text(spec.label || "", 55, currentY, { width: colLabelWidth });

        doc
          .fillColor("#4b5563")
          .font("Helvetica")
          .text(spec.value || "", 55 + colLabelWidth, currentY, { width: colValueWidth });

        currentY += 22;
      }

      currentY += 10;
    }

    // ─── Manual Content (manual method) ───────────────────────────────
    if (data.manualContent) {
      doc
        .fillColor("#059669")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Spesifikasi Produk", 50, currentY);

      currentY += 30;

      doc
        .fillColor("#374151")
        .fontSize(10.5)
        .font("Helvetica")
        .text(data.manualContent, 50, currentY, {
          width: doc.page.width - 100,
          lineGap: 4,
        });

      currentY = doc.y + 16;
    }

    // ─── Highlights ───────────────────────────────────────────────────
    if (data.highlights && data.highlights.length > 0) {
      if (currentY > doc.page.height - 120) {
        doc.addPage();
        currentY = 60;
      }

      doc
        .fillColor("#059669")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Keunggulan Produk", 50, currentY);

      currentY += 24;

      for (const rawHl of data.highlights) {
        // Strip emoji/emoticon — whitelist approach: only keep safe rendering chars
        const hl = rawHl
          .replace(/[^\p{L}\p{N}\p{P}\p{Z}\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/gu, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!hl) continue; // Skip if nothing left after stripping emojis
        if (currentY > doc.page.height - 80) {
          doc.addPage();
          currentY = 60;
        }

        // Simple bullet point (solid circle)
        doc
          .circle(58, currentY + 7, 3)
          .fill("#059669");

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor("#374151")
          .text(hl, 70, currentY, {
            width: doc.page.width - 170,
          });

        currentY = Math.max(doc.y, currentY + 18) + 4;
      }
    }

    // ─── Disclaimer ───────────────────────────────────────────────────
    if (currentY > doc.page.height - 110) {
      doc.addPage();
      currentY = 60;
    }

    currentY += 30;
    doc
      .roundedRect(50, currentY, doc.page.width - 100, 40, 4)
      .fill("#f3f4f6");

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#6b7280")
      .text(
        "Spesifikasi teknis bersifat indikatif dan dapat berubah tanpa pemberitahuan sebelumnya. Hubungi tim sales kami untuk informasi terbaru.",
        62,
        currentY + 8,
        { width: doc.page.width - 124, lineGap: 2 }
      );

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#059669")
      .text(
        "info@dayaberkah.id | +62 822-3026-1340",
        62,
        currentY + 26,
        { width: doc.page.width - 124 }
      );

    // ─── Footer ───────────────────────────────────────────────────────
    const footerY = doc.page.height - 45;
    doc
      .strokeColor("#e5e7eb")
      .lineWidth(0.5)
      .moveTo(50, footerY)
      .lineTo(doc.page.width - 50, footerY)
      .stroke();

    doc
      .fillColor("#9ca3af")
      .fontSize(8)
      .font("Helvetica")
      .text(
        `Dokumen ini dibuat otomatis oleh sistem Arostech | ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        50,
        footerY + 8,
        { align: "center", width: doc.page.width - 100 }
      );

    // ─── Finalize (register end listener BEFORE doc.end()) ───────────
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch product from Sanity — pass subdomain so non-PJU products are found
    const subdomain = getSubdomainFromRequest(request);
    const product = await getProductBySlug(slug, subdomain);

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    const method = product.specificationMethod || "from-specs";
    const hasSpecs = product.specifications && product.specifications.length > 0;
    const hasManual = !!product.specificationManualContent;
    const hasFileUrl = !!product.specificationFileUrl;
    // Check if the fileUrl is a remote URL ( Sanity CDN ) vs local path
    const isRemoteFileUrl = hasFileUrl && product.specificationFileUrl!.startsWith("http");

    // ─── Method: Upload — redirect to uploaded file URL ──────────────
    if (method === "upload" && hasFileUrl) {
      if (isRemoteFileUrl) {
        // Remote Sanity CDN URL — redirect directly
        return NextResponse.redirect(product.specificationFileUrl!);
      }
      // Local file path (e.g. /specs/product.pdf) — redirect as absolute URL
      return NextResponse.redirect(new URL(product.specificationFileUrl!, request.url));
    }

    // ─── Method: from-specs — generate PDF from technical specs ──────
    if (method === "from-specs" && hasSpecs) {
      const pdfBuffer = await generateSpecPdf({
        productName: product.name,
        subcategory: product.subcategory,
        description: product.description,
        specifications: product.specifications,
        highlights: product.highlights,
        subdomain,
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="spec-${slug}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // ─── Method: manual — generate PDF from manually written content ─
    if (method === "manual" && hasManual) {
      const pdfBuffer = await generateSpecPdf({
        productName: product.name,
        subcategory: product.subcategory,
        description: product.description,
        manualContent: product.specificationManualContent,
        highlights: product.highlights,
        subdomain,
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="spec-${slug}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // ─── Fallback: primary method's data is missing — try alternatives ─
    // This handles misconfigured products (e.g. method="manual" but no content)

    // Try specs first
    if (hasSpecs) {
      const pdfBuffer = await generateSpecPdf({
        productName: product.name,
        subcategory: product.subcategory,
        description: product.description,
        specifications: product.specifications,
        highlights: product.highlights,
        subdomain,
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="spec-${slug}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Try manual content
    if (hasManual) {
      const pdfBuffer = await generateSpecPdf({
        productName: product.name,
        subcategory: product.subcategory,
        description: product.description,
        manualContent: product.specificationManualContent,
        highlights: product.highlights,
        subdomain,
      });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="spec-${slug}.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Try file URL
    if (hasFileUrl) {
      if (isRemoteFileUrl) {
        return NextResponse.redirect(product.specificationFileUrl!);
      }
      return NextResponse.redirect(new URL(product.specificationFileUrl!, request.url));
    }

    // Nothing works
    return NextResponse.json(
      { error: "Produk ini belum memiliki data spesifikasi yang dapat diunduh" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Spec PDF API] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat PDF spesifikasi produk" },
      { status: 500 }
    );
  }
}
