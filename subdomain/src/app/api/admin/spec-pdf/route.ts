import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PDFDocument from "pdfkit";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSubdomainFromRequest } from "@/lib/get-subdomain-from-request";
import { SUBDOMAIN_DOMAINS, type Subdomain } from "@/lib/subdomain";

/**
 * POST /api/admin/spec-pdf
 * Generate a product specification PDF from manual content or specs data.
 * Admin only.
 *
 * Body: {
 *   productName: string;
 *   subcategory?: string;
 *   method: "manual" | "from-specs";
 *   manualContent?: string;       // For method="manual"
 *   specifications?: Array<{label: string; value: string}>; // For method="from-specs"
 * }
 */

// Font setup — same as public spec-pdf routes
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
  doc.registerFont("Helvetica", FONT_PATHS.regular);
  doc.registerFont("Helvetica-Bold", FONT_PATHS.bold);
  doc.registerFont("Helvetica-Oblique", FONT_PATHS.italic);
  doc.registerFont("Helvetica-BoldOblique", FONT_PATHS.boldItalic);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { productName, subcategory, method, manualContent, specifications } = body;

    // Get subdomain for dynamic branding
    const subdomain = getSubdomainFromRequest(request);
    const domainUrl = SUBDOMAIN_DOMAINS[subdomain as Subdomain] || "pju.dayaberkah.id";

    if (!productName) {
      return NextResponse.json({ error: "Nama produk wajib diisi" }, { status: 400 });
    }

    if (method === "manual" && !manualContent) {
      return NextResponse.json({ error: "Konten manual wajib diisi" }, { status: 400 });
    }

    if (method === "from-specs" && (!specifications || specifications.length === 0)) {
      return NextResponse.json({ error: "Spesifikasi teknis kosong" }, { status: 400 });
    }

    // Ensure directory exists
    const specsDir = path.join(process.cwd(), "public", "specs");
    await fs.mkdir(specsDir, { recursive: true });

    // Generate filename
    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const filename = `spec-${slug}.pdf`;
    const filePath = path.join(specsDir, filename);

    // Generate PDF in memory (avoids file-path issues in standalone builds)
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 60, bottom: 60, left: 50, right: 50 },
        font: FONT_PATHS.regular,
        info: {
          Title: `Spesifikasi ${productName}`,
          Author: "Arostech - Daya Berkah Sinergi",
          Subject: `Spesifikasi Produk ${productName}`,
        },
      });

      registerFonts(doc);

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("error", reject);

      // Header
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

      doc
        .fillColor("#d1fae5")
        .fontSize(10)
        .font("Helvetica")
        .text(`Daya Berkah Sinergi | ${domainUrl} | info@dayaberkah.id`, 50, 55);

      // Product Name
      doc
        .fillColor("#1f2937")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(productName, 50, 110);

      if (subcategory) {
        doc
          .fillColor("#6b7280")
          .fontSize(12)
          .font("Helvetica")
          .text(subcategory, 50, 138);
      }

      // Divider
      const dividerY = subcategory ? 165 : 145;
      doc
        .strokeColor("#e5e7eb")
        .lineWidth(1)
        .moveTo(50, dividerY)
        .lineTo(doc.page.width - 50, dividerY)
        .stroke();

      let currentY = dividerY + 20;

      if (method === "from-specs" && specifications) {
        doc
          .fillColor("#059669")
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("Spesifikasi Teknis", 50, currentY);

        currentY += 30;

        const tableWidth = doc.page.width - 100;
        const colLabelWidth = tableWidth * 0.4;
        const colValueWidth = tableWidth * 0.6;

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

        for (let i = 0; i < specifications.length; i++) {
          const spec = specifications[i];

          if (currentY > doc.page.height - 80) {
            doc.addPage();
            currentY = 60;
          }

          if (i % 2 === 0) {
            doc.rect(50, currentY - 3, tableWidth, 22).fill("#f9fafb");
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
      } else if (method === "manual" && manualContent) {
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
          .text(manualContent, 50, currentY, {
            width: doc.page.width - 100,
            lineGap: 4,
          });
      }

      // Footer
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

      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    // Save to file
    await fs.writeFile(filePath, pdfBuffer);

    const fileUrl = `/specs/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      filename,
      size: pdfBuffer.length,
    });
  } catch (error) {
    console.error("[Spec PDF API] Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat PDF spesifikasi" },
      { status: 500 }
    );
  }
}
