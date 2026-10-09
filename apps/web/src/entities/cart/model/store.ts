import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { computeTotals as sharedComputeTotals, PROMO_CODES, type CartTotals, type OrderItem } from '@verdant/shared'
import { t } from '@/shared/i18n/core'

/** A cart line has the same shape as an order line: the server re-prices it on checkout. */
export type CartItem = OrderItem
export type { CartTotals }

interface CartState {
  items: CartItem[]
  promoCode: string | null
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'key' | 'qty'> & { qty?: number }) => void
  removeItem: (key: string) => void
  setQty: (key: string, qty: number) => void
  toggleSubscription: (key: string) => void
  applyPromo: (code: string) => { ok: boolean; message: string }
  clearPromo: () => void
  clear: () => void
  open: () => void
  close: () => void
}

export const makeCartKey = (productId: string, variantId: string, subscription: boolean, bundle = false) =>
  `${productId}:${variantId}:${subscription ? 'sub' : 'once'}${bundle ? ':bundle' : ''}`

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      isOpen: false,
      addItem: (item) => {
        const key = makeCartKey(item.productId, item.variantId, item.subscription, item.bundle)
        const qty = item.qty ?? 1
        set((s) => {
          const existing = s.items.find((i) => i.key === key)
          if (existing) {
            return { items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.maxQty, i.qty + qty) } : i)) }
          }
          return { items: [...s.items, { ...item, key, qty: Math.min(item.maxQty, qty) }] }
        })
      },
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(i.maxQty, qty) } : i)),
        })),
      toggleSubscription: (key) =>
        set((s) => ({
          items: s.items.map((i) => {
            if (i.key !== key) return i
            const subscription = !i.subscription
            return { ...i, subscription, key: makeCartKey(i.productId, i.variantId, subscription, i.bundle) }
          }),
        })),
      applyPromo: (raw) => {
        const code = raw.trim().toUpperCase()
        if (!PROMO_CODES[code]) return { ok: false, message: t('This promo code is invalid or has expired') }
        if (get().promoCode === code) return { ok: false, message: t('This promo code is already applied') }
        set({ promoCode: code })
        return { ok: true, message: t(PROMO_CODES[code].label) }
      },
      clearPromo: () => set({ promoCode: null }),
      clear: () => set({ items: [], promoCode: null }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'verdant:cart', partialize: (s) => ({ items: s.items, promoCode: s.promoCode }) },
  ),
)

export const computeTotals = (items: CartItem[], promoCode: string | null) => sharedComputeTotals(items, promoCode)

export const useCartTotals = () => {
  const items = useCartStore((s) => s.items)
  const promoCode = useCartStore((s) => s.promoCode)
  return computeTotals(items, promoCode)
}

export const useCartCount = () => useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
