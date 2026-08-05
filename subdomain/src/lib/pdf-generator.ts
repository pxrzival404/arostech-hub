/**
 * PDF Generator untuk RFQ 2-PDF System
 *
 * Dua fungsi utama:
 * 1. generateRawRFQPdf       — PDF konfirmasi pengajuan, dikirim segera ke klien.
 *                              Berisi data mentah dari form RFQ (tanpa pricing).
 * 2. generateProcessedRFQPdf — PDF penawaran resmi, dikirim dalam 1x24 jam kerja.
 *                              Berisi data + pricing breakdown + estimasi pengiriman
 *                              + catatan + call-to-action.
 *
 * Catatan keamanan: formula pricing engine TIDAK PERNAH muncul di Raw PDF.
 * Hanya Processed PDF yang menampilkan angka harga final hasil perhitungan server.
 */

import PDFDocument from "pdfkit";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PricingBreakdown, formatRupiah } from "./pricing-engine";
import {
  SUBDOMAIN_BRAND_NAMES,
  SUBDOMAIN_TAGLINES,
  SUBDOMAIN_DOMAINS,
  type Subdomain,
} from "./subdomain";

// ============================================================================
// TYPES
// ============================================================================

export interface RFQPdfItem {
  productName: string;
  subcategory?: string | null;
  productSerial?: string | null;
  quantity: number;
}

export interface RFQPdfData {
  rfqId: string;
  folderName: string;
  submittedAt: Date;
  /** Subdomain kategori — menentukan branding (nama, tagline, domain) di PDF */
  subdomain?: string;
  client: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    companyAddress?: string | null;
  };
  items: RFQPdfItem[];
}

export interface ProcessedPDFOptions {
  /** Tanggal kadaluarsa penawaran (default: H+30 dari sekarang) */
  validUntil?: Date;
  /** Catatan tambahan dari tim sales */
  salesNotes?: string[];
  /** Nama sales yang menangani (untuk kontak di PDF Processed) */
  salesName?: string;
  /** URL gambar tanda tangan digital admin (opsional) */
  signatureUrl?: string;
}

// ============================================================================
// CONSTANTS — Brand styling
// ============================================================================

const COLORS = {
  emerald: [5, 150, 105] as [number, number, number],
  emeraldDark: [4, 120, 87] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  darkGray: [55, 65, 81] as [number, number, number],
  gray: [107, 114, 128] as [number, number, number],
  lightGray: [243, 244, 246] as [number, number, number],
  borderGray: [209, 213, 219] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
} as const;

const PAGE = {
  width: 595.28, // A4 width in points
  height: 841.89, // A4 height in points
  marginX: 50,
  marginTop: 50,
  marginBottom: 50,
  contentWidth: 495, // 595.28 - 50*2
} as const;

/** Default brand config (PJU) — used when subdomain is not specified */
const DEFAULT_BRAND = {
  name: "AROSTECH",
  subBrand: "PJU",
  tagline: "Solusi Penerangan Jalan Umum Terpercaya",
  contact: {
    email: "info@dayaberkah.id",
    phone: "+62 822-3026-1340",
    website: "pju.dayaberkah.id",
  },
} as const;

/** Lookup brand config based on subdomain */
function getBrandForSubdomain(subdomain?: string): typeof DEFAULT_BRAND {
  if (!subdomain || !Object.keys(SUBDOMAIN_BRAND_NAMES).includes(subdomain)) {
    return DEFAULT_BRAND;
  }
  const sub = subdomain as Subdomain;
  const brandFullName = SUBDOMAIN_BRAND_NAMES[sub]; // e.g. "Arostech Solar Panel"
  const parts = brandFullName.split(" "); // ["Arostech", "Solar", "Panel"]
  const subBrand = parts.slice(1).join(" "); // "Solar Panel"
  return {
    name: "AROSTECH",
    subBrand,
    tagline: SUBDOMAIN_TAGLINES[sub],
    contact: {
      email: "info@dayaberkah.id",
      phone: "+62 822-3026-1340",
      website: SUBDOMAIN_DOMAINS[sub],
    },
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/** Path ke font Liberation Sans (metric-compatible dengan Helvetica, support penuh) */
const FONT_PATHS = {
  regular: "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  bold: "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  italic: "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf",
  boldItalic: "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf",
} as const;

/** Track apakah font sudah di-register ke doc tertentu (hindari double-register) */
const registeredDocs = new WeakSet<PDFKit.PDFDocument>();

/**
 * Register font Liberation Sans ke document dengan nama standard PDFKit.
 * Dipanggil sekali per document. Setelah register, semua `.font('Helvetica*')`
 * akan otomatis pakai Liberation Sans TTF — bypass loading .afm files yang
 * broken di Next.js Turbopack (path resolve ke /ROOT/node_modules/...).
 */
function registerFonts(doc: PDFKit.PDFDocument): void {
  if (registeredDocs.has(doc)) return;
  registeredDocs.add(doc);

  doc.registerFont("Helvetica", FONT_PATHS.regular);
  doc.registerFont("Helvetica-Bold", FONT_PATHS.bold);
  doc.registerFont("Helvetica-Oblique", FONT_PATHS.italic);
  doc.registerFont("Helvetica-BoldOblique", FONT_PATHS.boldItalic);
}

/** Buat PDFDocument dasar dengan styling & metadata */
function createDoc(title: string, subdomain?: string): PDFKit.PDFDocument {
  const brand = getBrandForSubdomain(subdomain);
  const brandName = `Arostech ${brand.subBrand}`;
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: PAGE.marginTop,
      bottom: PAGE.marginBottom,
      left: PAGE.marginX,
      right: PAGE.marginX,
    },
    // Set font default ke TTF Liberation Sans langsung di constructor,
    // SUPAYA PDFKit tidak eager-load Helvetica.afm (yang broken di Turbopack).
    font: FONT_PATHS.regular,
    info: {
      Title: title,
      Author: brandName,
      Subject: "Request for Quotation",
      Producer: `${brandName} System`,
      Creator: "pdfkit",
    },
  });

  // Register font variants (Bold, Italic, BoldItalic) dengan nama standard PDFKit
  // agar call site `.font('Helvetica-Bold')` tetap work tanpa loading .afm files.
  registerFonts(doc);

  return doc;
}

