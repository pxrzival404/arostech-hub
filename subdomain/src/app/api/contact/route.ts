import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { SUBDOMAIN_BRAND_NAMES, type Subdomain } from "@/lib/subdomain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan wajib diisi" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Save to database first (don't block email send on DB failure)
    // Set subdomain from request header (set by middleware)
    const subdomain = request.headers.get("x-subdomain") || "pju";
    try {
      await db.contactMessage.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject: subject || null,
          message,
          subdomain,
        },
      });
      console.log(`[Contact API] Message saved to DB from ${name} <${email}>`);
    } catch (dbError) {
      console.error("[Contact API] DB save error (non-blocking):", dbError);
      // Continue with email send even if DB save fails
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[Contact API] RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Layanan email belum dikonfigurasi. Silakan hubungi kami via WhatsApp." },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const salesEmail = process.env.SALES_EMAIL || "info@dayaberkah.id";

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Pesan Baru dari Website</h2>
        </div>
        <div style="background: #ffffff; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Nama</td>
              <td style="padding: 8px 0; color: #6b7280;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #059669;">${escapeHtml(email)}</a></td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151;">Telepon</td>
              <td style="padding: 8px 0; color: #6b7280;">${escapeHtml(phone)}</td>
            </tr>` : ''}
            ${subject ? `<tr>
              <td style="padding: 8px 0; font-weight: 600; color: #374151;">Subjek</td>
              <td style="padding: 8px 0; color: #6b7280;">${escapeHtml(subject)}</td>
            </tr>` : ''}
          </table>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
          <div style="background: #f9fafb; padding: 16px; border-radius: 6px;">
            <p style="margin: 0; font-weight: 600; color: #374151; margin-bottom: 8px;">Pesan:</p>
            <p style="margin: 0; color: #4b5563; white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
          Pesan ini dikirim melalui form kontak website ${SUBDOMAIN_BRAND_NAMES[subdomain as Subdomain] || "Arostech PJU"}
        </p>
      </div>
    `;

    const { data: responseData, error } = await resend.emails.send({
      from: `Arostech Website <${fromEmail}>`,
      to: [salesEmail],
      replyTo: email,
      subject: subject ? `[Kontak Website] ${subject}` : `[Kontak Website] Pesan dari ${name}`,
      html: htmlContent,
      tags: [
        { name: "source", value: "contact_form" },
        { name: "category", value: subdomain || "pju" },
      ],
    });

    if (error) {
      console.error("[Contact API] Resend error:", error);
      return NextResponse.json(
        { error: "Gagal mengirim pesan. Silakan coba lagi atau hubungi kami via WhatsApp." },
        { status: 500 }
      );
    }

    console.log(`[Contact API] Email sent: ${responseData?.id} from ${name} <${email}>`);

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil dikirim! Kami akan menghubungi Anda segera.",
    });
  } catch (error) {
    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
