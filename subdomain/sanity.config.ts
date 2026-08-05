/**
 * Sanity Studio Configuration
 *
 * Embedded Sanity Studio di route /studio.
 * Login pakai akun Sanity (leader Anda yang buat project sentradaya-v2).
 *
 * Sanity project ID & dataset SAMA dengan main domain (pampam666/dayaberkah):
 *   - Project ID: 3h4k8dye
 *   - Dataset: production
 *   - Multi-tenant pattern: reference -> spokeConfig (konsisten dengan main domain)
 *
 * Setup:
 * 1. Buka http://localhost:3000/studio
 * 2. Login dengan akun Sanity (Google email teamdbsn@gmail.com)
 * 3. Pilih dataset "production"
 * 4. Mulai edit/create dokumen:
 *    - Spoke Configuration (1 per sub-domain, e.g. "pju")
 *    - Produk, Portfolio Entry, Artikel, Company Info
 *      → Set field "Spoke" ke spokeConfig yang sesuai
 */

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

// NOTE: Studio adalah client component (page "use client" + NextStudio).
// Next.js hanya expose env var ke browser jika ada prefix NEXT_PUBLIC_.
// Project ID dan Dataset bukan secret (cukup untuk read public dataset),
// jadi aman di-expose ke browser. Jangan expose API Token!
const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  "";
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "arostech-studio",
  title: "Arostech Content Studio",
  projectId,
  dataset,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Production dataset SHARE untuk semua spoke Arostech (pju, solarcell, alatpetir, baterai).
    // Field `spoke: reference -> spokeConfig` di setiap schema untuk multi-tenant filter.
    // Saat create dokumen baru dari Studio PJU ini, user pilih spokeConfig yang sesuai.
    newDocumentOptions: (prev, { creationContext }) => {
      // Tidak modify — biarkan user pilih type manual
      return prev;
    },
  },
});
