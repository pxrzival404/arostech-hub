/**
 * RFQ Auto-Processing Engine — Hybrid Model
 *
 * Logic untuk auto-process RFQ setelah di-submit:
 *
 * HYBRID MODEL:
 * - Jika SEMUA item punya pricing FIXED dan tidak ada special notes → AUTO-QUOTE:
 *   Status langsung QUOTED, generate Raw PDF (konfirmasi) + Processed PDF (penawaran),
 *   kirim email konfirmasi Raw RFQ DAN email penawaran resmi Processed RFQ
 * - Jika ada item TIERED / tidak ada harga / ada catatan khusus → SUBMITTED:
 *   Menunggu review admin, generate Raw PDF + kirim email konfirmasi
 *
 * Flow:
 * 1. SUBMITTED → simpan ke DB, generate Raw PDF + kirim email konfirmasi
 * 2. AUTO-QUOTE → jika semua FIXED, langsung QUOTED, generate Raw PDF + kirim email konfirmasi,
 *    LALU generate Processed PDF + kirim email penawaran (client menerima 2 email)
 * 3. Admin Review → admin edit harga, lalu set QUOTED → generate Processed PDF + kirim email
 */

import { db } from "@/lib/db";
import {
  calculateRFQPricingFromDB,
  formatRupiah,
  PricingItem,
  type DBPricingBreakdown,
} from "./pricing-engine";
import {
  generateAndSaveRawPdf,
  generateAndSaveProcessedPdf,
  type RFQPdfData,
  type RFQPdfItem,
} from "./pdf-generator";
import {
  sendRawRFQEmail,
  sendProcessedRFQEmail,
  type EmailTemplateData,
  type ProcessedEmailData,
} from "./email-service";

export interface ProcessRFQParams {
  folderId: string;
  folderName: string;
  items: PricingItem[];
  subdomain?: string; // Which spoke this RFQ belongs to
  clientData: {
    companyName: string;
    companyContactPerson?: string;
    companyEmail?: string;
    companyAddress?: string;
    clientName: string;
    email: string;
    phone: string;
    shippingCity?: string;
    shippingAddress?: string;
  };
}

export interface ProcessRFQResult {
  success: boolean;
  rfqId?: string;
  clientId?: string;
  status: string;
  autoQuoted?: boolean;
  pricingSummary?: {
    baseTotal: number;
    totalDiscount: number;
    grandTotal: number;
    estimatedDeliveryDays: number;
  };
  message: string;
  /** Info email yang dikirim (untuk debugging/display di UI) */
  email?: {
    sent: boolean;
    messageId?: string;
    error?: string;
    recipient: string;
  };
}

// ============================================================================
// HELPER: Check if all items have FIXED pricing
// ============================================================================

/**
 * Check if all items in an RFQ have FIXED pricing type (no TIERED, no missing pricing).
 * Returns { allFixed, hasSpecialNotes }.
 */
async function checkAllItemsFixed(
  rfqItems: Array<{ productSlug: string; subcategory: string | null; customNote?: string | null }>
): Promise<{ allFixed: boolean; details: Array<{ slug: string; pricingType: string | null; found: boolean }> }> {
  const details: Array<{ slug: string; pricingType: string | null; found: boolean }> = [];

  for (const item of rfqItems) {
    const slug = item.productSlug;
    const subcategory = item.subcategory || "";

    // Try product-level first
    const productPricing = await db.productPricing.findFirst({
      where: {
        productSlug: slug,
        scope: "PRODUCT",
        isActive: true,
      },
    });

    if (productPricing) {
      details.push({ slug, pricingType: productPricing.pricingType, found: true });
      continue;
    }

    // Try category-level
    const categorySlug = subcategory
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const categoryPricing = await db.productPricing.findFirst({
      where: {
        scope: "CATEGORY",
        isActive: true,
        OR: [
          { categorySlug: subcategory },
          { categorySlug: categorySlug },
          { categorySlug: { equals: subcategory, mode: "insensitive" } },
        ],
      },
    });

    if (categoryPricing) {
      details.push({ slug, pricingType: categoryPricing.pricingType, found: true });
      continue;
    }

    // Not found at all
    details.push({ slug, pricingType: null, found: false });
  }

  const allFixed = details.every((d) => d.found && d.pricingType === "FIXED");
  return { allFixed, details };
}

/**
 * Look up the effective unit price for a product, resolving tier pricing based on quantity.
 * Returns the base price for FIXED pricing, or the tier-resolved price for TIERED pricing.
 * Also returns the effective discountPercent for TIERED items using discountPercent tiers.
 */
