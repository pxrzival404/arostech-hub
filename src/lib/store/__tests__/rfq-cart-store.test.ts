import { describe, it, expect, beforeEach } from '@jest/globals'
import { act } from '@testing-library/react'

// Reset module cache between tests to get fresh Zustand stores
let useRfqCartStore: typeof import('../rfq-cart-store').useRfqCartStore
let selectItemCount: typeof import('../rfq-cart-store').selectItemCount
let selectTotalQuantity: typeof import('../rfq-cart-store').selectTotalQuantity
let selectHasItem: typeof import('../rfq-cart-store').selectHasItem
let selectCartItems: typeof import('../rfq-cart-store').selectCartItems

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    product_id: 'pju-100w',
    product_name: 'PJU Solar Cell 100W',
    quantity: 10,
    ...overrides,
  }
}

function getState() {
  return useRfqCartStore.getState()
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(async () => {
  // Reset modules to get a fresh store for each test
  jest.resetModules()
  const mod = await import('../rfq-cart-store')
  useRfqCartStore = mod.useRfqCartStore
  selectItemCount = mod.selectItemCount
  selectTotalQuantity = mod.selectTotalQuantity
  selectHasItem = mod.selectHasItem
  selectCartItems = mod.selectCartItems

  // Clear persisted state
  localStorage.removeItem('dbsn-rfq-cart')
  act(() => {
    useRfqCartStore.setState({ items: [] })
  })
})

// ─── addItem ────────────────────────────────────────────────────────────────

describe('addItem', () => {
  it('should add a valid item to an empty cart', () => {
    const item = makeItem()
    act(() => { getState().addItem(item) })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].product_id).toBe('pju-100w')
    expect(getState().items[0].product_name).toBe('PJU Solar Cell 100W')
    expect(getState().items[0].quantity).toBe(10)
  })

  it('should add multiple distinct items', () => {
    act(() => {
      getState().addItem(makeItem({ product_id: 'pju-100w' }))
      getState().addItem(makeItem({ product_id: 'pju-200w', product_name: 'PJU 200W' }))
      getState().addItem(makeItem({ product_id: 'battery-12v', product_name: 'Battery 12V' }))
    })

    expect(getState().items).toHaveLength(3)
  })

  it('should merge quantity when adding same product_id + same variant', () => {
    act(() => {
      getState().addItem(makeItem({ quantity: 10 }))
      getState().addItem(makeItem({ quantity: 5 }))
    })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].quantity).toBe(15)
  })

  it('should treat same product_id with different variants as separate line items', () => {
    act(() => {
      getState().addItem(makeItem({ variant: '100W' }))
      getState().addItem(makeItem({ variant: '200W' }))
    })

    expect(getState().items).toHaveLength(2)
    expect(getState().items[0].variant).toBe('100W')
    expect(getState().items[1].variant).toBe('200W')
  })

  it('should treat undefined and empty-string variants as equivalent', () => {
    act(() => {
      getState().addItem(makeItem({ variant: undefined, quantity: 10 }))
      getState().addItem(makeItem({ variant: '', quantity: 5 }))
    })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].quantity).toBe(15)
  })

  it('should clamp merged quantity to 100000', () => {
    act(() => {
      getState().addItem(makeItem({ quantity: 99999 }))
      getState().addItem(makeItem({ quantity: 50 }))
    })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].quantity).toBe(100000)
  })

  it('should update item_notes when merging if new item provides them', () => {
    act(() => {
      getState().addItem(makeItem({ item_notes: 'Original note' }))
      getState().addItem(makeItem({ item_notes: 'Updated note' }))
    })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].item_notes).toBe('Updated note')
  })

  it('should reject an item with missing product_id', () => {
    expect(() => {
      act(() => {
        getState().addItem(makeItem({ product_id: '' }))
      })
    }).toThrow()
  })

  it('should reject an item with invalid quantity', () => {
    expect(() => {
      act(() => {
        getState().addItem(makeItem({ quantity: 0 }))
      })
    }).toThrow()
  })

  it('should trim product_name via Zod validation', () => {
    act(() => {
      getState().addItem(makeItem({ product_name: '  Solar Panel  ' }))
    })

    expect(getState().items[0].product_name).toBe('Solar Panel')
  })
})

// ─── removeItem ─────────────────────────────────────────────────────────────

describe('removeItem', () => {
  it('should remove an item by product_id', () => {
    act(() => {
      getState().addItem(makeItem({ product_id: 'a' }))
      getState().addItem(makeItem({ product_id: 'b', product_name: 'B' }))
    })

    act(() => { getState().removeItem('a') })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].product_id).toBe('b')
  })

  it('should remove only the matching variant', () => {
    act(() => {
      getState().addItem(makeItem({ variant: '100W' }))
      getState().addItem(makeItem({ variant: '200W' }))
    })

    act(() => { getState().removeItem('pju-100w', '100W') })

    expect(getState().items).toHaveLength(1)
    expect(getState().items[0].variant).toBe('200W')
  })

  it('should no-op if product_id not found', () => {
    act(() => {
      getState().addItem(makeItem())
    })

    act(() => { getState().removeItem('nonexistent') })

    expect(getState().items).toHaveLength(1)
  })
})