/** Resolve logo path — works in both dev and standalone mode.
 *  Prefers PNG (PDFKit-safe) over WebP (PDFKit cannot render WebP). */
function resolveLogoPath(): string | null {
  // PNG first (PDFKit supports PNG/JPEG, NOT WebP)
  const candidates = [
    path.join(process.cwd(), "public", "images", "logo-arostech.png"),
    path.resolve(process.cwd(), "..", "..", "public", "images", "logo-arostech.png"),
  ];
  // __dirname based paths (work in compiled output)
  try {
    candidates.push(path.resolve(__dirname, "..", "public", "images", "logo-arostech.png"));
    candidates.push(path.resolve(__dirname, "..", "..", "public", "images", "logo-arostech.png"));
    candidates.push(path.resolve(__dirname, "..", "..", "..", "public", "images", "logo-arostech.png"));
  } catch { /* __dirname may not be available */ }
  // Fallback: try WebP paths (unlikely to work with PDFKit, but just in case)
  candidates.push(
    path.join(process.cwd(), "public", "images", "logo-arostech.webp"),
  );
  for (const candidate of candidates) {
    try {
      const { existsSync } = require("node:fs") as { existsSync: (p: string) => boolean };
      if (existsSync(candidate)) return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

/** Render header brand (logo + tagline + garis pemisah) — dipakai di semua PDF */
function renderHeader(doc: PDFKit.PDFDocument, subdomain?: string): void {
  const BRAND = getBrandForSubdomain(subdomain);
  // Logo image — resolve path for dev and standalone modes
  const logoPath = resolveLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, PAGE.marginX, 44, { width: 36, height: 36 });
    } catch {
      // Fallback jika logo gagal di-load: gambar placeholder kotak hijau
      doc.rect(PAGE.marginX, 44, 36, 36).fill(COLORS.emerald);
    }
  } else {
    // Fallback jika logo tidak ditemukan: gambar placeholder kotak hijau
    doc.rect(PAGE.marginX, 44, 36, 36).fill(COLORS.emerald);
  }

  // Brand name (shifted right to make room for logo)
  doc
    .fontSize(22)
    .fillColor(COLORS.emerald)
    .font("Helvetica-Bold")
    .text(BRAND.name, PAGE.marginX + 44, 50);

  // Sub-brand — positioned well after AROSTECH text to avoid overlap
  // AROSTECH at 22px ≈ 145px wide; start PJU at logo+44+150 to give ample space
  doc
    .fontSize(12)
    .fillColor(COLORS.emerald)
    .font("Helvetica")
    .text(BRAND.subBrand, PAGE.marginX + 44 + 150, 56);

  // Tagline
  doc
    .fontSize(9)
    .fillColor(COLORS.darkGray)
    .font("Helvetica")
    .text(BRAND.tagline, PAGE.marginX, 86);

  // Garis pemisah
  doc
    .moveTo(PAGE.marginX, 102)
    .lineTo(PAGE.marginX + PAGE.contentWidth, 102)
    .strokeColor(COLORS.emerald)
    .lineWidth(2)
    .stroke();
}

