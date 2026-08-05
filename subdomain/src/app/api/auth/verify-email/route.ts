import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifikasi email pengguna setelah klik link di email
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=missing_token", request.url)
      );
    }

    // Cari verification token di database
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_token", request.url)
      );
    }

    // Cek apakah token sudah expired
    if (verificationToken.expires < new Date()) {
      // Hapus token expired
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        new URL("/auth/login?error=expired_token", request.url)
      );
    }

    // Cari user berdasarkan email dari token
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=user_not_found", request.url)
      );
    }

    // Jika sudah verified, langsung redirect ke login
    if (user.emailVerified) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(
        new URL("/auth/login?verified=already", request.url)
      );
    }

    // Update user: set emailVerified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Hapus token yang sudah dipakai
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(
      new URL("/auth/login?verified=success", request.url)
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=verification_failed", request.url)
    );
  }
}

/**
 * POST /api/auth/verify-email
 * Kirim ulang email verifikasi
 * Body: { email: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Jangan bocorkan apakah email ada atau tidak
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, email verifikasi akan dikirimkan",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email sudah terverifikasi",
      });
    }

    // Hapus token lama untuk email ini
    await db.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Buat token baru
    const crypto = await import("crypto");
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // Kirim email verifikasi
    try {
      const { sendEmail } = await import("@/lib/email-service");
      const verifyUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pju.dayaberkah.id"}/api/auth/verify-email?token=${token}`;

      await sendEmail({
        to: email.toLowerCase(),
        subject: "Verifikasi Email — Arostech PJU",
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; font-size: 24px;">Arostech PJU</h1>
              <p style="color: #64748b; font-size: 14px;">Verifikasi Alamat Email</p>
            </div>
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
              <p style="color: #1e293b; font-size: 16px;">Halo ${user.name || "Pengguna"},</p>
              <p style="color: #475569; font-size: 14px; margin-top: 12px;">
                Terima kasih telah mendaftar di Arostech PJU. Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${verifyUrl}" style="background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
                  Verifikasi Email
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
                Link ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.
              </p>
              <p style="color: #94a3b8; font-size: 12px;">
                Jika tombol tidak berfungsi, salin link berikut ke browser: <br/>
                <a href="${verifyUrl}" style="color: #059669; word-break: break-all;">${verifyUrl}</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Tetap return success agar tidak bocor info
    }

    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, email verifikasi akan dikirimkan",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim ulang email verifikasi" },
      { status: 500 }
    );
  }
}
