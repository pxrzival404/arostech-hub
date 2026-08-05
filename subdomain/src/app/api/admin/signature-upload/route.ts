/**
 * API Route: Signature Upload
 *
 * Handles file upload for admin digital signature.
 * Saves the file locally to /public/signatures/ and returns the local path.
 * This is safer than hosting signatures on external URLs.
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("signature") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File tanda tangan tidak ditemukan" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan PNG, JPG, atau WebP." },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 2MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "png";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `sig-${timestamp}-${randomSuffix}.${ext}`;

    // Save to /public/signatures/
    const publicDir = path.join(process.cwd(), "public", "signatures");
    await mkdir(publicDir, { recursive: true });

    const filePath = path.join(publicDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const localPath = `/signatures/${filename}`;

    return NextResponse.json({
      success: true,
      localPath,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("[Signature Upload] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengupload tanda tangan" },
      { status: 500 }
    );
  }
}