// ─── updateQuantity ─────────────────────────────────────────────────────────

describe('updateQuantity', () => {
  it('should update quantity for a specific item', () => {
    act(() => {
      getState().addItem(makeItem({ quantity: 10 }))
    })

    act(() => { getState().updateQuantity('pju-100w', 50) })

    expect(getState().items[0].quantity).toBe(50)
  })

  it('should clamp quantity to minimum of 1', () => {
    act(() => {
      getState().addItem(makeItem())
    })

    act(() => { getState().updateQuantity('pju-100w', 0) })

    expect(getState().items[0].quantity).toBe(1)
  })

  it('should clamp quantity to maximum of 100000', () => {
    act(() => {
      getState().addItem(makeItem())
    })

    act(() => { getState().updateQuantity('pju-100w', 200000) })

    expect(getState().items[0].quantity).toBe(100000)
  })

  it('should update only the matching variant', () => {
    act(() => {
      getState().addItem(makeItem({ variant: '100W', quantity: 10 }))
      getState().addItem(makeItem({ variant: '200W', quantity: 20 }))
    })

    act(() => { getState().updateQuantity('pju-100w', 99, '100W') })

    expect(getState().items[0].quantity).toBe(99)
    expect(getState().items[1].quantity).toBe(20) // unchanged
  })

  it('should no-op if product_id not found', () => {
    act(() => {
      getState().addItem(makeItem({ quantity: 10 }))
    })

    act(() => { getState().updateQuantity('nonexistent', 999) })

    expect(getState().items[0].quantity).toBe(10)
  })
})

// ─── updateItemNotes ────────────────────────────────────────────────────────

describe('updateItemNotes', () => {
  it('should update item_notes for a specific item', () => {
    act(() => {
      getState().addItem(makeItem())
    })

    act(() => { getState().updateItemNotes('pju-100w', 'Need IP65 rating') })

    expect(getState().items[0].item_notes).toBe('Need IP65 rating')
  })

  it('should update notes only for the matching variant', () => {
    act(() => {
      getState().addItem(makeItem({ variant: '100W' }))
      getState().addItem(makeItem({ variant: '200W' }))
    })

    act(() => { getState().updateItemNotes('pju-100w', 'Only for 100W', '100W') })

    expect(getState().items[0].item_notes).toBe('Only for 100W')
    expect(getState().items[1].item_notes).toBeUndefined()
  })
})

// ─── clearCart ───────────────────────────────────────────────────────────────

describe('clearCart', () => {
  it('should remove all items', () => {
    act(() => {
      getState().addItem(makeItem({ product_id: 'a' }))
      getState().addItem(makeItem({ product_id: 'b', product_name: 'B' }))
      getState().addItem(makeItem({ product_id: 'c', product_name: 'C' }))
    })

    expect(getState().items).toHaveLength(3)

    act(() => { getState().clearCart() })

    expect(getState().items).toHaveLength(0)
  })

  it('should be idempotent on empty cart', () => {
    act(() => { getState().clearCart() })
    expect(getState().items).toHaveLength(0)
  })
})

// ─── Selectors ──────────────────────────────────────────────────────────────

describe('Selectors', () => {
  it('selectItemCount should return number of line items', () => {
    act(() => {
      getState().addItem(makeItem({ product_id: 'a' }))
      getState().addItem(makeItem({ product_id: 'b', product_name: 'B' }))
    })

    expect(selectItemCount(getState())).toBe(2)
  })

  it('selectItemCount should return 0 for empty cart', () => {
    expect(selectItemCount(getState())).toBe(0)
  })

  it('selectTotalQuantity should sum all item quantities', () => {
    act(() => {
      getState().addItem(makeItem({ product_id: 'a', quantity: 10 }))
      getState().addItem(makeItem({ product_id: 'b', product_name: 'B', quantity: 25 }))
    })

    expect(selectTotalQuantity(getState())).toBe(35)
  })

  it('selectTotalQuantity should return 0 for empty cart', () => {
    expect(selectTotalQuantity(getState())).toBe(0)
  })

  it('selectHasItem should return true for existing product+variant', () => {
    act(() => {
      getState().addItem(makeItem({ variant: '100W' }))
    })

    expect(selectHasItem('pju-100w', '100W')(getState())).toBe(true)
    expect(selectHasItem('pju-100w', '200W')(getState())).toBe(false)
    expect(selectHasItem('nonexistent')(getState())).toBe(false)
  })

  it('selectCartItems should return the items array', () => {
    act(() => {
      getState().addItem(makeItem())
    })

    const items = selectCartItems(getState())
    expect(items).toHaveLength(1)
    expect(items[0].product_id).toBe('pju-100w')
  })
})
