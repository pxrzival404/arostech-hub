"use client";

/**
 * SpokeProvider — Client-side subdomain context
 *
 * CRITICAL: On preview domains, ?subdomain=xxx is the SOLE source of truth.
 * This provider aggressively enforces that ?subdomain=xxx is ALWAYS present in the URL.
 * If it's missing, it immediately does a window.location redirect to add it.
 * This prevents cross-tab contamination from shared cookies.
 *
 * Subdomain resolution priority on preview domains:
 *   URL ?subdomain=xxx → default ("pju")
 *   NEVER reads cookies on preview domains.
 *
 * On production (xxx.dayaberkah.id), the host resolves the subdomain.
 */

import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import {
  type Subdomain,
  DEFAULT_SUBDOMAIN,
  SUBDOMAIN_LABELS,
  SUBDOMAIN_BRAND_NAMES,
  SUBDOMAIN_TAGLINES,
  SUBDOMAIN_DOMAINS,
  isValidSubdomain,
} from "@/lib/subdomain";
import { FOOTER_PRODUCT_LINKS } from "@/config/site";

interface SpokeContextValue {
  subdomain: Subdomain;
  badgeLabel: string;
  brandName: string;
  tagline: string;
  domain: string;
  footerProductLinks: { label: string; href: string }[];
  /** Whether we're on a preview domain (host can't resolve subdomain) */
  isPreviewDomain: boolean;
  /** Get URL with ?subdomain=xxx appended (for preview domain navigation) */
  getSpokeUrl: (path: string) => string;
}

const SpokeContext = createContext<SpokeContextValue | null>(null);

/**
 * Read subdomain from URL ?subdomain=xxx query parameter.
 * Uses window.location.search directly (no useSearchParams — avoids Suspense requirement).
 */
function getSubdomainFromUrl(): Subdomain | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get("subdomain");
  if (value && isValidSubdomain(value)) return value;
  return null;
}

/**
 * Check if we're on a preview domain where the host can't resolve the subdomain.
 * On production (xxx.dayaberkah.id), this returns false.
 */
function detectPreviewDomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  // Production domains
  if (hostname.endsWith(".dayaberkah.id")) return false;
  // Development subdomain pattern (pju.localhost etc.)
  if (hostname.includes(".")) {
    const parts = hostname.split(".");
    const first = parts[0];
    if (["pju", "baterai", "solarpanel", "penangkalpetir"].includes(first)) return false;
  }
  // Everything else is a preview domain
  return true;
}

export function SpokeProvider({ children }: { children: React.ReactNode }) {
  const [currentSubdomain, setCurrentSubdomain] = useState<Subdomain>(() => {
    return getSubdomainFromUrl() || DEFAULT_SUBDOMAIN;
  });
  const [isPreviewDomain, setIsPreviewDomain] = useState(false);
  const urlEnforced = useState(false);

  // Detect preview domain on mount
  useEffect(() => {
    const isPreview = detectPreviewDomain();
    setIsPreviewDomain(isPreview);

    // AGGRESSIVE ENFORCEMENT: On preview domains, if ?subdomain=xxx is missing,
    // do a hard redirect to add it. This ensures the URL ALWAYS shows the subdomain.
    if (isPreview) {
      const fromUrl = getSubdomainFromUrl();
      if (!fromUrl) {
        // URL is missing ?subdomain=xxx — redirect to add it
        const url = new URL(window.location.href);
        url.searchParams.set("subdomain", DEFAULT_SUBDOMAIN);
        window.location.href = url.toString();
        return;
      }
    }
  }, []);

  // Listen for URL changes (back/forward, focus, Next.js navigation) and update subdomain
  useEffect(() => {
    const checkSubdomain = () => {
      const fromUrl = getSubdomainFromUrl();
      const newSubdomain = fromUrl || DEFAULT_SUBDOMAIN;
      setCurrentSubdomain(prev => prev !== newSubdomain ? newSubdomain : prev);

      // On preview domains, enforce ?subdomain=xxx in URL
      if (detectPreviewDomain() && !fromUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set("subdomain", DEFAULT_SUBDOMAIN);
        window.history.replaceState(null, "", url.toString());
      }
    };

    window.addEventListener("popstate", checkSubdomain);
    window.addEventListener("focus", checkSubdomain);

    // Also poll every 500ms to catch Next.js client-side navigations
    // (router.push() does not trigger popstate)
    const interval = setInterval(checkSubdomain, 500);

    return () => {
      window.removeEventListener("popstate", checkSubdomain);
      window.removeEventListener("focus", checkSubdomain);
      clearInterval(interval);
    };
  }, []);

  /**
   * Build a URL with ?subdomain=xxx appended if on a preview domain.
   * On production, returns the path as-is (subdomain is in the host).
   */
  const getSpokeUrl = useCallback((path: string): string => {
    if (!isPreviewDomain) return path;
    // Always append subdomain to URL on preview domains
    const url = new URL(path, "http://dummy"); // parse the path
    url.searchParams.set("subdomain", currentSubdomain);
    return url.pathname + url.search;
  }, [isPreviewDomain, currentSubdomain]);

  const value = useMemo<SpokeContextValue>(() => {
    return {
      subdomain: currentSubdomain,
      badgeLabel: SUBDOMAIN_LABELS[currentSubdomain],
      brandName: SUBDOMAIN_BRAND_NAMES[currentSubdomain],
      tagline: SUBDOMAIN_TAGLINES[currentSubdomain],
      domain: SUBDOMAIN_DOMAINS[currentSubdomain],
      footerProductLinks: FOOTER_PRODUCT_LINKS[currentSubdomain] || [],
      isPreviewDomain,
      getSpokeUrl,
    };
  }, [currentSubdomain, isPreviewDomain, getSpokeUrl]);

  return <SpokeContext.Provider value={value}>{children}</SpokeContext.Provider>;
}

export function useSpoke(): SpokeContextValue {
  const ctx = useContext(SpokeContext);
  if (!ctx) {
    throw new Error("useSpoke must be used within a SpokeProvider");
  }
  return ctx;
}