async function lookupBaseUnitPrice(
  productSlug: string,
  subcategory: string,
  quantity: number
): Promise<{ unitPrice: number; discountPercent: number }> {
  // Try product-level first (with tiers)
  const productPricing = await db.productPricing.findFirst({
    where: {
      productSlug,
      scope: "PRODUCT",
      isActive: true,
    },
    include: { tiers: { orderBy: { minQuantity: "asc" } } },
  });
  if (productPricing) {
    if (productPricing.pricingType === "TIERED" && productPricing.tiers.length > 0) {
      const resolved = resolveTierPrice(productPricing.unitPrice, quantity, productPricing.tiers);
      return { unitPrice: resolved.unitPrice, discountPercent: resolved.discountPercent };
    }
    return { unitPrice: productPricing.unitPrice, discountPercent: 0 };
  }

  // Try category-level (with tiers)
  const categorySlug = subcategory
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const categoryPricing = await db.productPricing.findFirst({
    where: {
      scope: "CATEGORY",
      isActive: true,
      OR: [
        { categorySlug: subcategory },
        { categorySlug: categorySlug },
        { categorySlug: { equals: subcategory, mode: "insensitive" } },
      ],
    },
    include: { tiers: { orderBy: { minQuantity: "asc" } } },
  });
  if (categoryPricing) {
    if (categoryPricing.pricingType === "TIERED" && categoryPricing.tiers.length > 0) {
      const resolved = resolveTierPrice(categoryPricing.unitPrice, quantity, categoryPricing.tiers);
      return { unitPrice: resolved.unitPrice, discountPercent: resolved.discountPercent };
    }
    return { unitPrice: categoryPricing.unitPrice, discountPercent: 0 };
  }

  return { unitPrice: 0, discountPercent: 0 };
}

// ============================================================================
// MAIN: processRFQSubmission
// ============================================================================

/**
 * Proses RFQ submission — Hybrid Model:
 *
 * - Create or update Client di database
 * - Create RFQ record + RFQItems
 * - Check if auto-quote is possible (all items FIXED pricing)
 * - If AUTO-QUOTE: status = QUOTED, generate Processed PDF, send processed email
 * - If MANUAL: status = SUBMITTED, generate Raw PDF, send confirmation email
 */
