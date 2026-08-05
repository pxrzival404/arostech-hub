/**
 * Product Specification PDF Generator
 *
 * Generates a professional PDF from product technical specifications.
 * Used when specificationMethod = "from_tech_specs" or "manual".
 * Reuses the same PDFKit setup and brand styling as the RFQ PDF generator.
 */

import PDFDocument from "pdfkit";
import { promises as fs } from "node:fs";
import path from "node:path";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductSpecData {
  productName: string;
  subcategory: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  highlights: string[];
  category: string;
  /** Subdomain kategori — menentukan branding (nama, tagline, domain) di PDF */
  subdomain?: string;
}

// ============================================================================
// CONSTANTS — Brand styling (match RFQ PDF)
// ============================================================================

const COLORS = {
  emerald: [5, 150, 105] as [number, number, number],
  emeraldDark: [4, 120, 87] as [number, number, number],
  darkGray: [55, 65, 81] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  borderGray: [209, 213, 219] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 50,
  marginTop: 50,
  marginBottom: 60,
  contentWidth: 495,
};

const DEFAULT_BRAND = {
  name: "AROSTECH",
  tagline: "Solusi PJU & Energi Terbarukan Profesional",
  contact: "info@dayaberkah.id | +62 822-3026-1340 | www.arostech.com",
};

const SUBDOMAIN_BRAND: Record<string, { tagline: string }> = {
  pju: { tagline: "Solusi PJU & Energi Terbarukan Profesional" },
  baterai: { tagline: "Solusi Baterai & Penyimpanan Energi Terpercaya" },
  solarpanel: { tagline: "Solusi Panel Surya & Energi Terbarukan Terpercaya" },
  penangkalpetir: { tagline: "Solusi Penangkal Petir & Proteksi Kilat Terpercaya" },
};

function getBrandForSpec(subdomain?: string) {
  const base = { ...DEFAULT_BRAND };
  if (subdomain && SUBDOMAIN_BRAND[subdomain]) {
    base.tagline = SUBDOMAIN_BRAND[subdomain].tagline;
  }
  return base;
}

// ============================================================================
// FONT REGISTRATION — Match RFQ PDF generator's approach
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

  doc.registerFont("Helvetica", FONT_PATHS.regular);
  doc.registerFont("Helvetica-Bold", FONT_PATHS.bold);
  doc.registerFont("Helvetica-Oblique", FONT_PATHS.italic);
  doc.registerFont("Helvetica-BoldOblique", FONT_PATHS.boldItalic);
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Strip emoji/emoticon characters from a string.
 * Instead of trying to match all possible emoji ranges (which is fragile),
 * we use a whitelist approach: only keep characters that are known to render
 * correctly in PDFKit with Liberation Sans font (Latin, digits, common punctuation,
 * CJK ideographs, Indonesian diacritics, etc.)
 */
