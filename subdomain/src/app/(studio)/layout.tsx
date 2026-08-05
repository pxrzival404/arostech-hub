/**
 * Sanity Studio — Standalone Layout (no public header/footer)
 *
 * Studio lives in its own route group (studio) so it doesn't inherit
 * the public layout (Header + Footer). It still uses SpokeProvider
 * for multi-tenant context in the Studio custom structure.
 */

import { SpokeProvider } from "@/components/SpokeProvider";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpokeProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        {children}
      </div>
    </SpokeProvider>
  );
}
