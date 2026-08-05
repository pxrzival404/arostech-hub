'use client'

import { useState, useEffect } from 'react'
import {
  useRfqCartStore,
  selectItemCount,
  selectTotalQuantity,
  selectHasItem,
  selectCartItems,
} from '@/lib/store/rfq-cart-store'

// ─── Re-exports for convenience ─────────────────────────────────────────────

export {
  useRfqCartStore,
  selectItemCount,
  selectTotalQuantity,
  selectHasItem,
  selectCartItems,
}

// ─── Hydration guard ────────────────────────────────────────────────────────

/**
 * Returns `true` once the Zustand persist middleware has finished hydrating
 * from localStorage. Use this to prevent hydration mismatches in SSR:
 *
 * ```tsx
 * const hydrated = useRfqCartHydrated()
 * const count = useRfqCartStore(selectItemCount)
 *
 * // Show placeholder until hydrated to avoid SSR mismatch
 * if (!hydrated) return <CartBadgeSkeleton />
 * return <CartBadge count={count} />
 * ```
 */
export function useRfqCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // If already hydrated (e.g., navigating between pages within the SPA)
    if (useRfqCartStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }

    // Listen for hydration completion
    const unsub = useRfqCartStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    return unsub
  }, [])

  return hydrated
}
