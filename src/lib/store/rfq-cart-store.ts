import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { rfqCartItemSchema, type RfqCartItem } from '@/lib/schema/rfq-schemas'

// ─── State shape ────────────────────────────────────────────────────────────

interface RfqCartState {
  items: RfqCartItem[]

  // ── Mutations ──
  addItem: (item: RfqCartItem) => void
  removeItem: (productId: string, variant?: string) => void
  updateQuantity: (productId: string, quantity: number, variant?: string) => void
  updateItemNotes: (productId: string, notes: string, variant?: string) => void
  clearCart: () => void
}

// ─── Selectors (subscribe to slices, prevent unnecessary re-renders) ───────

/** Total number of distinct line items in the cart */
export const selectItemCount = (state: RfqCartState) => state.items.length

/** Sum of all item quantities across the cart */
export const selectTotalQuantity = (state: RfqCartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)

/** Check if a specific product+variant combination exists in the cart */
export const selectHasItem = (productId: string, variant?: string) =>
  (state: RfqCartState) =>
    state.items.some(
      (item) =>
        item.product_id === productId &&
        (item.variant ?? '') === (variant ?? '')
    )

/** Get all cart items (stable reference if items haven't changed) */
export const selectCartItems = (state: RfqCartState) => state.items

// ─── Internal helpers ───────────────────────────────────────────────────────

/**
 * Find the index of an item by product_id + variant combination.
 * Treats undefined/empty-string variants as equivalent.
 */
function findItemIndex(
  items: readonly RfqCartItem[],
  productId: string,
  variant?: string
): number {
  return items.findIndex(
    (item) =>
      item.product_id === productId &&
      (item.variant ?? '') === (variant ?? '')
  )
}

/** Clamp quantity to the Zod schema bounds: [1, 100000] */
function clampQuantity(qty: number): number {
  return Math.max(1, Math.min(qty, 100000))
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useRfqCartStore = create<RfqCartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (newItem) => {
        // Validate at the boundary — throws ZodError if invalid
        const validated = rfqCartItemSchema.parse(newItem)

        set((state) => {
          const existingIndex = findItemIndex(
            state.items,
            validated.product_id,
            validated.variant
          )

          if (existingIndex !== -1) {
            // Merge: increment quantity for same product+variant
            const updated = [...state.items]
            const existing = updated[existingIndex]
            updated[existingIndex] = {
              ...existing,
              quantity: clampQuantity(existing.quantity + validated.quantity),
              // Update item_notes if the new item provides them
              ...(validated.item_notes ? { item_notes: validated.item_notes } : {}),
            }
            return { items: updated }
          }

          // New line item
          return { items: [...state.items, validated] }
        })
      },

      removeItem: (productId, variant) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product_id === productId &&
                (item.variant ?? '') === (variant ?? '')
              )
          ),
        })),

      updateQuantity: (productId, quantity, variant) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId &&
            (item.variant ?? '') === (variant ?? '')
              ? { ...item, quantity: clampQuantity(quantity) }
              : item
          ),
        })),

      updateItemNotes: (productId, notes, variant) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product_id === productId &&
            (item.variant ?? '') === (variant ?? '')
              ? { ...item, item_notes: notes }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'dbsn-rfq-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array, not the action functions
      partialize: (state) => ({ items: state.items }),
    }
  )
)

// ─── Type export for external consumers ─────────────────────────────────────

export type { RfqCartState }
