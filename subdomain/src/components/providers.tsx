"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Don't throw on session fetch errors (e.g., when domain doesn't match)
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  );
}
