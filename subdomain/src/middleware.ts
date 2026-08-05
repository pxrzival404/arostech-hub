import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { extractSubdomain, DEFAULT_SUBDOMAIN, isValidSubdomain, isHostResolvable } from "@/lib/subdomain";

/**
 * Middleware for:
 * 1. Subdomain detection → set x-subdomain REQUEST header for downstream
 * 2. URL parameter override (?subdomain=baterai) for preview/testing
 * 3. Route protection (admin, dashboard, studio, etc.)
 *
 * MULTI-TAB SUPPORT (preview domains):
 * On preview domains (e.g., preview-xxx.space-z.ai, localhost),
 * the host cannot determine the subdomain. We use ?subdomain=xxx
 * in the URL to persist the subdomain per-tab.
 *
 * CRITICAL: On preview domains, ?subdomain=xxx is the ONLY source of truth.
 * - Cookies are NEVER read or written on preview domains (they cause cross-tab contamination)
 * - If ?subdomain=xxx is missing from a page request, middleware redirects to add ?subdomain=pju
 * - This ensures the URL always shows which subdomain is active
 *
 * On production (e.g., baterai.dayaberkah.id), the host resolves the subdomain
 * and ?subdomain=xxx is stripped via redirect for clean URLs.
 */
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const hostCanResolve = isHostResolvable(host);

  // ── Subdomain Detection ──────────────────────────────────────
  const querySubdomain = searchParams.get("subdomain");
  let subdomain: string;

  if (querySubdomain && isValidSubdomain(querySubdomain)) {
    // URL query param takes highest priority (works on both preview and production)
    subdomain = querySubdomain;
  } else if (hostCanResolve) {
    // Production: host can determine subdomain (e.g., baterai.dayaberkah.id)
    subdomain = extractSubdomain(host);
  } else {
    // Preview/localhost: NO cookie fallback (prevents cross-tab contamination)
    // Default to PJU — the redirect below will add ?subdomain=pju to the URL
    subdomain = DEFAULT_SUBDOMAIN;
  }

  // ── PRODUCTION: Strip ?subdomain=xxx and use cookie ──────────
  if (querySubdomain && isValidSubdomain(querySubdomain) && hostCanResolve) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("subdomain");
    const redirectResponse = NextResponse.redirect(cleanUrl);
    redirectResponse.cookies.set("x-subdomain", subdomain, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return redirectResponse;
  }

  // ── PREVIEW: Add ?subdomain=xxx if missing from page URLs ────
  // This ensures the URL bar ALWAYS shows ?subdomain=xxx
  if (!hostCanResolve && !querySubdomain) {
    // Only redirect for page requests, not static assets/API
    const isPageRequest =
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/api/") &&
      !pathname.startsWith("/auth/") &&
      !pathname.includes(".");

    if (isPageRequest) {
      const urlWithSubdomain = new URL(request.url);
      urlWithSubdomain.searchParams.set("subdomain", subdomain);
      return NextResponse.redirect(urlWithSubdomain);
    }
  }

  // ── Set x-subdomain as REQUEST header ───────────────────────
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-subdomain", subdomain);

  // ── Route Protection ────────────────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isDraftRfqRoute = pathname.startsWith("/draft-rfq");
  const isStudioRoute = pathname.startsWith("/studio");
  const isPreviewPdfRoute = pathname.startsWith("/preview-pdf");

  const isProtectedRoute =
    isAdminRoute || isAdminApiRoute || isDashboardRoute ||
    isDraftRfqRoute || isStudioRoute || isPreviewPdfRoute;

  let response: NextResponse;

  if (!isProtectedRoute) {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdminRoute || isAdminApiRoute) {
      if (token.role !== "admin") {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: "Forbidden — admin access required" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // ── Cookie: Only on production ────────────────────────────────
  if (hostCanResolve) {
    const currentCookie = request.cookies.get("x-subdomain")?.value;
    if (currentCookie !== subdomain) {
      response.cookies.set("x-subdomain", subdomain, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|images/|signatures/).*)",
  ],
};
