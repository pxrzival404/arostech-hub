/**
 * Sanity Read Client (Server-side)
 *
 * Client ini dipakai di server-side rendering (RSC) untuk fetch konten
 * dari Sanity Content Lake. Token Viewer (read-only) dipakai untuk auth.
 *
 * SUBDOMAIN: Sekarang runtime (dari x-subdomain header),
 * bukan lagi build-time constant.
 */

import { createClient } from "next-sanity";
import { headers } from "next/headers";
import { isValidSubdomain, DEFAULT_SUBDOMAIN, type Subdomain } from "@/lib/subdomain";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const apiToken = process.env.SANITY_API_TOKEN;

if (!projectId) {
  throw new Error(
    "SANITY_PROJECT_ID tidak ditemukan di .env. Tambahkan: SANITY_PROJECT_ID=xxx"
  );
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: false, // Disable CDN to ensure fresh data after Studio publishes
  token: apiToken,
});

/**
 * Get current subdomain from request headers.
 *
 * Di server components & API routes, panggil:
 *   const subdomain = await getSubdomain();
 *
 * Fallback: process.env.SUBDOMAIN (untuk CLI scripts) → DEFAULT_SUBDOMAIN
 */
export async function getSubdomain(): Promise<Subdomain> {
  try {
    const hdrs = await headers();
    const sub = hdrs.get("x-subdomain");
    if (sub && isValidSubdomain(sub)) {
      return sub;
    }
  } catch {
    // headers() not available (CLI context, build time, etc.)
  }

  // Fallback: env var or default
  const envSub = process.env.SUBDOMAIN || DEFAULT_SUBDOMAIN;
  if (isValidSubdomain(envSub)) {
    return envSub;
  }
  return DEFAULT_SUBDOMAIN;
}

/**
 * Synchronous version for non-async contexts.
 * Reads from env var only — no access to headers.
 * Use only in build-time or CLI contexts.
 */
export const CURRENT_SUBDOMAIN = process.env.SUBDOMAIN || DEFAULT_SUBDOMAIN;
