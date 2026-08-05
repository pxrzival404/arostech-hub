/**
 * Sanity CLI Configuration
 *
 * Untuk pakai sanity CLI commands:
 *   npx sanity@latest docs            # Lihat dokumentasi
 *   npx sanity@latest manage          # Buka dashboard Sanity
 *   npx sanity@latest cors add <url>  # Add CORS origin
 *
 * Tidak dipakai untuk development sehari-hari, tapi berguna untuk:
 * - Import data awal (npx sanity@latest import <file.ndjson> --dataset production)
 * - Migrate schema (npx sanity@latest codegen)
 */

import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || "",
    dataset: process.env.SANITY_DATASET || "production",
  },
});
