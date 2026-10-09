import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COMPARE_LIMIT } from '@/shared/config'

interface CompareState {
  ids: string[]
  toggle: (id: string) => 'added' | 'removed' | 'full'
  remove: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get()
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) })
          return 'removed'
        }
        if (ids.length >= COMPARE_LIMIT) return 'full'
        set({ ids: [...ids, id] })
        return 'added'
      },
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'verdant:compare' },
  ),
)

export const useIsCompared = (id: string) => useCompareStore((s) => s.ids.includes(id))
export const useCompareCount = () => useCompareStore((s) => s.ids.length)
