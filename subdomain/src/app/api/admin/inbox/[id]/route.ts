import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { SUBDOMAIN_BRAND_NAMES, type Subdomain } from "@/lib/subdomain";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * GET /api/admin/inbox/[id]
 * Get single message detail, auto-mark as READ if UNREAD
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Auto-mark as READ if UNREAD
    if (message.status === "UNREAD") {
      await db.contactMessage.update({
        where: { id },
        data: { status: "READ" },
      });
      message.status = "READ";
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[Admin Inbox Detail API] Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat pesan" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/inbox/[id]
 * Update message: mark as read/archived, or reply
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, replyBody, status: newStatus } = body;

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Handle reply
    if (action === "reply" && replyBody) {
      const updatedMessage = await db.contactMessage.update({
        where: { id },
        data: {
          replyBody,
          status: "REPLIED",
          repliedAt: new Date(),
          repliedBy: session.user?.email || "admin",
        },
      });

      // Send reply email via Resend
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        try {
          const resend = new Resend(apiKey);
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
          const salesEmail = process.env.SALES_EMAIL || "info@dayaberkah.id";
          const originalSubject = message.subject
            ? `[Kontak Website] ${message.subject}`
            : `[Kontak Website] Pesan dari ${message.name}`;

          const replyHtmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="color: white; margin: 0;">Balasan dari ${escapeHtml(SUBDOMAIN_BRAND_NAMES[message.subdomain as Subdomain] || "Arostech PJU")}</h2>
              </div>
              <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
                <p style="margin: 0 0 16px; color: #374151;">Halo <strong>${escapeHtml(message.name)}</strong>,</p>
                <p style="margin: 0 0 16px; color: #4b5563;">Terima kasih telah menghubungi kami. Berikut adalah balasan untuk pesan Anda:</p>
                <div style="background: #f9fafb; padding: 16px; border-radius: 6px; border-left: 4px solid #059669;">
                  <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${escapeHtml(replyBody)}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #374151; font-size: 13px;">Pesan asli Anda:</p>
                <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 13px;">
                  ${message.subject ? `<p style="margin: 0 0 4px; color: #6b7280;"><strong>Subjek:</strong> ${escapeHtml(message.subject)}</p>` : ""}
                  <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${escapeHtml(message.message)}</p>
                </div>
              </div>
              <div style="background: #f9fafb; padding: 16px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  Salam hormat,<br>
                  <strong style="color: #059669;">Tim ${escapeHtml(SUBDOMAIN_BRAND_NAMES[message.subdomain as Subdomain] || "Arostech PJU")}</strong><br>
                  <a href="mailto:${escapeHtml(salesEmail)}" style="color: #059669;">${escapeHtml(salesEmail)}</a>
                </p>
              </div>
              <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
                Email ini dikirim sebagai balasan pesan melalui form kontak website ${escapeHtml(SUBDOMAIN_BRAND_NAMES[message.subdomain as Subdomain] || "Arostech PJU")}
              </p>
            </div>
          `;

          const { error: sendError } = await resend.emails.send({
            from: `${SUBDOMAIN_BRAND_NAMES[message.subdomain as Subdomain] || "Arostech PJU"} <${fromEmail}>`,
            to: [message.email],
            replyTo: salesEmail,
            subject: `Re: ${originalSubject}`,
            html: replyHtmlContent,
            tags: [
              { name: "source", value: "contact_reply" },
              { name: "category", value: message.subdomain || "pju" },
            ],
          });

          if (sendError) {
            console.error("[Admin Inbox API] Reply email send error:", sendError);
          } else {
            console.log(`[Admin Inbox API] Reply email sent to ${message.email}`);
          }
        } catch (emailError) {
          console.error("[Admin Inbox API] Reply email error (non-blocking):", emailError);
        }
      } else {
        console.warn("[Admin Inbox API] RESEND_API_KEY not configured, reply email not sent");
      }

      return NextResponse.json({
        message: updatedMessage,
        emailSent: !!apiKey,
      });
    }

    // Handle status change (mark as read/archived)
    if (newStatus && ["READ", "ARCHIVED"].includes(newStatus)) {
      const updatedMessage = await db.contactMessage.update({
        where: { id },
        data: { status: newStatus },
      });
      return NextResponse.json({ message: updatedMessage });
    }

    return NextResponse.json(
      { error: "Aksi tidak valid" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Admin Inbox Detail API] PATCH Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui pesan" },
      { status: 500 }
    );
  }
}
