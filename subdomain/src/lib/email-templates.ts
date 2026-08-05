/**
 * Email Templates untuk RFQ 2-PDF System
 *
 * 2 template HTML untuk dikirim via Resend:
 * 1. rawRFQEmailTemplate       — Konfirmasi pengajuan (segera, dengan Raw PDF attached)
 * 2. processedRFQEmailTemplate — Penawaran resmi (1x24 jam, dengan Processed PDF attached)
 *
 * Styling: inline CSS (Resend lebih reliable dengan inline CSS daripada <style> tags).
 * Tema: emerald green konsisten dengan web Arostech.
 */

import {
  SUBDOMAIN_BRAND_NAMES,
  SUBDOMAIN_TAGLINES,
  SUBDOMAIN_DOMAINS,
  type Subdomain,
} from "./subdomain";

// ============================================================================
// TYPES
// ============================================================================

export interface EmailTemplateData {
  rfqId: string;
  folderName: string;
  clientName: string;
  clientEmail: string;
  companyName?: string | null;
  submittedAt: Date;
  totalItems: number;
  totalQuantity: number;
  pdfUrl: string; // URL publik PDF (untuk link download)
  /** Subdomain kategori — menentukan branding (nama, tagline, domain) di email */
  subdomain?: string;
}

export interface ProcessedEmailData extends EmailTemplateData {
  grandTotal: number;
  grandTotalFormatted: string;
  baseTotal?: number;
  baseTotalFormatted?: string;
  totalDiscount?: number;
  totalDiscountFormatted?: string;
  shippingCost?: number;
  shippingCostFormatted?: string;
  validUntil: Date;
  salesName?: string;
  estimatedDeliveryDays: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTanggal(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalWaktu(date: Date): string {
  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBrandForSubdomain(subdomain?: string) {
  const sub = (subdomain && Object.keys(SUBDOMAIN_BRAND_NAMES).includes(subdomain)) ? subdomain as Subdomain : "pju" as Subdomain;
  return {
    name: SUBDOMAIN_BRAND_NAMES[sub],          // e.g. "Arostech Solar Panel"
    tagline: SUBDOMAIN_TAGLINES[sub],           // e.g. "Solusi Panel Surya & Energi Terbarukan Terpercaya"
    website: SUBDOMAIN_DOMAINS[sub],            // e.g. "solarpanel.dayaberkah.id"
    company: "Daya Berkah Sinergi",
    email: "info@dayaberkah.id",
    phone: "+62 822-3026-1340",
  };
}

// ============================================================================
// 1. RAW RFQ EMAIL TEMPLATE
// ============================================================================

export function rawRFQEmailTemplate(data: EmailTemplateData): string {
  const BRAND = getBrandForSubdomain(data.subdomain);
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pengajuan RFQ - ${data.rfqId}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">${escapeHtml(BRAND.name.toUpperCase())}</h1>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:13px;letter-spacing:0.3px;">${escapeHtml(BRAND.tagline)}</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#ecfdf5;padding:16px 40px;border-bottom:1px solid #d1fae5;">
              <p style="margin:0;color:#065f46;font-size:14px;font-weight:600;text-align:center;">
                ✓ Pengajuan RFQ Anda Telah Diterima
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;color:#1f2937;font-size:20px;font-weight:600;">Halo ${escapeHtml(data.clientName)},</h2>
              
              <p style="margin:0 0 16px;color:#4b5563;font-size:14px;">
                Terima kasih telah mengajukan Request for Quotation (RFQ) di ${BRAND.name}. Pengajuan Anda telah kami terima dan
                sedang dalam proses review oleh tim sales kami. Berikut adalah detail pengajuan Anda:
              </p>

              <!-- Detail Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;width:140px;">RFQ ID</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;font-family:monospace;">${escapeHtml(data.rfqId)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Nama Proyek</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${escapeHtml(data.folderName)}</td>
                      </tr>
                      ${data.companyName ? `
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Perusahaan</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${escapeHtml(data.companyName)}</td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Tanggal Submit</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${formatTanggalWaktu(data.submittedAt)} WIB</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Total Item</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${data.totalItems} jenis produk (${data.totalQuantity} unit)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- PDF Download CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border:1px solid #fde68a;border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:600;">
                      📄 Dokumen Raw RFQ (Konfirmasi Pengajuan)
                    </p>
                    <p style="margin:0 0 12px;color:#78350f;font-size:12px;">
                      Dokumen konfirmasi pengajuan Anda terlampir di email ini. Klik tombol di bawah untuk download
                      jika lampiran tidak terbaca.
                    </p>
                    <a href="${escapeHtml(data.pdfUrl)}" style="display:inline-block;background-color:#d97706;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;">
                      Download Raw RFQ PDF
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h3 style="margin:24px 0 12px;color:#1f2937;font-size:15px;font-weight:600;">Langkah Selanjutnya</h3>
              <ol style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:13px;">
                <li style="margin-bottom:8px;">
                  <strong>Review tim sales</strong> — Tim kami akan mereview pengajuan Anda dalam 1x24 jam kerja.
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Penawaran resmi (Processed RFQ)</strong> — Anda akan menerima email kedua berisi
                  penawaran lengkap dengan harga, estimasi pengiriman, dan rekomendasi.
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Konfirmasi pesanan</strong> — Balas email penawaran untuk konfirmasi, atau hubungi
                  tim sales kami untuk pertanyaan.
                </li>
              </ol>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1f2937;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                Email ini dikirim otomatis oleh sistem ${BRAND.name}. Mohon tidak membalas email ini.
              </p>
              <p style="margin:0 0 4px;color:#d1d5db;font-size:13px;font-weight:600;">${BRAND.name} — ${BRAND.company}</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                ${BRAND.email} • ${BRAND.phone} • ${BRAND.website}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

// ============================================================================
// 2. PROCESSED RFQ EMAIL TEMPLATE
// ============================================================================

export function processedRFQEmailTemplate(data: ProcessedEmailData): string {
  const BRAND = getBrandForSubdomain(data.subdomain);
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Penawaran Resmi RFQ - ${data.rfqId}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">${escapeHtml(BRAND.name.toUpperCase())}</h1>
              <p style="margin:4px 0 0;color:#d1fae5;font-size:13px;letter-spacing:0.3px;">${escapeHtml(BRAND.tagline)}</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color:#fef3c7;padding:16px 40px;border-bottom:1px solid #fde68a;">
              <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;text-align:center;">
                ⏳ Penawaran Resmi Siap — Berlaku hingga ${formatTanggal(data.validUntil)}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 16px;color:#1f2937;font-size:20px;font-weight:600;">Halo ${escapeHtml(data.clientName)},</h2>
              
              <p style="margin:0 0 16px;color:#4b5563;font-size:14px;">
                Terima kasih telah menunggu. Setelah review mendalam terhadap pengajuan RFQ Anda, dengan ini kami
                sampaikan penawaran resmi lengkap dengan harga dan estimasi pengiriman. Berikut ringkasan penawaran:
              </p>

              <!-- Detail Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;width:140px;">RFQ ID</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;font-family:monospace;">${escapeHtml(data.rfqId)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Nama Proyek</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${escapeHtml(data.folderName)}</td>
                      </tr>
                      ${data.companyName ? `
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Perusahaan</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${escapeHtml(data.companyName)}</td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Tanggal Pengajuan</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${formatTanggalWaktu(data.submittedAt)} WIB</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Estimasi Pengiriman</td>
                        <td style="padding:4px 0;color:#1f2937;font-size:13px;font-weight:600;">${data.estimatedDeliveryDays} hari kerja (setelah PO)</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#6b7280;font-size:13px;">Berlaku Hingga</td>
                        <td style="padding:4px 0;color:#dc2626;font-size:13px;font-weight:600;">${formatTanggal(data.validUntil)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Pricing Breakdown (if discount or shipping exists) -->
              ${(data.baseTotal != null && data.baseTotal !== data.grandTotal) || data.shippingCost != null ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${data.baseTotal != null && data.baseTotalFormatted ? `
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Total Sebelum Diskon</td>
                        <td style="padding:6px 0;color:#1f2937;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(data.baseTotalFormatted)}</td>
                      </tr>
                      ` : ""}
                      ${data.totalDiscount != null && data.totalDiscount > 0 && data.totalDiscountFormatted ? `
                      <tr>
                        <td style="padding:6px 0;color:#059669;font-size:13px;font-weight:600;">Diskon</td>
                        <td style="padding:6px 0;color:#059669;font-size:13px;font-weight:600;text-align:right;">- ${escapeHtml(data.totalDiscountFormatted)}</td>
                      </tr>
                      ` : ""}
                      ${data.shippingCost != null && data.shippingCostFormatted ? `
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Biaya Pengiriman</td>
                        <td style="padding:6px 0;color:#1f2937;font-size:13px;font-weight:600;text-align:right;">${data.shippingCost === 0 ? 'Gratis' : escapeHtml(data.shippingCostFormatted)}</td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- Grand Total Highlight -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#059669 0%,#047857 100%);border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;color:#d1fae5;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Total Penawaran</p>
                    <p style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">${escapeHtml(data.grandTotalFormatted)}</p>
                    <p style="margin:4px 0 0;color:#a7f3d0;font-size:11px;">Termasuk ${data.totalItems} jenis produk • ${data.totalQuantity} unit</p>
                  </td>
                </tr>
              </table>

              <!-- PDF Download CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border:1px solid #fde68a;border-radius:6px;margin:16px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:600;">
                      📄 Dokumen Processed RFQ (Penawaran Resmi Lengkap)
                    </p>
                    <p style="margin:0 0 12px;color:#78350f;font-size:12px;">
                      Dokumen lengkap dengan rincian harga per item, diskon, dan biaya instalasi terlampir di email ini.
                      Klik tombol di bawah untuk download jika lampiran tidak terbaca.
                    </p>
                    <a href="${escapeHtml(data.pdfUrl)}" style="display:inline-block;background-color:#d97706;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:4px;font-size:13px;font-weight:600;">
                      Download Processed RFQ PDF
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h3 style="margin:24px 0 12px;color:#1f2937;font-size:15px;font-weight:600;">Langkah Konfirmasi</h3>
              <ol style="margin:0 0 16px;padding-left:20px;color:#4b5563;font-size:13px;">
                <li style="margin-bottom:8px;">
                  <strong>Review penawaran</strong> — Buka PDF penawaran untuk melihat rincian lengkap harga per item.
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Konfirmasi PO</strong> — Balas email ini dengan menyatakan persetujuan, atau hubungi
                  ${data.salesName ? `tim sales kami (${escapeHtml(data.salesName)})` : 'tim sales kami'} di ${BRAND.email}.
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Penerbitan invoice</strong> — Setelah PO diterima, kami akan kirim invoice + jadwal pengiriman.
                </li>
              </ol>

              ${data.salesName ? `
              <p style="margin:16px 0 0;color:#6b7280;font-size:12px;font-style:italic;">
                Email ini ditandatangani secara digital oleh ${escapeHtml(data.salesName)} — ${BRAND.name}.
              </p>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1f2937;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                Email ini dikirim otomatis oleh sistem ${BRAND.name}. Mohon tidak membalas email ini.
              </p>
              <p style="margin:0 0 4px;color:#d1d5db;font-size:13px;font-weight:600;">${BRAND.name} — ${BRAND.company}</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                ${BRAND.email} • ${BRAND.phone} • ${BRAND.website}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

// ============================================================================
// UTIL
// ============================================================================

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getEmailSubject(type: "raw" | "processed", data: EmailTemplateData | ProcessedEmailData): string {
  const BRAND = getBrandForSubdomain(data.subdomain);
  if (type === "raw") {
    return `[Konfirmasi] Pengajuan RFQ ${data.rfqId} Diterima — ${BRAND.name}`;
  }
  return `[Penawaran] RFQ ${data.rfqId} — ${BRAND.name}`;
}
