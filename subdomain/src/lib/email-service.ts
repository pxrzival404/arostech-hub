/**
 * Email Service untuk RFQ 2-PDF System
 *
 * Menggunakan Resend SDK untuk kirim email dengan PDF attachment:
 * 1. sendRawRFQEmail       — Kirim email konfirmasi pengajuan + Raw PDF attached
 * 2. sendProcessedRFQEmail — Kirim email penawaran resmi + Processed PDF attached
 *
 * Setelah email terkirim, update RFQReport.emailSentAt di database.
 *
 * Catatan: Resend domain yang sudah terverifikasi = dayaberkah.id.
 * Untuk development, gunakan onboarding@resend.dev sebagai from (free tier).
 */

import { Resend } from "resend";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import {
  rawRFQEmailTemplate,
  processedRFQEmailTemplate,
  getEmailSubject,
  type EmailTemplateData,
  type ProcessedEmailData,
} from "@/lib/email-templates";
import {
  SUBDOMAIN_BRAND_NAMES,
  type Subdomain,
} from "@/lib/subdomain";

// Re-export types agar caller (rfq-processor) bisa import dari satu tempat
export type { EmailTemplateData, ProcessedEmailData };

// ============================================================================
// CONSTANTS
// ============================================================================

/** Get brand name from subdomain */
function getBrandName(subdomain?: string): string {
  if (!subdomain || !Object.keys(SUBDOMAIN_BRAND_NAMES).includes(subdomain)) {
    return "Arostech PJU";
  }
  return SUBDOMAIN_BRAND_NAMES[subdomain as Subdomain];
}

/**
 * Sender email. Resend free tier mengizinkan:
 * - onboarding@resend.dev → kirim ke API creator's email saja (testing)
 * - noreply@dayaberkah.id → kirim ke siapa saja (jika domain terverifikasi)
 *
 * TODO: Setelah domain dayaberkah.id terverifikasi di Resend dashboard,
 * ganti ke `noreply@dayaberkah.id` untuk production.
 */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SALES_EMAIL = process.env.SALES_EMAIL || "info@dayaberkah.id";

// ============================================================================
// RESEND CLIENT (lazy init)
// ============================================================================

let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY tidak ditemukan di environment. Tambahkan di .env: RESEND_API_KEY=re_xxx"
    );
  }

  _resend = new Resend(apiKey);
  return _resend;
}

// ============================================================================
// TYPES
// ============================================================================

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt?: Date;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Baca PDF dari filesystem dan return sebagai Buffer */
async function readPdfFromUrl(fileUrl: string): Promise<Buffer | null> {
  try {
    // fileUrl format: /rfq-pdfs/{rfqId}-{type}.pdf
    const filePath = path.join(process.cwd(), "public", fileUrl);
    const buffer = await fs.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error(`[email-service] Failed to read PDF from ${fileUrl}:`, error);
    return null;
  }
}

/** Update RFQReport.emailSentAt setelah email terkirim */
async function markEmailSent(
  rfqId: string,
  reportType: "ORIGINAL_REQUEST" | "PROCESSED_RESULT",
  sentAt: Date
): Promise<void> {
  try {
    await db.rFQReport.updateMany({
      where: { rfqId, reportType },
      data: { emailSentAt: sentAt },
    });
  } catch (error) {
    console.error(`[email-service] Failed to update emailSentAt for ${rfqId}/${reportType}:`, error);
  }
}

// ============================================================================
// 1. SEND RAW RFQ EMAIL
// ============================================================================

/**
 * Kirim email konfirmasi pengajuan + Raw PDF attached.
 * Dipanggil setelah processRFQSubmission berhasil generate Raw PDF.
 *
 * @param data EmailTemplateData (rfqId, clientName, dll.)
 * @param pdfUrl URL publik PDF (untuk link download di email body)
 * @param recipientEmail Email klien (default: data.clientEmail)
 */