function stripEmojis(str: string): string {
  // Remove characters that are NOT in the safe rendering set
  // Safe: Latin letters, digits, common punctuation, CJK, Indonesian chars, spaces
  return str
    .replace(
      /[^\p{L}\p{N}\p{P}\p{Z}\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF\u3000-\u303F\uFF00-\uFFEF]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function renderHeader(doc: PDFKit.PDFDocument, subdomain?: string): void {
  const BRAND = getBrandForSpec(subdomain);
  // Brand name
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .fillColor(...COLORS.emerald)
    .text(BRAND.name, PAGE.marginX, PAGE.marginTop);

  // Tagline
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(...COLORS.gray)
    .text(BRAND.tagline, PAGE.marginX, PAGE.marginTop + 22);

  // Green line separator
  const lineY = PAGE.marginTop + 38;
  doc
    .moveTo(PAGE.marginX, lineY)
    .lineTo(PAGE.marginX + PAGE.contentWidth, lineY)
    .lineWidth(2)
    .strokeColor(...COLORS.emerald)
    .stroke();

  // Document title
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(...COLORS.gray)
    .text("SPESIFIKASI PRODUK", PAGE.marginX, lineY + 10, {
      width: PAGE.contentWidth,
      align: "right",
    });
}

function renderFooter(doc: PDFKit.PDFDocument, subdomain?: string): void {
  const BRAND = getBrandForSpec(subdomain);
  const footerY = PAGE.height - 35;
  doc
    .fontSize(7)
    .font("Helvetica")
    .fillColor(...COLORS.gray)
    .text(BRAND.contact, PAGE.marginX, footerY, {
      width: PAGE.contentWidth,
      align: "center",
    });
}

function checkPageBreak(
  doc: PDFKit.PDFDocument,
  needed: number,
  startY: number,
  subdomain?: string
): number {
  const bottomLimit = PAGE.height - PAGE.marginBottom;
  if (startY + needed > bottomLimit) {
    doc.addPage();
    renderHeader(doc, subdomain);
    renderFooter(doc, subdomain);
    return PAGE.marginTop + 55;
  }
  return startY;
}

function renderSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number,
  subdomain?: string
): number {
  y = checkPageBreak(doc, 30, y, subdomain);

  // Section label with emerald background
  const labelWidth = doc.font("Helvetica-Bold").fontSize(11).widthOfString(title) + 16;
  doc
    .roundedRect(PAGE.marginX, y, labelWidth, 22, 3)
    .fill(...COLORS.emerald);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(...COLORS.white)
    .text(title, PAGE.marginX + 8, y + 5, {
      width: labelWidth - 16,
    });

  return y + 30;
}

// ============================================================================
// MAIN GENERATOR
// ============================================================================

export async function generateProductSpecPdf(
  data: ProductSpecData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE.width, PAGE.height],
      margins: { top: PAGE.marginTop, bottom: PAGE.marginBottom, left: PAGE.marginX, right: PAGE.marginX },
      bufferPages: false,
      // Set font default ke TTF Liberation Sans langsung di constructor,
      // SUPAYA PDFKit tidak eager-load Helvetica.afm (yang broken di Turbopack/standalone).
      font: FONT_PATHS.regular,
      info: {
        Title: `Spesifikasi ${data.productName}`,
        Author: `Arostech ${data.subdomain === "solarpanel" ? "Solar Panel" : data.subdomain === "baterai" ? "Baterai" : data.subdomain === "penangkalpetir" ? "Penangkal Petir" : "PJU"}`,
        Subject: "Spesifikasi Produk",
        Producer: `Arostech ${data.subdomain === "solarpanel" ? "Solar Panel" : data.subdomain === "baterai" ? "Baterai" : data.subdomain === "penangkalpetir" ? "Penangkal Petir" : "PJU"} System`,
        Creator: "pdfkit",
      },
    });

    // Register font variants (Bold, Italic, BoldItalic) dengan nama standard PDFKit
    registerFonts(doc);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ─── Header ───────────────────────────────────────────────────────────
    renderHeader(doc, data.subdomain);
    renderFooter(doc, data.subdomain);

    let y = PAGE.marginTop + 65;

    // ─── Product Name ─────────────────────────────────────────────────────
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fillColor(...COLORS.darkGray)
      .text(data.productName, PAGE.marginX, y, {
        width: PAGE.contentWidth,
      });

    y = doc.y + 4;

    // ─── Category Badge ───────────────────────────────────────────────────
    const badgeText = data.subcategory || data.category;
    const badgeWidth = doc.font("Helvetica").fontSize(9).widthOfString(badgeText) + 16;
    doc
      .roundedRect(PAGE.marginX, y, badgeWidth, 20, 10)
      .fill(...COLORS.emerald);
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .fillColor(...COLORS.white)
      .text(badgeText, PAGE.marginX + 8, y + 5, {
        width: badgeWidth - 16,
        align: "center",
      });

    y += 30;

    // ─── Description ──────────────────────────────────────────────────────
    if (data.description) {
      y = checkPageBreak(doc, 60, y, data.subdomain);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(...COLORS.darkGray)
        .text(data.description, PAGE.marginX, y, {
          width: PAGE.contentWidth,
          lineGap: 3,
        });
      y = doc.y + 16;
    }

    // ─── Technical Specifications Table ───────────────────────────────────
    if (data.specifications.length > 0) {
      y = renderSectionTitle(doc, "Spesifikasi Teknis", y, data.subdomain);

      const tableWidth = PAGE.contentWidth;
      const colLabelWidth = 200;
      const colValueWidth = tableWidth - colLabelWidth;
      const rowHeight = 28;
      const headerHeight = 30;

      // Table header
      y = checkPageBreak(doc, headerHeight + rowHeight * 2, y, data.subdomain);
      doc
        .rect(PAGE.marginX, y, tableWidth, headerHeight)
        .fill(...COLORS.emerald);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(...COLORS.white)
        .text("Parameter", PAGE.marginX + 12, y + 9, { width: colLabelWidth - 24 })
        .text("Nilai", PAGE.marginX + colLabelWidth + 12, y + 9, { width: colValueWidth - 24 });

      y += headerHeight;

      // Table rows
      for (let i = 0; i < data.specifications.length; i++) {
        const spec = data.specifications[i];

        y = checkPageBreak(doc, rowHeight, y, data.subdomain);

        // Alternating row background
        if (i % 2 === 0) {
          doc
            .rect(PAGE.marginX, y, tableWidth, rowHeight)
            .fill(...COLORS.lightGray);
        }

        // Row border
        doc
          .moveTo(PAGE.marginX, y + rowHeight)
          .lineTo(PAGE.marginX + tableWidth, y + rowHeight)
          .lineWidth(0.5)
          .strokeColor(...COLORS.borderGray)
          .stroke();

        // Label
        doc
          .fontSize(9)
          .font("Helvetica-Bold")
          .fillColor(...COLORS.darkGray)
          .text(spec.label, PAGE.marginX + 12, y + 8, {
            width: colLabelWidth - 24,
            lineBreak: false,
            ellipsis: true,
          });

        // Value
        doc
          .font("Helvetica")
          .fillColor(...COLORS.gray)
          .text(spec.value, PAGE.marginX + colLabelWidth + 12, y + 8, {
            width: colValueWidth - 24,
            lineBreak: false,
            ellipsis: true,
          });

        y += rowHeight;
      }

      // Table bottom border
      doc
        .moveTo(PAGE.marginX, y)
        .lineTo(PAGE.marginX + tableWidth, y)
        .lineWidth(1)
        .strokeColor(...COLORS.emerald)
        .stroke();

      y += 20;
    }

    // ─── Highlights ───────────────────────────────────────────────────────
    if (data.highlights.length > 0) {
      y = renderSectionTitle(doc, "Keunggulan Produk", y, data.subdomain);

      for (const rawHighlight of data.highlights) {
        // Strip emoji/emoticon characters from highlight text
        const highlight = stripEmojis(rawHighlight);
        if (!highlight) continue; // Skip if nothing left after stripping

        y = checkPageBreak(doc, 22, y, data.subdomain);

        // Simple bullet point (solid circle)
        doc
          .circle(PAGE.marginX + 8, y + 7, 3)
          .fill(...COLORS.emerald);

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor(...COLORS.darkGray)
          .text(highlight, PAGE.marginX + 20, y + 2, {
            width: PAGE.contentWidth - 28,
          });

        y = Math.max(doc.y, y + 20) + 4;
      }

      y += 10;
    }

    // ─── Disclaimer / Footer Note ─────────────────────────────────────────
    y = checkPageBreak(doc, 60, y, data.subdomain);
    const disclaimerY = y + 20;
    doc
      .roundedRect(PAGE.marginX, disclaimerY, PAGE.contentWidth, 35, 4)
      .fill(...COLORS.lightGray);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(...COLORS.gray)
      .text(
        "Spesifikasi teknis bersifat indikatif dan dapat berubah tanpa pemberitahuan sebelumnya. Hubungi tim sales kami untuk informasi terbaru.",
        PAGE.marginX + 12,
        disclaimerY + 8,
        { width: PAGE.contentWidth - 24, lineGap: 2, continued: false }
      );

    doc
      .fontSize(8)
      .font("Helvetica-Bold")
      .fillColor(...COLORS.emerald)
      .text(
        "info@dayaberkah.id | +62 822-3026-1340",
        PAGE.marginX + 12,
        doc.y + 2,
        { width: PAGE.contentWidth - 24 }
      );

    // ─── Finalize ─────────────────────────────────────────────────────────
    doc.end();
  });
}

/**
 * Generate and save product spec PDF to filesystem.
 * Returns the public URL and file metadata.
 * Triggers GC after generation to free memory in low-memory environments.
 */
export async function generateAndSaveProductSpecPdf(
  data: ProductSpecData,
  slug: string
): Promise<{ url: string; path: string; size: number }> {
  const buffer = await generateProductSpecPdf(data);

  // Save to /public/product-spec-pdfs/{slug}.pdf
  const dir = path.join(process.cwd(), "public", "product-spec-pdfs");
  await fs.mkdir(dir, { recursive: true });

  const filename = `spec-${slug}.pdf`;
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);

  const result = {
    url: `/product-spec-pdfs/${filename}`,
    path: filePath,
    size: buffer.length,
  };

  // Force garbage collection if available (Node.js with --expose-gc)
  // This helps in low-memory environments (768MB limit)
  try {
    if (global.gc) {
      global.gc();
    }
  } catch {
    // GC not available, that's fine
  }

  return result;
}
