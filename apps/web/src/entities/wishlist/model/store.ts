import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  ids: string[]
  toggle: (id: string) => boolean
  has: (id: string) => boolean
  remove: (id: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const exists = get().ids.includes(id)
        set((s) => ({ ids: exists ? s.ids.filter((x) => x !== id) : [id, ...s.ids] }))
        return !exists
      },
      has: (id) => get().ids.includes(id),
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
    }),
    { name: 'verdant:wishlist' },
  ),
)

export const useIsWishlisted = (id: string) => useWishlistStore((s) => s.ids.includes(id))
export const useWishlistCount = () => useWishlistStore((s) => s.ids.length)
