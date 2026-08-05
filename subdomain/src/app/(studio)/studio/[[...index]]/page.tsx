/**
 * Sanity Studio — Embedded Route
 *
 * Buka http://localhost:3000/studio untuk akses Sanity Studio.
 * Login pakai akun Sanity (email teamdbsn@gmail.com).
 *
 * Setelah login, Anda bisa:
 * - Create / edit / delete dokumen (produk, artikel, project, company info)
 * - Upload gambar ke Sanity CDN (auto-optimized)
 * - Preview perubahan sebelum publish
 *
 * Catatan: Studio butuh CORS origin terdaftar di Sanity dashboard.
 * Jika ada error CORS, add localhost:3000 di:
 * https://www.sanity.io/manage/project/3h4k8dye/api/cors-origins
 */

"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
