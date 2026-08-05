import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "node:crypto";

/**
 * POST /api/webhooks/resend
 *
 * Webhook endpoint for Resend "email.received" events.
 * When someone sends an email to the configured receiving address
 * (e.g. anything@fealdaailo.resend.app),
 * Resend forwards it here as a POST request with JSON payload.
 *
 * This endpoint:
 * 1. Verifies the webhook signature using Svix-style verification
 * 2. Saves the inbound email as a ContactMessage in the database
 * 3. Returns 200 OK to acknowledge receipt
 *
 * Resend payload example:
 * {
 *   "type": "email.received",
 *   "created_at": "2026-02-22T23:41:12.126Z",
 *   "data": {
 *     "email_id": "...",
 *     "from": "sender@example.com",
 *     "to": ["info@dayaberkah.id"],
 *     "subject": "Hello",
 *     "html": "<p>Email body HTML</p>",
 *     "text": "Email body plain text",
 *     "attachments": [...]
 *   }
 * }
 */

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION (Svix-style, as used by Resend)
// ============================================================================

/**
 * Verify Resend webhook signature using Svix-style HMAC-SHA256.
 *
 * Resend sends these headers:
 * - svix-id: unique message ID
 * - svix-timestamp: Unix timestamp
 * - svix-signature: one or more signatures (v1,g0.base64sig)
 *
 * The signing secret starts with "whsec_" and the rest is base64-encoded.
 */
function verifyWebhookSignature(
  payload: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  secret: string
): boolean {
  try {
    // Decode the signing secret (strip "whsec_" prefix, then base64 decode)
    const secretB64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const secretBuf = Buffer.from(secretB64, "base64");

    // Build the signed content: svix_id.timestamp.payload
    const signedContent = `${svixId}.${svixTimestamp}.${payload}`;

    // Extract signatures from the svix-signature header
    // Format: "v1,g0_base64sig1 v1,g0_base64sig2 ..."
    const signatures = svixSignature
      .split(" ")
      .map((sig) => {
        const parts = sig.split(",");
        if (parts.length >= 2) {
          return { version: parts[0], signature: parts.slice(1).join(",") };
        }
        return null;
      })
      .filter(Boolean);

    // Check each signature
    for (const sig of signatures) {
      if (!sig || sig.version !== "v1") continue;

      const expectedSig = crypto
        .createHmac("sha256", secretBuf)
        .update(signedContent)
        .digest("base64");

      try {
        if (
          crypto.timingSafeEqual(
            Buffer.from(sig.signature),
            Buffer.from(expectedSig)
          )
        ) {
          return true;
        }
      } catch {
        // Length mismatch, try next signature
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // ─── Signature Verification ─────────────────────────────────────────
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const svixId = request.headers.get("svix-id") || "";
      const svixTimestamp = request.headers.get("svix-timestamp") || "";
      const svixSignature = request.headers.get("svix-signature") || "";

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error("[Resend Webhook] Missing Svix headers — cannot verify signature");
        return NextResponse.json({ error: "Missing signature headers" }, { status: 401 });
      }

      if (!verifyWebhookSignature(rawBody, svixId, svixTimestamp, svixSignature, webhookSecret)) {
        console.error("[Resend Webhook] Invalid signature — possible tampering");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      console.log("[Resend Webhook] Signature verified ✅");
    } else {
      console.warn("[Resend Webhook] No RESEND_WEBHOOK_SECRET set — skipping signature verification");
    }

    // ─── Process Event ──────────────────────────────────────────────────
    const eventType = payload.type;

    if (eventType === "email.received") {
      const data = payload.data || {};
      const fromEmail = data.from || "unknown@unknown.com";
      const toEmails: string[] = data.to || [];
      const subject = data.subject || "(No Subject)";
      const textBody = data.text || "";
      const htmlBody = data.html || "";

      // Extract sender name if present (format: "Name <email@example.com>")
      let senderName = fromEmail;
      let senderEmail = fromEmail;
      const nameEmailMatch = fromEmail.match(/^(.+?)\s*<(.+?)>$/);
      if (nameEmailMatch) {
        senderName = nameEmailMatch[1].trim().replace(/^"|"$/g, "");
        senderEmail = nameEmailMatch[2].trim();
      }

      // Build message content (prefer plain text, fallback to stripped HTML)
      let messageContent = textBody;
      if (!messageContent && htmlBody) {
        // Simple HTML strip for storage
        messageContent = htmlBody
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .trim();
      }

      // Truncate if too long (database field limit)
      const MAX_MESSAGE_LENGTH = 10000;
      if (messageContent.length > MAX_MESSAGE_LENGTH) {
        messageContent = messageContent.substring(0, MAX_MESSAGE_LENGTH) + "\n\n[...pesan dipotong karena terlalu panjang]";
      }

      // ─── Save to Database ────────────────────────────────────────────
      try {
        const contactMessage = await db.contactMessage.create({
          data: {
            name: senderName,
            email: senderEmail,
            phone: null,
            subject: `[Email Masuk] ${subject}`,
            message: messageContent,
            status: "UNREAD",
          },
        });

        console.log(
          `[Resend Webhook] Email saved as ContactMessage: ${contactMessage.id} from ${senderEmail} — "${subject}"`
        );
      } catch (dbError) {
        console.error("[Resend Webhook] DB save error:", dbError);
        // Still return 200 so Resend doesn't retry
      }

      // Log attachment info if present
      const attachments: Array<{ filename: string; content_type: string }> = data.attachments || [];
      if (attachments.length > 0) {
        console.log(
          `[Resend Webhook] Email has ${attachments.length} attachment(s):`,
          attachments.map((a) => a.filename).join(", ")
        );
        // TODO: Future — save attachments to filesystem or object storage
      }

      console.log(
        `[Resend Webhook] Processed email.received: from=${senderEmail}, to=${toEmails.join(",")}, subject="${subject}"`
      );
    } else {
      // Other event types (email.delivered, email.opened, etc.)
      console.log(`[Resend Webhook] Received event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("[Resend Webhook] Error processing webhook:", error);
    // Still return 200 to prevent Resend from retrying
    // (unless it's a parsing error that will always fail)
    return NextResponse.json({ received: true, error: "Processing error" }, { status: 200 });
  }
}

/**
 * GET /api/webhooks/resend
 * Health check endpoint — verify the webhook route is alive
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/webhooks/resend",
    message: "Resend webhook endpoint is active. Configure in Resend dashboard with email.received event.",
  });
}
