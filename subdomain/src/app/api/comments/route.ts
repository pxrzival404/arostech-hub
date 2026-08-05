import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizeString } from "@/lib/sanitize";

// M8: Simple in-memory rate limiter for comments
// Key: IP or email, Value: { count, lastReset }
const commentRateLimit = new Map<string, { count: number; lastReset: number }>();
const MAX_COMMENTS_PER_HOUR = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = commentRateLimit.get(key);

  if (!record || now - record.lastReset > RATE_WINDOW_MS) {
    commentRateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_COMMENTS_PER_HOUR) {
    return false;
  }

  record.count++;
  return true;
}

// GET /api/comments?articleId=slug — Ambil komentar berdasarkan artikel (hanya APPROVED)
export async function GET(request: NextRequest) {
  try {
    const articleId = request.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    // M9: Hanya tampilkan komentar yang sudah di-approve
    const comments = await db.articleComment.findMany({
      where: {
        articleId,
        status: "APPROVED", // M9: Filter hanya approved
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments — Tambah komentar baru (status PENDING sampai di-approve admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, name, email, content, website } = body;

    // M8: Honeypot — jika field website terisi, kemungkinan bot
    if (website) {
      // Bot terdeteksi — return fake success agar bot tidak curiga
      return NextResponse.json(
        { comment: { id: "honeypot", name, content, createdAt: new Date().toISOString() } },
        { status: 201 }
      );
    }

    if (!articleId || !name || !email || !content) {
      return NextResponse.json(
        { error: "Semua field wajib diisi (articleId, name, email, content)" },
        { status: 400 }
      );
    }

    // M8: Rate limiting berdasarkan email
    if (!checkRateLimit(email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "Terlalu banyak komentar. Silakan coba lagi dalam 1 jam." },
        { status: 429 }
      );
    }

    // M8: Rate limiting berdasarkan IP
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(`ip:${clientIp}`)) {
      return NextResponse.json(
        { error: "Terlalu banyak komentar dari IP ini. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    // Validasi panjang komentar
    if (content.trim().length < 3) {
      return NextResponse.json(
        { error: "Komentar terlalu pendek (minimal 3 karakter)" },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Komentar terlalu panjang (maksimal 1000 karakter)" },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedName = sanitizeString(name.trim()).substring(0, 100);
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedContent = sanitizeString(content.trim()).substring(0, 1000);

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Set subdomain from request header (set by middleware)
    const subdomain = request.headers.get("x-subdomain") || "pju";

    const comment = await db.articleComment.create({
      data: {
        articleId,
        name: sanitizedName,
        email: sanitizedEmail,
        content: sanitizedContent,
        status: "PENDING", // M9: Default status — perlu approval admin
        subdomain,
      },
      select: {
        id: true,
        name: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        comment,
        message: "Komentar Anda telah dikirim dan menunggu moderasi. Terima kasih!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