export async function processRFQSubmission(
  params: ProcessRFQParams
): Promise<ProcessRFQResult> {
  try {
    const { folderId, folderName, items, clientData, subdomain: paramSubdomain } = params;
    const subdomain = paramSubdomain || "pju";

    // 1. Upsert Client (cari berdasarkan email, buat jika belum ada)
    const client = await db.client.upsert({
      where: { email: clientData.email.toLowerCase() },
      update: {
        name: clientData.clientName,
        phone: clientData.phone,
        company: clientData.companyName,
        companyAddress: clientData.companyAddress,
        subdomain,
      },
      create: {
        email: clientData.email.toLowerCase(),
        name: clientData.clientName,
        phone: clientData.phone,
        company: clientData.companyName,
        companyAddress: clientData.companyAddress,
        subdomain,
      },
    });

    // 2. Look up base prices for all items (resolving tier pricing based on quantity)
    const itemsWithBasePrice = await Promise.all(
      items.map(async (item) => {
        const pricing = await lookupBaseUnitPrice(item.productId, item.subcategory, item.quantity);
        return { ...item, baseUnitPrice: pricing.unitPrice, tierDiscountPercent: pricing.discountPercent };
      })
    );

    // 3. Create RFQ record with company/shipping fields
    // First, estimate shipping cost so it's available from the start
    const totalItemQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    let initialShippingCost = 0;
    if (clientData.shippingCity) {
      const normalizedCity = clientData.shippingCity.trim();
      // Check DB first
      const shippingRecord = await db.shippingCost.findFirst({
        where: { city: { equals: normalizedCity, mode: "insensitive" }, isActive: true },
      });
      if (shippingRecord) {
        initialShippingCost = shippingRecord.baseCost;
      } else {
        // Estimate using formula
        initialShippingCost = estimateShippingCostFromCity(normalizedCity, totalItemQuantity);
      }
    }

    const rfq = await db.rFQ.create({
      data: {
        clientId: client.id,
        folderName,
        folderDesc: `RFQ dari folder: ${folderName}`,
        status: "SUBMITTED", // Will update to QUOTED if auto-quote
        totalProducts: items.length,
        submittedAt: new Date(),
        // Company fields
        companyName: clientData.companyName,
        companyContactPerson: clientData.companyContactPerson,
        companyEmail: clientData.companyEmail,
        companyAddress: clientData.companyAddress,
        // Shipping fields — including estimated shipping cost
        shippingCity: clientData.shippingCity,
        shippingAddress: clientData.shippingAddress,
        shippingCost: initialShippingCost,
        // Multi-tenant
        subdomain,
        items: {
          create: itemsWithBasePrice.map((item) => ({
            productName: item.productName,
            productSlug: item.productId,
            productSerial: item.subcategory,
            subcategory: item.subcategory,
            quantity: item.quantity,
            baseUnitPrice: item.baseUnitPrice,
            // Store tier-resolved discount (so admin view shows correct effective price)
            discountPercent: item.tierDiscountPercent || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 4. Check if auto-quote is possible
    const { allFixed } = await checkAllItemsFixed(rfq.items);

    if (allFixed) {
      // ========================================
      // AUTO-QUOTE FLOW
      // ========================================
      console.log(`[rfq-processor] Auto-quoting RFQ ${rfq.id} — all items have FIXED pricing`);

      // ========================================
      // STEP A: Generate Raw PDF + Send Raw RFQ confirmation email
      // (Client ALWAYS receives confirmation of what they submitted)
      // ========================================
      let rawPdfUrl: string | null = null;
      try {
        const rawPdfData: RFQPdfData = {
          rfqId: rfq.id,
          folderName,
          submittedAt: rfq.submittedAt ?? new Date(),
          subdomain,
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            companyAddress: client.companyAddress,
          },
          items: items.map((item): RFQPdfItem => ({
            productName: item.productName,
            subcategory: item.subcategory,
            productSerial: undefined,
            quantity: item.quantity,
          })),
        };
        const rawPdf = await generateAndSaveRawPdf(rawPdfData);
        rawPdfUrl = rawPdf.url;
        console.log(`[rfq-processor] Auto-quote Raw PDF generated: ${rawPdf.url} (${rawPdf.size} bytes)`);
      } catch (pdfError) {
        console.error("[rfq-processor] Failed to generate Raw PDF for auto-quote:", pdfError);
      }

      // Create RFQReport for ORIGINAL_REQUEST (Raw PDF)
      await db.rFQReport.create({
        data: {
          rfqId: rfq.id,
          reportType: "ORIGINAL_REQUEST",
          fileUrl: rawPdfUrl,
          emailSentAt: null,
        },
      });

      // Send Raw RFQ confirmation email
      if (rawPdfUrl) {
        try {
          const rawEmailData: EmailTemplateData = {
            rfqId: rfq.id,
            folderName,
            clientName: client.name,
            clientEmail: client.email,
            companyName: client.company,
            submittedAt: rfq.submittedAt ?? new Date(),
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            pdfUrl: rawPdfUrl,
            subdomain,
          };
          const rawSendResult = await sendRawRFQEmail(rawEmailData, rawPdfUrl, client.email);
          console.log(`[rfq-processor] Auto-quote Raw RFQ email sent: success=${rawSendResult.success}`);
        } catch (rawEmailError) {
          console.error("[rfq-processor] Failed to send Raw RFQ email for auto-quote:", rawEmailError);
        }
      }

      // ========================================
      // STEP B: Calculate pricing + Generate Processed PDF + Send Processed email
      // ========================================

      // Calculate pricing from DB
      const pricingItems: PricingItem[] = rfq.items.map((item) => ({
        productId: item.productSlug,
        productName: item.productName,
        subcategory: item.subcategory || "",
        quantity: item.quantity,
      }));
      const pricing = await calculateRFQPricingFromDB(
        pricingItems,
        clientData.shippingCity,
        false, // no installation by default
        0      // no overall discount
      );

      // Update RFQ status to QUOTED + shipping cost
      await db.rFQ.update({
        where: { id: rfq.id },
        data: {
          status: "QUOTED",
          shippingCost: pricing.shippingCost,
        },
      });

      // Generate Processed PDF
      let processedPdfUrl: string | null = null;
      try {
        const pdfData: RFQPdfData = {
          rfqId: rfq.id,
          folderName,
          submittedAt: rfq.submittedAt ?? new Date(),
          subdomain,
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            companyAddress: client.companyAddress,
          },
          items: rfq.items.map((item): RFQPdfItem => ({
            productName: item.productName,
            subcategory: item.subcategory,
            productSerial: item.productSerial,
            quantity: item.quantity,
          })),
        };

        const processedPdf = await generateAndSaveProcessedPdf(pdfData, pricing, {
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        processedPdfUrl = processedPdf.url;
        console.log(`[rfq-processor] Auto-quote Processed PDF generated: ${processedPdf.url} (${processedPdf.size} bytes)`);
      } catch (pdfError) {
        console.error("[rfq-processor] Failed to generate Processed PDF for auto-quote:", pdfError);
      }

      // Create RFQReport (PROCESSED_RESULT)
      await db.rFQReport.create({
        data: {
          rfqId: rfq.id,
          reportType: "PROCESSED_RESULT",
          fileUrl: processedPdfUrl,
          emailSentAt: null,
        },
      });

      // Send Processed RFQ email
      let emailResult: ProcessRFQResult["email"] = {
        sent: false,
        recipient: client.email,
      };

      if (processedPdfUrl) {
        try {
          const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const totalQuantity = rfq.items.reduce((sum, item) => sum + item.quantity, 0);

          const emailData: ProcessedEmailData = {
            rfqId: rfq.id,
            folderName,
            clientName: client.name,
            clientEmail: client.email,
            companyName: client.company,
            submittedAt: rfq.submittedAt ?? new Date(),
            totalItems: rfq.items.length,
            totalQuantity,
            pdfUrl: processedPdfUrl,
            grandTotal: pricing.grandTotal,
            grandTotalFormatted: formatRupiah(pricing.grandTotal),
            validUntil,
            estimatedDeliveryDays: pricing.estimatedDeliveryDays,
            subdomain,
          };

          const sendResult = await sendProcessedRFQEmail(
            emailData,
            processedPdfUrl,
            client.email
          );
          emailResult = {
            sent: sendResult.success,
            messageId: sendResult.messageId,
            error: sendResult.error,
            recipient: client.email,
          };
        } catch (emailError) {
          console.error("[rfq-processor] Failed to send auto-quote email:", emailError);
          emailResult = {
            sent: false,
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
            recipient: client.email,
          };
        }
      }

      return {
        success: true,
        rfqId: rfq.id,
        clientId: client.id,
        status: "QUOTED",
        autoQuoted: true,
        pricingSummary: {
          baseTotal: pricing.baseTotal,
          totalDiscount: pricing.totalDiscount,
          grandTotal: pricing.grandTotal,
          estimatedDeliveryDays: pricing.estimatedDeliveryDays,
        },
        message: `RFQ berhasil diproses secara otomatis. Status: QUOTED. ${
          emailResult.sent
            ? "Email konfirmasi (Raw RFQ) dan email penawaran (Processed RFQ) + PDF telah dikirim ke alamat email Anda."
            : "Email penawaran gagal dikirim, namun PDF tersimpan di sistem (tim sales akan follow up)."
        }`,
        email: emailResult,
      };
    } else {
      // ========================================
      // MANUAL FLOW (SUBMITTED — needs admin review)
      // ========================================
      console.log(`[rfq-processor] RFQ ${rfq.id} requires admin review — not all items are FIXED pricing`);

      // Generate Raw PDF (confirmation without pricing)
      let rawPdfUrl: string | null = null;
      try {
        const pdfData: RFQPdfData = {
          rfqId: rfq.id,
          folderName,
          submittedAt: rfq.submittedAt ?? new Date(),
          subdomain,
          client: {
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            companyAddress: client.companyAddress,
          },
          items: items.map((item): RFQPdfItem => ({
            productName: item.productName,
            subcategory: item.subcategory,
            productSerial: undefined,
            quantity: item.quantity,
          })),
        };
        const rawPdf = await generateAndSaveRawPdf(pdfData);
        rawPdfUrl = rawPdf.url;
        console.log(`[rfq-processor] Raw PDF generated: ${rawPdf.url} (${rawPdf.size} bytes)`);
      } catch (pdfError) {
        console.error("[rfq-processor] Failed to generate Raw PDF:", pdfError);
      }

      await db.rFQReport.create({
        data: {
          rfqId: rfq.id,
          reportType: "ORIGINAL_REQUEST",
          fileUrl: rawPdfUrl,
          emailSentAt: null,
        },
      });

      // Send Raw RFQ email (confirmation)
      let emailResult: ProcessRFQResult["email"] = {
        sent: false,
        recipient: client.email,
      };

      if (rawPdfUrl) {
        try {
          const emailData: EmailTemplateData = {
            rfqId: rfq.id,
            folderName,
            clientName: client.name,
            clientEmail: client.email,
            companyName: client.company,
            submittedAt: rfq.submittedAt ?? new Date(),
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            pdfUrl: rawPdfUrl,
            subdomain,
          };

          const sendResult = await sendRawRFQEmail(emailData, rawPdfUrl, client.email);
          emailResult = {
            sent: sendResult.success,
            messageId: sendResult.messageId,
            error: sendResult.error,
            recipient: client.email,
          };
        } catch (emailError) {
          console.error("[rfq-processor] Failed to send Raw RFQ email:", emailError);
          emailResult = {
            sent: false,
            error: emailError instanceof Error ? emailError.message : "Unknown email error",
            recipient: client.email,
          };
        }
      }

      return {
        success: true,
        rfqId: rfq.id,
        clientId: client.id,
        status: "SUBMITTED",
        autoQuoted: false,
        message: `RFQ berhasil dikirim. Status: SUBMITTED. ${
          emailResult.sent
            ? "Email konfirmasi + Raw PDF telah dikirim ke alamat email Anda."
            : "Email konfirmasi gagal dikirim, namun PDF tersimpan di sistem."
        } Tim kami akan mereview dan memberikan penawaran resmi dalam 1x24 jam kerja.`,
        email: emailResult,
      };
    }
  } catch (error) {
    console.error("RFQ processing error:", error);
    return {
      success: false,
      status: "ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses RFQ",
    };
  }
}

// ============================================================================
// updateRFQStatus — Admin sets status to QUOTED
// ============================================================================

/**
 * Update status RFQ (untuk admin).
 *
 * Saat status berubah ke QUOTED:
 * - Read admin overrides dari RFQItem (unitPrice, discountPercent, customNote)
 * - Read RFQ overallDiscount
 * - Calculate pricing dengan admin overrides
 * - Calculate shipping dari RFQ.shippingCity + free shipping logic
 * - Generate Processed PDF + kirim email penawaran
 */
export async function updateRFQStatus(
  rfqId: string,
  newStatus: "SUBMITTED" | "PROCESSING" | "QUOTED" | "ACCEPTED" | "REJECTED",
  options?: {
    salesName?: string;
    salesNotes?: string[];
    validUntil?: Date;
    includeInstallation?: boolean;
    signatureUrl?: string;
  }
): Promise<{ success: boolean; rfqId?: string; status?: string; message?: string; pricing?: DBPricingBreakdown }> {
  try {
    await db.rFQ.update({
      where: { id: rfqId },
      data: { status: newStatus },
    });

    // Jika status berubah ke QUOTED, generate Processed PDF with admin overrides
    if (newStatus === "QUOTED") {
      const rfq = await db.rFQ.findUnique({
        where: { id: rfqId },
        include: { client: true, items: true },
      });

      if (!rfq) {
        console.error("[rfq-processor] RFQ not found:", rfqId);
        return { success: false, message: "RFQ tidak ditemukan" };
      }

      // Build pricing items, applying admin overrides where present
      const pricingItems: PricingItem[] = rfq.items.map((item) => ({
        productId: item.productSlug,
        productName: item.productName,
        subcategory: item.subcategory || "",
        quantity: item.quantity,
      }));

      // Calculate pricing from DB (with admin overrides)
      const pricing = await calculateRFQPricingWithOverrides(rfq.items, rfq.shippingCity, options?.includeInstallation ?? false, rfq.overallDiscount);

      // Update RFQ shipping cost
      await db.rFQ.update({
        where: { id: rfqId },
        data: { shippingCost: pricing.shippingCost },
      });

      // Generate + save Processed PDF
      let processedPdfUrl: string | null = null;
      try {
        const pdfData: RFQPdfData = {
          rfqId: rfq.id,
          folderName: rfq.folderName,
          submittedAt: rfq.submittedAt ?? rfq.createdAt,
          subdomain: rfq.subdomain ?? undefined,
          client: {
            name: rfq.client.name,
            email: rfq.client.email,
            phone: rfq.client.phone,
            company: rfq.client.company,
            companyAddress: rfq.client.companyAddress,
          },
          items: rfq.items.map((item): RFQPdfItem => ({
            productName: item.productName,
            subcategory: item.subcategory,
            productSerial: item.productSerial,
            quantity: item.quantity,
          })),
        };

        const processedPdf = await generateAndSaveProcessedPdf(pdfData, pricing, {
          salesName: options?.salesName,
          salesNotes: options?.salesNotes,
          validUntil: options?.validUntil,
          signatureUrl: options?.signatureUrl,
        });
        processedPdfUrl = processedPdf.url;
        console.log(
          `[rfq-processor] Processed PDF generated: ${processedPdf.url} (${processedPdf.size} bytes)`
        );
      } catch (pdfError) {
        console.error("[rfq-processor] Failed to generate Processed PDF:", pdfError);
      }

      await db.rFQReport.create({
        data: {
          rfqId,
          reportType: "PROCESSED_RESULT",
          fileUrl: processedPdfUrl,
          emailSentAt: null,
        },
      });

      // Kirim Processed RFQ email dengan PDF attached
      if (processedPdfUrl) {
        try {
          const validUntil = options?.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const totalQuantity = rfq.items.reduce((sum, item) => sum + item.quantity, 0);

          const emailData: ProcessedEmailData = {
            rfqId: rfq.id,
            folderName: rfq.folderName,
            clientName: rfq.client.name,
            clientEmail: rfq.client.email,
            companyName: rfq.client.company,
            submittedAt: rfq.submittedAt ?? rfq.createdAt,
            totalItems: rfq.items.length,
            totalQuantity,
            pdfUrl: processedPdfUrl,
            grandTotal: pricing.grandTotal,
            grandTotalFormatted: formatRupiah(pricing.grandTotal),
            validUntil,
            salesName: options?.salesName,
            estimatedDeliveryDays: pricing.estimatedDeliveryDays,
            subdomain: rfq.subdomain ?? undefined,
          };

          const sendResult = await sendProcessedRFQEmail(
            emailData,
            processedPdfUrl,
            rfq.client.email
          );

          if (sendResult.success) {
            console.log(
              `[rfq-processor] Processed RFQ email sent: ${sendResult.messageId} → ${rfq.client.email}`
            );
          } else {
            console.warn(
              `[rfq-processor] Processed RFQ email failed (PDF tetap tersimpan): ${sendResult.error}`
            );
          }
        } catch (emailError) {
          console.error("[rfq-processor] Failed to send Processed RFQ email:", emailError);
        }
      }

      return {
        success: true,
        rfqId: rfq.id,
        status: "QUOTED",
        message: "RFQ berhasil di-quote. Processed PDF dan email telah dikirim.",
        pricing,
      };
    }

    return { success: true, rfqId, status: newStatus };
  } catch (error) {
    console.error("Failed to update RFQ status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengupdate status RFQ",
    };
  }
}

// ============================================================================
// PRICING WITH ADMIN OVERRIDES
// ============================================================================

/**
 * Calculate pricing with admin overrides from RFQItems.
 * - If RFQItem.unitPrice is set (admin override), use that as the effective unit price
 * - If RFQItem.discountPercent is set, apply it
 * - Apply overall discount from RFQ
 * - Calculate shipping from RFQ.shippingCity
 */
async function calculateRFQPricingWithOverrides(
  rfqItems: Array<{
    productSlug: string;
    productName: string;
    subcategory: string | null;
    quantity: number;
    baseUnitPrice: number | null;
    unitPrice: number | null;     // admin override
    discountPercent: number;       // admin override
    customNote: string | null;     // admin note
  }>,
  shippingCity: string | null,
  includeInstallation: boolean,
  overallDiscount: number
): Promise<DBPricingBreakdown> {
  const notes: string[] = [];

  // Process each item
  const itemBreakdown = await Promise.all(
    rfqItems.map(async (item) => {
      const subcategory = item.subcategory || "";
      const pricing = await (async () => {
        // Try product-level
        const productPricing = await db.productPricing.findFirst({
          where: { productSlug: item.productSlug, scope: "PRODUCT", isActive: true },
          include: { tiers: { orderBy: { minQuantity: "asc" } } },
        });
        if (productPricing) return productPricing;

        // Try category-level
        const categorySlug = subcategory.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        return db.productPricing.findFirst({
          where: {
            scope: "CATEGORY",
            isActive: true,
            OR: [
              { categorySlug: subcategory },
              { categorySlug: categorySlug },
              { categorySlug: { equals: subcategory, mode: "insensitive" } },
            ],
          },
          include: { tiers: { orderBy: { minQuantity: "asc" } } },
        });
      })();

      if (!pricing) {
        notes.push(`Harga untuk ${item.productName} belum tersedia di database.`);
        return {
          productId: item.productSlug,
          productName: item.productName,
          subcategory,
          quantity: item.quantity,
          unitPrice: 0,
          baseSubtotal: 0,
          discountPercent: 0,
          discountedSubtotal: 0,
          installationFee: 0,
        };
      }

      // Determine effective unit price
      let effectiveUnitPrice: number;
      let discountPercent: number;

      if (item.unitPrice !== null && item.unitPrice !== undefined) {
        // Admin has overridden the price
        effectiveUnitPrice = item.unitPrice;
        discountPercent = item.discountPercent || 0;
      } else if (pricing.pricingType === "FIXED") {
        effectiveUnitPrice = pricing.unitPrice;
        discountPercent = item.discountPercent || 0;
      } else {
        // TIERED — resolve tier, but still allow admin discountPercent override
        const resolved = resolveTierPrice(pricing.unitPrice, item.quantity, pricing.tiers);
        effectiveUnitPrice = resolved.unitPrice;
        discountPercent = item.discountPercent > 0 ? item.discountPercent : resolved.discountPercent;
      }

      const baseSubtotal = effectiveUnitPrice * item.quantity;
      const discountAmount = (baseSubtotal * discountPercent) / 100;
      const discountedSubtotal = baseSubtotal - discountAmount;

      if (discountPercent > 0) {
        notes.push(`${item.productName}: diskon ${discountPercent}% untuk ${item.quantity} unit.`);
      }

      if (item.customNote) {
        notes.push(`${item.productName}: ${item.customNote}`);
      }

      return {
        productId: item.productSlug,
        productName: item.productName,
        subcategory,
        quantity: item.quantity,
        unitPrice: effectiveUnitPrice,
        baseSubtotal,
        discountPercent,
        discountedSubtotal,
        installationFee: pricing.installationFee,
      };
    })
  );

  const baseTotal = itemBreakdown.reduce((sum, i) => sum + i.baseSubtotal, 0);
  const totalItemDiscount = itemBreakdown.reduce(
    (sum, i) => sum + (i.baseSubtotal - i.discountedSubtotal),
    0
  );

  const totalQuantity = rfqItems.reduce((sum, i) => sum + i.quantity, 0);

  const installationFee = includeInstallation
    ? itemBreakdown.reduce((sum, i) => sum + i.installationFee * i.quantity, 0)
    : 0;

  if (includeInstallation && installationFee > 0) {
    notes.push(`Biaya instalasi termasuk: ${formatRupiah(installationFee)}.`);
  }

  // Overall discount
  const clampedOverallDiscount = Math.max(0, Math.min(100, overallDiscount));
  const netAfterItemDiscounts = baseTotal - totalItemDiscount + installationFee;
  const overallDiscountAmount = (netAfterItemDiscounts * clampedOverallDiscount) / 100;
  const netBeforeShipping = netAfterItemDiscounts - overallDiscountAmount;

  if (clampedOverallDiscount > 0) {
    notes.push(`Diskon keseluruhan ${clampedOverallDiscount}% = ${formatRupiah(overallDiscountAmount)}.`);
  }

  // Shipping cost — auto-estimate for cities not in DB
  let shippingCost = 0;
  let freeShippingApplied = false;
  let shippingSource: "database" | "estimation" = "estimation";
  const normalizedCity = (shippingCity || "").trim();

  if (normalizedCity) {
    // First check DB
    const shippingRecord = await db.shippingCost.findFirst({
      where: { city: { equals: normalizedCity, mode: "insensitive" }, isActive: true },
    });

    if (shippingRecord) {
      shippingCost = shippingRecord.baseCost;
      shippingSource = "database";
    } else {
      // Estimate using distance/weight formula (same as pricing-engine.ts)
      shippingCost = estimateShippingCostFromCity(normalizedCity, totalQuantity);
      shippingSource = "estimation";
    }

    // Free shipping: netBeforeShipping > 1M AND city is Surabaya/Sidoarjo
    const lowerCity = normalizedCity.toLowerCase();
    if (netBeforeShipping > 1_000_000 && (lowerCity === "surabaya" || lowerCity === "sidoarjo")) {
      if (shippingCost > 0) {
        freeShippingApplied = true;
        notes.push(`Free shipping diterapkan untuk pengiriman ke ${normalizedCity} (subtotal > ${formatRupiah(1_000_000)}).`);
      }
      shippingCost = 0;
    } else if (shippingCost > 0) {
      if (shippingSource === "estimation") {
        notes.push(`Estimasi ongkir ke ${normalizedCity}: ${formatRupiah(shippingCost)} (estimasi sistem, dapat berubah).`);
      } else {
        notes.push(`Ongkos kirim ke ${normalizedCity}: ${formatRupiah(shippingCost)}.`);
      }
    }
  }

  const grandTotal = netBeforeShipping + shippingCost;

  return {
    items: itemBreakdown.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      subcategory: i.subcategory,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      baseSubtotal: i.baseSubtotal,
      discountPercent: i.discountPercent,
      discountedSubtotal: i.discountedSubtotal,
    })),
    baseTotal,
    totalDiscount: totalItemDiscount + overallDiscountAmount,
    installationFee,
    grandTotal,
    currency: "IDR",
    estimatedDeliveryDays: estimateDeliveryDays(totalQuantity),
    notes,
    shippingCost,
    shippingCostFormatted: formatRupiah(shippingCost),
    shippingCity: normalizedCity,
    freeShippingApplied,
    shippingSource,
    overallDiscount: clampedOverallDiscount,
    overallDiscountAmount,
    netBeforeShipping,
  };
}

/**
 * Estimate shipping cost for a city not in the ShippingCost table.
 * Uses distance from Surabaya and weight-based calculation.
 * Same logic as pricing-engine.ts and /api/admin/estimate-shipping.
 */
function estimateShippingCostFromCity(city: string, itemQuantity: number): number {
  const normalizedCity = city.trim().toLowerCase();
  const qty = Math.max(1, itemQuantity);
  const weight = qty * 25; // ~25kg per PJU unit

  const isJava = isJavaIslandCity(normalizedCity);
  const baseRatePerKg = isJava ? 5000 : 12000;
  const distanceMultiplier = getDistanceMultiplier(normalizedCity);

  let estimatedCost = Math.round(weight * baseRatePerKg * distanceMultiplier);

  const minCost = isJava ? 50000 : 150000;
  estimatedCost = Math.max(estimatedCost, minCost);
  estimatedCost = Math.ceil(estimatedCost / 10000) * 10000;

  return estimatedCost;
}

function isJavaIslandCity(city: string): boolean {
  const javaCities = [
    "surabaya", "sidoarjo", "gresik", "malang", "kediri", "blitar", "mojokerto",
    "jombang", "lamongan", "tuban", "pasuruan", "probolinggo", "situbondo",
    "jember", "banyuwangi", "madiun", "magetan", "nganjuk", "ponorogo",
    "semarang", "solo", "surakarta", "yogyakarta", "pekalongan", "tegal",
    "purwokerto", "cilacap", "magelang", "kudus", "jepara", "demak",
    "jakarta", "bandung", "bogor", "bekasi", "tangerang", "depok",
    "cirebon", "sukabumi", "tasikmalaya", "garut", "karawang", "subang",
  ];
  return javaCities.includes(city);
}

function getDistanceMultiplier(city: string): number {
  const eastJavaCities = [
    "surabaya", "sidoarjo", "gresik", "malang", "kediri", "blitar", "mojokerto",
    "jombang", "lamongan", "tuban", "pasuruan", "probolinggo", "situbondo",
    "jember", "banyuwangi", "madiun", "magetan", "nganjuk", "ponorogo",
  ];
  if (eastJavaCities.includes(city)) return 1.0;

  const centralJavaCities = [
    "semarang", "solo", "surakarta", "yogyakarta", "pekalongan", "tegal",
    "purwokerto", "cilacap", "magelang", "kudus", "jepara", "demak",
  ];
  if (centralJavaCities.includes(city)) return 1.3;

  const westJavaCities = [
    "jakarta", "bandung", "bogor", "bekasi", "tangerang", "depok",
    "cirebon", "sukabumi", "tasikmalaya", "garut", "karawang", "subang",
  ];
  if (westJavaCities.includes(city)) return 1.5;

  return 3.0;
}

/**
 * Resolve tier price for a TIERED pricing item (used in admin override flow).
 */
function resolveTierPrice(
  baseUnitPrice: number,
  quantity: number,
  tiers: Array<{ minQuantity: number; discountPercent: number; tierPrice: number | null }>
): { unitPrice: number; discountPercent: number } {
  let matchedTier: { minQuantity: number; discountPercent: number; tierPrice: number | null } | null = null;
  for (const tier of tiers) {
    if (quantity >= tier.minQuantity) {
      matchedTier = tier;
    }
  }
  if (!matchedTier) return { unitPrice: baseUnitPrice, discountPercent: 0 };
  if (matchedTier.tierPrice !== null && matchedTier.tierPrice !== undefined) {
    return { unitPrice: matchedTier.tierPrice, discountPercent: 0 };
  }
  return { unitPrice: baseUnitPrice, discountPercent: matchedTier.discountPercent };
}

// Re-export estimateDeliveryDays for use elsewhere
function estimateDeliveryDays(totalQuantity: number): number {
  if (totalQuantity <= 10) return 7;
  if (totalQuantity <= 50) return 14;
  if (totalQuantity <= 100) return 21;
  if (totalQuantity <= 500) return 30;
  return 45;
}

// ============================================================================
// RFQ STATUS HELPERS
// ============================================================================

/**
 * Dapatkan status & detail RFQ berdasarkan ID.
 *
 * H8 FIX: Hanya mengembalikan data yang aman untuk klien.
 * Data sensitif admin (baseUnitPrice, unitPrice, discountPercent,
 * customNote, overallDiscount, adminNotes, shippingCost) TIDAK
 * dikembalikan ke endpoint tracking publik.
 *
 * Untuk data lengkap admin, gunakan admin API endpoint.
 */
export async function getRFQStatus(rfqId: string) {
  try {
    const rfq = await db.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        client: true,
        items: true,
        reports: true,
      },
    });

    if (!rfq) return null;

    // H8: Hanya kembalikan data yang aman untuk klien tracking.
    // Data harga dan catatan admin TIDAK diekspos ke publik.
    return {
      id: rfq.id,
      status: rfq.status,
      folderName: rfq.folderName,
      totalProducts: rfq.totalProducts,
      submittedAt: rfq.submittedAt,
      createdAt: rfq.createdAt,
      companyName: rfq.companyName,
      // Informasi klien terbatas — hanya nama perusahaan untuk konfirmasi
      client: {
        company: rfq.client.company,
      },
      // Items hanya menampilkan info produk dan jumlah — TANPA harga
      items: rfq.items.map((item) => ({
        productName: item.productName,
        subcategory: item.subcategory,
        quantity: item.quantity,
      })),
      // Info laporan — hanya tipe dan tanggal, tanpa fileUrl
      reports: rfq.reports.map((r) => ({
        type: r.reportType,
        createdAt: r.createdAt,
        emailSentAt: r.emailSentAt,
      })),
    };
  } catch (error) {
    console.error("Failed to get RFQ status:", error);
    return null;
  }
}

/**
 * Format status RFQ ke Bahasa Indonesia
 */
export function formatRFQStatus(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: "Draft",
    SUBMITTED: "Terkirim",
    PROCESSING: "Sedang Diproses",
    QUOTED: "Penawaran Diberikan",
    ACCEPTED: "Diterima",
    REJECTED: "Ditolak",
  };
  return statusMap[status] || status;
}

/**
 * Dapatkan warna badge untuk status RFQ
 */
export function getRFQStatusColor(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "SUBMITTED":
      return "secondary";
    case "PROCESSING":
      return "default";
    case "QUOTED":
      return "default";
    case "ACCEPTED":
      return "default";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
}