/** Render footer (garis + kontak + nomor halaman) — dipakai di semua PDF */
function renderFooter(doc: PDFKit.PDFDocument, subdomain?: string): void {
  const BRAND = getBrandForSubdomain(subdomain);
  // Flush untuk memastikan semua page ter-buffer sebelum kita iterate
  doc.flushPages();

  const range = doc.bufferedPageRange();
  const totalPages = range.count;

  for (let i = range.start; i < range.start + totalPages; i++) {
    doc.switchToPage(i);

    const footerY = PAGE.height - 60;

    // Garis pemisah footer
    doc
      .moveTo(PAGE.marginX, footerY)
      .lineTo(PAGE.marginX + PAGE.contentWidth, footerY)
      .strokeColor(COLORS.borderGray)
      .lineWidth(0.5)
      .stroke();

    // Info kontak
    doc
      .fontSize(7)
      .fillColor(COLORS.gray)
      .font("Helvetica")
      .text(
        `Dokumen ini dibuat secara otomatis oleh sistem Arostech ${BRAND.subBrand}.`,
        PAGE.marginX,
        footerY + 8
      )
      .text(
        `Hubungi kami: ${BRAND.contact.email} | ${BRAND.contact.phone} | ${BRAND.contact.website}`,
        PAGE.marginX,
        footerY + 20
      );

    // Nomor halaman (kanan bawah) — page number = i - range.start + 1
    const pageNum = i - range.start + 1;
    doc
      .fontSize(7)
      .fillColor(COLORS.gray)
      .font("Helvetica")
      .text(
        `Halaman ${pageNum} dari ${totalPages}`,
        PAGE.marginX + PAGE.contentWidth - 100,
        footerY + 20,
        { width: 100, align: "right" }
      );
  }

  // Switch ke page terakhir sebelum end() agar tidak ada konten tersisa di page kosong
  if (totalPages > 0) {
    doc.switchToPage(range.start + totalPages - 1);
  }
}

/** Tambah halaman baru + reset Y ke marginTop */
function newPage(doc: PDFKit.PDFDocument): number {
  doc.addPage();
  return PAGE.marginTop;
}

/** Render section title dengan styling konsisten */
function renderSectionTitle(
  doc: PDFKit.PDFDocument,
  y: number,
  title: string
): number {
  doc
    .fontSize(11)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text(title, PAGE.marginX, y);
  return y + 22;
}

/** Render box berisi key-value pairs (data klien) */
function renderKeyValueBox(
  doc: PDFKit.PDFDocument,
  y: number,
  rows: Array<[string, string]>,
  options: { boxColor?: [number, number, number]; borderColor?: [number, number, number] } = {}
): number {
  const boxColor = options.boxColor ?? COLORS.lightGray;
  const borderColor = options.borderColor ?? COLORS.borderGray;
  const rowHeight = 20;
  const boxHeight = rows.length * rowHeight + 10;

  // Background box
  doc
    .rect(PAGE.marginX, y - 5, PAGE.contentWidth, boxHeight)
    .fillAndStroke(boxColor, borderColor);

  // Rows
  rows.forEach(([label, value], i) => {
    const rowY = y + i * rowHeight;
    doc
      .fontSize(9)
      .fillColor(COLORS.gray)
      .font("Helvetica")
      .text(label, PAGE.marginX + 10, rowY, { width: 120 });

    doc
      .fontSize(9)
      .fillColor(COLORS.darkGray)
      .font("Helvetica-Bold")
      .text(value || "-", PAGE.marginX + 130, rowY, { width: PAGE.contentWidth - 140 });
  });

  return y + boxHeight + 10;
}

/** Render tabel produk — shared antara Raw & Processed PDF */
function renderProductTable(
  doc: PDFKit.PDFDocument,
  y: number,
  items: RFQPdfItem[],
  columns: Array<{ key: string; label: string; width: number; align?: "left" | "right" | "center" }>
): number {
  const tableX = PAGE.marginX;
  const rowHeight = 22;

  // Header row
  doc.rect(tableX, y - 3, PAGE.contentWidth, rowHeight).fill(COLORS.emerald);

  let x = tableX;
  columns.forEach((col) => {
    doc
      .fontSize(8)
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .text(col.label, x + 5, y + 2, {
        width: col.width - 10,
        align: col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
      });
    x += col.width;
  });

  y += rowHeight;

  // Data rows
  items.forEach((item, i) => {
    // Zebra striping
    if (i % 2 === 0) {
      doc.rect(tableX, y - 3, PAGE.contentWidth, rowHeight).fill(COLORS.lightGray);
    }

    const cells: Record<string, string> = {
      no: String(i + 1),
      productName: item.productName,
      subcategory: item.subcategory || "-",
      serial: item.productSerial || "-",
      qty: String(item.quantity),
    };

    x = tableX;
    columns.forEach((col) => {
      doc
        .fontSize(8)
        .fillColor(COLORS.darkGray)
        .font("Helvetica")
        .text(cells[col.key] || "-", x + 5, y + 2, {
          width: col.width - 10,
          align:
            col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
        });
      x += col.width;
    });

    y += rowHeight;

    // Pagination check
    if (y > PAGE.height - 100) {
      y = newPage(doc);
    }
  });

  return y;
}

