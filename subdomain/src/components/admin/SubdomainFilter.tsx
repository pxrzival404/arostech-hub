"use client";

/**
 * SubdomainFilter — A reusable filter component for admin pages.
 *
 * Shows a row of buttons for each subdomain category (PJU, Baterai, Solar Panel, Penangkal Petir).
 * When selected, it navigates to the current page with ?subdomain=xxx in the URL.
 * This replaces the sidebar dropdown with an inline filter on each admin page.
 *
 * Wrapped in Suspense because useSearchParams() requires it in Next.js App Router.
 */

import { Suspense } from "react";
import { useSpoke } from "@/components/SpokeProvider";
import { SUPPORTED_SUBDOMAINS, SUBDOMAIN_LABELS } from "@/lib/subdomain";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function SubdomainFilterInner({ className }: { className?: string }) {
  const { subdomain: currentSubdomain, isPreviewDomain } = useSpoke();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (newSubdomain: string) => {
    if (isPreviewDomain) {
      // On preview: navigate with ?subdomain=xxx, preserving other query params
      const params = new URLSearchParams(searchParams.toString());
      params.set("subdomain", newSubdomain);
      router.push(`${pathname}?${params.toString()}`);
    } else {
      // On production: set cookie and reload
      document.cookie = `x-subdomain=${newSubdomain}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      window.location.reload();
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Kategori:</span>
      {SUPPORTED_SUBDOMAINS.map((sd) => (
        <button
          key={sd}
          type="button"
          onClick={() => handleFilterChange(sd)}
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
            sd === currentSubdomain
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 ring-1 ring-emerald-600/30"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          )}
        >
          {SUBDOMAIN_LABELS[sd]}
        </button>
      ))}
    </div>
  );
}

export function SubdomainFilter({ className }: { className?: string }) {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Kategori:</span>
        <div className="h-6 w-48 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
      </div>
    }>
      <SubdomainFilterInner className={className} />
    </Suspense>
  );
}
