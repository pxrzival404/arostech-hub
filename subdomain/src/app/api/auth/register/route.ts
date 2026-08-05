import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validasi input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Semua field wajib diisi (name, email, password)" },
        { status: 400 }
      );
    }

    // M5: Password policy lebih kuat — minimal 8 karakter, 1 huruf besar, 1 angka
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password harus mengandung minimal 1 huruf besar" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password harus mengandung minimal 1 angka" },
        { status: 400 }
      );
    }
    if (password.length > 128) {
      return NextResponse.json(
        { error: "Password maksimal 128 karakter" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (emailVerified = null sampai dikonfirmasi)
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // M4: Buat verification token dan kirim email verifikasi
    try {
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

      await db.verificationToken.create({
        data: {
          identifier: email.toLowerCase().trim(),
          token,
          expires,
        },
      });

      // Kirim email verifikasi (non-blocking — jangan block response)
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://pju.dayaberkah.id";
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

      // Import dan kirim email di background
      import("@/lib/email-service").then(({ sendEmail }) => {
        sendEmail({
          to: email.toLowerCase().trim(),
          subject: "Verifikasi Email — Arostech PJU",
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #059669; font-size: 24px;">Arostech PJU</h1>
                <p style="color: #64748b; font-size: 14px;">Verifikasi Alamat Email</p>
              </div>
              <div style="background: #f8fafc; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0;">
                <p style="color: #1e293b; font-size: 16px;">Halo ${name.trim()},</p>
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
        }).catch((err: unknown) => {
          console.error("Failed to send verification email:", err);
        });
      }).catch(() => {
        // Silently fail — registration tetap sukses
      });
    } catch (tokenError) {
      console.error("Failed to create verification token:", tokenError);
      // Registration tetap sukses meskipun gagal kirim email
    }

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu login.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    );
  }
}