/** Format tanggal Indonesia */
function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format tanggal + waktu Indonesia */
function formatTanggalWaktu(date: Date): string {
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Finalize document → return Buffer */
async function finalizeDoc(doc: PDFKit.PDFDocument, subdomain?: string): Promise<Buffer> {
  // Penting: panggil renderFooter SETELAH semua konten, sebelum end()
  renderFooter(doc, subdomain);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  return new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

// ============================================================================
// 1. RAW RFQ PDF — Konfirmasi pengajuan (dikirim segera)
// ============================================================================

/**
 * Generate PDF Raw RFQ — konfirmasi pengajuan.
 *
 * Berisi:
 * - Header brand
 * - Info dokumen (RFQ ID, tanggal submit, jenis dokumen)
 * - Data klien (perusahaan, alamat, kontak)
 * - Daftar produk (nama, kategori, serial, qty — TANPA harga)
 * - Catatan: penawaran resmi akan dikirim dalam 1x24 jam
 *
 * TIDAK MENGGAMBARKAN HARGA APAPUN — pricing engine dijalankan server-side
 * hanya untuk Processed PDF.
 */
export async function generateRawRFQPdf(data: RFQPdfData): Promise<Buffer> {
  const BRAND = getBrandForSubdomain(data.subdomain);
  const doc = createDoc(`Raw RFQ - ${data.folderName} - ${data.rfqId}`, data.subdomain);

  renderHeader(doc, data.subdomain);

  // ===== TITLE BLOCK =====
  doc
    .fontSize(16)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text("KONFIRMASI PENGAJUAN RFQ", PAGE.marginX, 124);

  doc
    .fontSize(9)
    .fillColor(COLORS.gray)
    .font("Helvetica")
    .text("(Raw RFQ — Dokumen ini adalah konfirmasi penerimaan pengajuan)", PAGE.marginX, 146);

  // ===== INFO DOKUMEN =====
  let y = 178;
  y = renderSectionTitle(doc, y, "INFORMASI DOKUMEN");

  const docInfo: Array<[string, string]> = [
    ["RFQ ID", data.rfqId],
    ["Tanggal Submit", formatTanggalWaktu(data.submittedAt)],
    ["Nama Folder / Proyek", data.folderName],
    ["Jenis Dokumen", "Konfirmasi Pengajuan (Raw RFQ)"],
    ["Status", "SUBMITTED — Diterima sistem, menunggu review tim sales"],
  ];
  y = renderKeyValueBox(doc, y, docInfo);

  // ===== DATA KLIEN =====
  y = renderSectionTitle(doc, y, "DATA KLIEN");

  const clientInfo: Array<[string, string]> = [
    ["Perusahaan", data.client.company || "-"],
    ["Alamat Perusahaan", data.client.companyAddress || "-"],
    ["Nama Kontak", data.client.name],
    ["Email", data.client.email],
    ["Telepon", data.client.phone || "-"],
  ];
  y = renderKeyValueBox(doc, y, clientInfo);

  // ===== DAFTAR PRODUK =====
  y = renderSectionTitle(doc, y, "DAFTAR PRODUK");

  const columns = [
    { key: "no", label: "No", width: 30 },
    { key: "productName", label: "Nama Produk", width: 200 },
    { key: "subcategory", label: "Kategori", width: 110 },
    { key: "serial", label: "Serial", width: 90 },
    { key: "qty", label: "Qty", width: 65, align: "right" as const },
  ];

  y = renderProductTable(doc, y, data.items, columns);

  // ===== SUMMARY BOX =====
  y += 5;
  const totalQty = data.items.reduce((sum, item) => sum + item.quantity, 0);
  doc
    .rect(PAGE.marginX, y - 3, PAGE.contentWidth, 22)
    .fillAndStroke(COLORS.lightGray, COLORS.borderGray);

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text("TOTAL", PAGE.marginX + 35, y + 2, { width: 195 });

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text(`${data.items.length} jenis produk`, PAGE.marginX + 235, y + 2, { width: 100 });

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text(`${totalQty} unit`, PAGE.marginX + 430, y + 2, { width: 60, align: "right" });

  y += 35;

  // Pagination check
  if (y > PAGE.height - 200) {
    y = newPage(doc);
  }

  // ===== INFO 2-PDF SYSTEM =====
  y = renderSectionTitle(doc, y, "ALUR PENGAJUAN 2-PDF");

  // Box info Raw PDF (light emerald fill, emerald border)
  const rawBoxY = y;
  doc
    .rect(PAGE.marginX, rawBoxY, PAGE.contentWidth, 50)
    .fillAndStroke(
      [236, 253, 245], // #ecfdf5 — light emerald
      COLORS.emerald
    );

  doc
    .fontSize(9)
    .fillColor([6, 95, 70]) // #065f46 — dark emerald
    .font("Helvetica-Bold")
    .text("Raw RFQ (Dokumen ini)", PAGE.marginX + 10, rawBoxY + 8);

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica")
    .text(
      "Konfirmasi penerimaan pengajuan Anda. Dikirim segera setelah form RFQ di-submit.",
      PAGE.marginX + 10,
      rawBoxY + 22,
      { width: PAGE.contentWidth - 20 }
    );

  y += 60;

  // Box info Processed PDF (slightly different emerald shade, emerald border)
  const processedBoxY = y;
  doc
    .rect(PAGE.marginX, processedBoxY, PAGE.contentWidth, 50)
    .fillAndStroke(
      [209, 250, 229], // #d1fae5 — slightly different emerald shade
      COLORS.emeraldDark
    );

  doc
    .fontSize(9)
    .fillColor([6, 78, 59]) // #064e3b — dark emerald
    .font("Helvetica-Bold")
    .text("Processed RFQ (Akan dikirim)", PAGE.marginX + 10, processedBoxY + 8);

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica")
    .text(
      "Penawaran resmi lengkap dengan harga, estimasi pengiriman, dan rekomendasi. " +
        "Dikirim dalam 1x24 jam kerja via email setelah review tim sales.",
      PAGE.marginX + 10,
      processedBoxY + 22,
      { width: PAGE.contentWidth - 20 }
    );

  y += 70;

  // ===== CATATAN PENUTUP =====
  if (y > PAGE.height - 150) {
    y = newPage(doc);
  }

  y = renderSectionTitle(doc, y, "CATATAN");

  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica")
    .text(
      "Pengajuan RFQ Anda telah diterima sistem dan akan segera direview oleh tim sales kami. " +
        "Penawaran resmi (Processed RFQ) lengkap dengan harga akan dikirim ke alamat email " +
        `(${data.client.email}) dalam waktu 1x24 jam kerja.`,
      PAGE.marginX,
      y,
      { width: PAGE.contentWidth, align: "left" }
    );

  y += 40;

  doc
    .fontSize(8)
    .fillColor(COLORS.gray)
    .font("Helvetica-Oblique")
    .text(
      "Jika memiliki pertanyaan mendesak, silakan hubungi tim sales kami di " +
        `${BRAND.contact.email} atau ${BRAND.contact.phone}.`,
      PAGE.marginX,
      y,
      { width: PAGE.contentWidth }
    );

  return finalizeDoc(doc, data.subdomain);
}

// ============================================================================
// 2. PROCESSED RFQ PDF — Penawaran resmi (dikirim 1x24 jam)
// ============================================================================

/**
 * Generate PDF Processed RFQ — penawaran resmi.
 *
 * Berisi:
 * - Header brand
 * - Info dokumen (RFQ ID, tanggal proses, valid until)
 * - Data klien
 * - Daftar produk DENGAN pricing per item (unit price, diskon, subtotal)
 * - Pricing summary (base total, total diskon, biaya instalasi, grand total)
 * - Estimasi pengiriman
 * - Catatan dari tim sales
 * - Rekomendasi produk (call-to-action)
 * - Tanda tangan digital
 *
 * Harga dihitung server-side oleh pricing-engine.ts dan TIDAK ditampilkan
 * formula perhitungannya — hanya hasil akhir.
 */
export async function generateProcessedRFQPdf(
  data: RFQPdfData,
  pricing: PricingBreakdown,
  options: ProcessedPDFOptions = {}
): Promise<Buffer> {
  const BRAND = getBrandForSubdomain(data.subdomain);
  const validUntil = options.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // H+30
  const processedAt = new Date();

  const doc = createDoc(`Processed RFQ - ${data.folderName} - ${data.rfqId}`, data.subdomain);

  renderHeader(doc, data.subdomain);

  // ===== TITLE BLOCK =====
  doc
    .fontSize(16)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text("PENAWARAN RESMI RFQ", PAGE.marginX, 124);

  doc
    .fontSize(9)
    .fillColor(COLORS.gray)
    .font("Helvetica")
    .text("(Processed RFQ — Penawaran resmi hasil review tim sales)", PAGE.marginX, 146);

  // ===== INFO DOKUMEN =====
  let y = 178;
  y = renderSectionTitle(doc, y, "INFORMASI DOKUMEN");

  const docInfo: Array<[string, string]> = [
    ["RFQ ID", data.rfqId],
    ["Tanggal Pengajuan", formatTanggalWaktu(data.submittedAt)],
    ["Tanggal Diproses", formatTanggalWaktu(processedAt)],
    ["Nama Folder / Proyek", data.folderName],
    ["Jenis Dokumen", "Penawaran Resmi (Processed RFQ)"],
    ["Berlaku Hingga", formatTanggal(validUntil)],
    ["Status", "QUOTED — Penawaran diberikan, menunggu konfirmasi klien"],
  ];
  y = renderKeyValueBox(doc, y, docInfo);

  // ===== DATA KLIEN =====
  y = renderSectionTitle(doc, y, "DATA KLIEN");

  const clientInfo: Array<[string, string]> = [
    ["Perusahaan", data.client.company || "-"],
    ["Alamat Perusahaan", data.client.companyAddress || "-"],
    ["Nama Kontak", data.client.name],
    ["Email", data.client.email],
    ["Telepon", data.client.phone || "-"],
  ];
  y = renderKeyValueBox(doc, y, clientInfo);

  // ===== TABEL PRODUK + PRICING =====
  y = renderSectionTitle(doc, y, "RINCIAN PENAWARAN");

  const columns = [
    { key: "no", label: "No", width: 25 },
    { key: "productName", label: "Nama Produk", width: 130 },
    { key: "subcategory", label: "Kategori", width: 75 },
    { key: "qty", label: "Qty", width: 35, align: "right" as const },
    { key: "unitPrice", label: "Harga/Unit", width: 80, align: "right" as const },
    { key: "discount", label: "Diskon", width: 50, align: "right" as const },
    { key: "subtotal", label: "Subtotal", width: 100, align: "right" as const },
  ];

  // Header row
  const tableX = PAGE.marginX;
  const rowHeight = 22;
  doc.rect(tableX, y - 3, PAGE.contentWidth, rowHeight).fill(COLORS.emerald);

  let x = tableX;
  columns.forEach((col) => {
    doc
      .fontSize(7)
      .fillColor(COLORS.white)
      .font("Helvetica-Bold")
      .text(col.label, x + 3, y + 2, {
        width: col.width - 6,
        align:
          col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
      });
    x += col.width;
  });

  y += rowHeight;

  // Data rows with pricing
  pricing.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.rect(tableX, y - 3, PAGE.contentWidth, rowHeight).fill(COLORS.lightGray);
    }

    const cells: Record<string, string> = {
      no: String(i + 1),
      productName: item.productName,
      subcategory: item.subcategory,
      qty: String(item.quantity),
      unitPrice: formatRupiah(item.unitPrice),
      discount: item.discountPercent > 0 ? `${item.discountPercent}%` : "-",
      subtotal: formatRupiah(item.discountedSubtotal),
    };

    x = tableX;
    columns.forEach((col) => {
      doc
        .fontSize(7)
        .fillColor(COLORS.darkGray)
        .font(col.key === "subtotal" ? "Helvetica-Bold" : "Helvetica")
        .text(cells[col.key] || "-", x + 3, y + 2, {
          width: col.width - 6,
          align:
            col.align === "right" ? "right" : col.align === "center" ? "center" : "left",
        });
      x += col.width;
    });

    y += rowHeight;

    if (y > PAGE.height - 150) {
      y = newPage(doc);
    }
  });

  // ===== PRICING SUMMARY =====
  y += 5;

  // Summary box di kanan (lebar 250)
  const summaryBoxWidth = 250;
  const summaryBoxX = PAGE.marginX + PAGE.contentWidth - summaryBoxWidth;
  const summaryRows: Array<[string, string, boolean]> = [
    ["Subtotal", formatRupiah(pricing.baseTotal), false],
    ["Diskon", `- ${formatRupiah(pricing.totalDiscount)}`, false],
  ];

  if (pricing.installationFee > 0) {
    summaryRows.push([
      "Biaya Instalasi",
      formatRupiah(pricing.installationFee),
      false,
    ]);
  }

  const summaryBoxHeight = (summaryRows.length + 1) * 22 + 10;

  doc
    .rect(summaryBoxX, y - 3, summaryBoxWidth, summaryBoxHeight)
    .fillAndStroke(COLORS.lightGray, COLORS.borderGray);

  let summaryY = y + 5;
  summaryRows.forEach(([label, value]) => {
    doc
      .fontSize(8)
      .fillColor(COLORS.gray)
      .font("Helvetica")
      .text(label, summaryBoxX + 10, summaryY, { width: 130 });

    doc
      .fontSize(8)
      .fillColor(COLORS.darkGray)
      .font("Helvetica")
      .text(value, summaryBoxX + 140, summaryY, { width: 100, align: "right" });

    summaryY += 22;
  });

  // Grand total (highlight)
  doc
    .rect(summaryBoxX + 5, summaryY - 3, summaryBoxWidth - 10, 26)
    .fill(COLORS.emerald);

  doc
    .fontSize(9)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text("GRAND TOTAL", summaryBoxX + 15, summaryY + 4, { width: 130 });

  doc
    .fontSize(10)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text(formatRupiah(pricing.grandTotal), summaryBoxX + 140, summaryY + 3, {
      width: 100,
      align: "right",
    });

  y = Math.max(y + summaryBoxHeight + 10, summaryY + 30);

  // Pagination check
  if (y > PAGE.height - 200) {
    y = newPage(doc);
  }

  // ===== ESTIMASI PENGIRIMAN =====
  y = renderSectionTitle(doc, y, "ESTIMASI PENGIRIMAN");

  const estimasiInfo: Array<[string, string]> = [
    [
      "Estimasi Waktu Pengiriman",
      `${pricing.estimatedDeliveryDays} hari kerja (setelah PO diterima)`,
    ],
    [
      "Catatan Pengiriman",
      "Pengiriman wilayah Surabaya dan sekitarnya gratis. Luar kota dikenakan biaya ongkir sesuai jasa ekspedisi.",
    ],
  ];
  y = renderKeyValueBox(doc, y, estimasiInfo);

  // ===== CATATAN =====
  y = renderSectionTitle(doc, y, "CATATAN");

  const allNotes = [...pricing.notes];
  if (options.salesNotes && options.salesNotes.length > 0) {
    allNotes.push(...options.salesNotes);
  }

  const notesBoxHeight = Math.max(allNotes.length * 16 + 20, 60);
  doc
    .rect(PAGE.marginX, y - 3, PAGE.contentWidth, notesBoxHeight)
    .fillAndStroke(COLORS.lightGray, COLORS.borderGray);

  let notesY = y + 8;
  allNotes.forEach((note) => {
    doc
      .fontSize(8)
      .fillColor(COLORS.darkGray)
      .font("Helvetica")
      .text(`• ${note}`, PAGE.marginX + 10, notesY, {
        width: PAGE.contentWidth - 20,
      });
    notesY += 16;
  });

  y += notesBoxHeight + 15;

  // Pagination check
  if (y > PAGE.height - 150) {
    y = newPage(doc);
  }

  // ===== CALL TO ACTION =====
  y = renderSectionTitle(doc, y, "LANGKAH SELANJUTNYA");

  const ctaBoxY = y;
  doc
    .rect(PAGE.marginX, ctaBoxY, PAGE.contentWidth, 60)
    .fill(COLORS.emerald);

  doc
    .fontSize(9)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text("Konfirmasi Penawaran Ini", PAGE.marginX + 10, ctaBoxY + 10, {
      width: PAGE.contentWidth - 20,
    });

  doc
    .fontSize(8)
    .fillColor(COLORS.white)
    .font("Helvetica")
    .text(
      `Penawaran berlaku hingga ${formatTanggal(validUntil)}. Untuk konfirmasi pemesanan atau ` +
        `pertanyaan lebih lanjut, silakan hubungi tim sales kami:`,
      PAGE.marginX + 10,
      ctaBoxY + 25,
      { width: PAGE.contentWidth - 20 }
    );

  doc
    .fontSize(8)
    .fillColor(COLORS.white)
    .font("Helvetica-Bold")
    .text(
      `${BRAND.contact.email} | ${BRAND.contact.phone}${options.salesName ? ` | Att: ${options.salesName}` : ""}`,
      PAGE.marginX + 10,
      ctaBoxY + 45,
      { width: PAGE.contentWidth - 20 }
    );

  y += 80;

  // ===== TANDA TANGAN =====
  if (y > PAGE.height - 130) {
    y = newPage(doc);
  }

  y = renderSectionTitle(doc, y, "TANDA TANGAN");

  const sigX = PAGE.marginX + PAGE.contentWidth - 200;
  doc
    .fontSize(8)
    .fillColor(COLORS.darkGray)
    .font("Helvetica")
    .text("Hormat kami,", sigX, y);

  // Signature image or placeholder
  let signatureEmbedded = false;
  if (options.signatureUrl) {
    try {
      let signatureBuffer: Buffer | null = null;

      // Try reading from local filesystem first (e.g. /signatures/sig-xxx.png)
      if (options.signatureUrl.startsWith("/signatures/") || options.signatureUrl.startsWith("/public/")) {
        const localPath = path.join(process.cwd(), "public", options.signatureUrl.startsWith("/public/") ? options.signatureUrl.slice("/public/".length) : options.signatureUrl);
        try {
          const { existsSync } = require("node:fs") as { existsSync: (p: string) => boolean };
          if (existsSync(localPath)) {
            const { readFile } = require("node:fs/promises") as { readFile: (p: string) => Promise<Buffer> };
            signatureBuffer = await readFile(localPath);
          }
        } catch {
          // Try alternative paths for standalone mode
          const altPaths = [
            path.resolve(process.cwd(), "..", "..", "public", options.signatureUrl.replace(/^\//, "")),
            path.resolve(__dirname || ".", "..", "public", options.signatureUrl.replace(/^\//, "")),
          ];
          for (const altPath of altPaths) {
            try {
              const { existsSync: ex } = require("node:fs") as { existsSync: (p: string) => boolean };
              if (ex(altPath)) {
                const { readFile: rf } = require("node:fs/promises") as { readFile: (p: string) => Promise<Buffer> };
                signatureBuffer = await rf(altPath);
                break;
              }
            } catch { /* try next */ }
          }
        }
      }

      // Fallback: fetch from URL (for backwards compatibility with remote URLs)
      if (!signatureBuffer && options.signatureUrl.startsWith("http")) {
        const response = await fetch(options.signatureUrl);
        if (response.ok) {
          signatureBuffer = Buffer.from(await response.arrayBuffer());
        }
      }

      if (signatureBuffer) {
        doc.image(signatureBuffer, sigX + 30, y + 12, { width: 140, height: 50 });
        signatureEmbedded = true;
      }
    } catch (sigError) {
      console.error("[PDF] Failed to embed signature image:", sigError);
    }
  }

  if (!signatureEmbedded) {
    doc
      .fontSize(8)
      .fillColor(COLORS.gray)
      .font("Helvetica-Oblique")
      .text("[ Tanda tangan digital ]", sigX, y + 35, { width: 200, align: "center" });
  }

  doc
    .moveTo(sigX, y + 65)
    .lineTo(sigX + 200, y + 65)
    .strokeColor(COLORS.borderGray)
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(9)
    .fillColor(COLORS.darkGray)
    .font("Helvetica-Bold")
    .text(options.salesName || `Tim Sales Arostech ${getBrandForSubdomain(data.subdomain).subBrand}`, sigX, y + 70, {
      width: 200,
      align: "center",
    });

  doc
    .fontSize(8)
    .fillColor(COLORS.gray)
    .font("Helvetica")
    .text(`Arostech ${getBrandForSubdomain(data.subdomain).subBrand} — Daya Berkah Sinergi`, sigX, y + 84, {
      width: 200,
      align: "center",
    });

  return finalizeDoc(doc, data.subdomain);
}

// ============================================================================
// 3. SAVE HELPER — simpan PDF ke filesystem
// ============================================================================

/**
 * Simpan PDF buffer ke filesystem dan return URL publik.
 *
 * Lokasi penyimpanan: /public/rfq-pdfs/{rfqId}-{type}.pdf
 * URL akses: /rfq-pdfs/{rfqId}-{type}.pdf
 *
 * Catatan security: file tersimpan di /public sehingga URL bisa di-tebak.
 * Untuk production, pertimbangkan:
 * - Signed URL dengan expiry
 * - Storage di S3/R2 dengan pre-signed URL
 * - Aturan akses via middleware (cek session)
 */
export async function saveRFQPdf(
  buffer: Buffer,
  rfqId: string,
  type: "raw" | "processed"
): Promise<{ url: string; path: string }> {
  const outputDir = path.join(process.cwd(), "public", "rfq-pdfs");
  const filename = `${rfqId}-${type}.pdf`;
  const fullPath = path.join(outputDir, filename);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(fullPath, buffer);

  return {
    url: `/rfq-pdfs/${filename}`,
    path: fullPath,
  };
}

// ============================================================================
// 4. ORCHESTRATOR — generate + save + return metadata
// ============================================================================

export interface GeneratedPdfResult {
  url: string;
  path: string;
  size: number;
  generatedAt: Date;
}

/**
 * Generate Raw RFQ PDF + simpan ke filesystem.
 * Dipanggil saat RFQ di-submit (segera).
 */
export async function generateAndSaveRawPdf(
  data: RFQPdfData
): Promise<GeneratedPdfResult> {
  const buffer = await generateRawRFQPdf(data);
  const saved = await saveRFQPdf(buffer, data.rfqId, "raw");

  return {
    url: saved.url,
    path: saved.path,
    size: buffer.length,
    generatedAt: new Date(),
  };
}

/**
 * Generate Processed RFQ PDF + simpan ke filesystem.
 * Dipanggil saat tim sales menandai RFQ sebagai QUOTED (1x24 jam).
 */
export async function generateAndSaveProcessedPdf(
  data: RFQPdfData,
  pricing: PricingBreakdown,
  options?: ProcessedPDFOptions
): Promise<GeneratedPdfResult> {
  const buffer = await generateProcessedRFQPdf(data, pricing, options);
  const saved = await saveRFQPdf(buffer, data.rfqId, "processed");

  return {
    url: saved.url,
    path: saved.path,
    size: buffer.length,
    generatedAt: new Date(),
  };
}