export async function sendRawRFQEmail(
  data: EmailTemplateData,
  pdfUrl: string,
  recipientEmail?: string
): Promise<SendEmailResult> {
  const to = recipientEmail || data.clientEmail;
  const sentAt = new Date();

  try {
    const resend = getResend();
    const htmlContent = rawRFQEmailTemplate({ ...data, pdfUrl });
    const subject = getEmailSubject("raw", data);

    // Baca PDF untuk attachment
    const pdfBuffer = await readPdfFromUrl(pdfUrl);
    const attachments =
      pdfBuffer !== null
        ? [
            {
              filename: `Raw-RFQ-${data.rfqId}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [];

    const { data: responseData, error } = await resend.emails.send({
      from: `${getBrandName(data.subdomain)} <${FROM_EMAIL}>`,
      to: [to],
      ...(SALES_EMAIL && SALES_EMAIL !== to ? { cc: [SALES_EMAIL] } : {}),
      subject,
      html: htmlContent,
      attachments,
      tags: [
        { name: "rfq_id", value: data.rfqId },
        { name: "email_type", value: "raw_rfq" },
        { name: "source", value: `arostech_${data.subdomain || "pju"}_system` },
      ],
    });

    if (error) {
      console.error(`[email-service] Resend API error (Raw RFQ ${data.rfqId}):`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `[email-service] Raw RFQ email sent: ${responseData?.id} → ${to} (RFQ ${data.rfqId})`
    );

    // Update DB: set emailSentAt di RFQReport(ORIGINAL_REQUEST)
    await markEmailSent(data.rfqId, "ORIGINAL_REQUEST", sentAt);

    return {
      success: true,
      messageId: responseData?.id,
      sentAt,
    };
  } catch (error) {
    console.error(`[email-service] sendRawRFQEmail failed for ${data.rfqId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// 2. SEND PROCESSED RFQ EMAIL
// ============================================================================

/**
 * Kirim email penawaran resmi + Processed PDF attached.
 * Dipanggil setelah updateRFQStatus("QUOTED") berhasil generate Processed PDF.
 *
 * @param data ProcessedEmailData (termasuk grandTotal, validUntil, dll.)
 * @param pdfUrl URL publik PDF (untuk link download di email body)
 * @param recipientEmail Email klien (default: data.clientEmail)
 */
export async function sendProcessedRFQEmail(
  data: ProcessedEmailData,
  pdfUrl: string,
  recipientEmail?: string
): Promise<SendEmailResult> {
  const to = recipientEmail || data.clientEmail;
  const sentAt = new Date();

  try {
    const resend = getResend();
    const htmlContent = processedRFQEmailTemplate({ ...data, pdfUrl });
    const subject = getEmailSubject("processed", data);

    // Baca PDF untuk attachment
    const pdfBuffer = await readPdfFromUrl(pdfUrl);
    const attachments =
      pdfBuffer !== null
        ? [
            {
              filename: `Processed-RFQ-${data.rfqId}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [];

    const { data: responseData, error } = await resend.emails.send({
      from: `${getBrandName(data.subdomain)} <${FROM_EMAIL}>`,
      to: [to],
      ...(SALES_EMAIL && SALES_EMAIL !== to ? { cc: [SALES_EMAIL] } : {}),
      subject,
      html: htmlContent,
      attachments,
      tags: [
        { name: "rfq_id", value: data.rfqId },
        { name: "email_type", value: "processed_rfq" },
        { name: "source", value: `arostech_${data.subdomain || "pju"}_system` },
      ],
    });

    if (error) {
      console.error(`[email-service] Resend API error (Processed RFQ ${data.rfqId}):`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `[email-service] Processed RFQ email sent: ${responseData?.id} → ${to} (RFQ ${data.rfqId})`
    );

    // Update DB: set emailSentAt di RFQReport(PROCESSED_RESULT)
    await markEmailSent(data.rfqId, "PROCESSED_RESULT", sentAt);

    return {
      success: true,
      messageId: responseData?.id,
      sentAt,
    };
  } catch (error) {
    console.error(`[email-service] sendProcessedRFQEmail failed for ${data.rfqId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// 3. HEALTH CHECK — verifikasi konfigurasi
// ============================================================================

/**
 * Cek apakah Resend terkonfigurasi dengan benar.
 * Return object dengan status setiap komponen.
 */
export function checkEmailConfig(): {
  hasApiKey: boolean;
  hasFromEmail: boolean;
  hasSalesEmail: boolean;
  fromEmail: string;
  salesEmail: string;
  isReady: boolean;
} {
  const hasApiKey = Boolean(process.env.RESEND_API_KEY);
  const hasFromEmail = Boolean(process.env.RESEND_FROM_EMAIL);
  const hasSalesEmail = Boolean(process.env.SALES_EMAIL);

  return {
    hasApiKey,
    hasFromEmail,
    hasSalesEmail,
    fromEmail: FROM_EMAIL,
    salesEmail: SALES_EMAIL,
    isReady: hasApiKey && hasFromEmail,
  };
}
