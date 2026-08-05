/**
 * Helper: Read subdomain from request headers (x-subdomain) or URL query param
 *
 * Used in API routes to determine which spoke the admin is viewing.
 * The middleware sets the x-subdomain request header based on
 * the host, cookie, or query parameter.
 *
 * This helper also checks the URL query parameter directly as a fallback,
 * since client-side fetch calls may include ?subdomain=xxx on preview domains.
 */

import { isValidSubdomain, DEFAULT_SUBDOMAIN, type Subdomain } from "@/lib/subdomain";

export function getSubdomainFromRequest(request: Request): Subdomain {
  // 1. Check x-subdomain header (set by middleware)
  const headerSub = request.headers.get("x-subdomain");
  if (headerSub && isValidSubdomain(headerSub)) {
    return headerSub;
  }

  // 2. Check URL query parameter (for client-side fetch calls on preview domains)
  const url = new URL(request.url);
  const querySub = url.searchParams.get("subdomain");
  if (querySub && isValidSubdomain(querySub)) {
    return querySub;
  }

  // 3. Default fallback
  return DEFAULT_SUBDOMAIN;
}
