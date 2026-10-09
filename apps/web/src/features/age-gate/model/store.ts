import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AgeGateState {
  verified: boolean
  verifiedAt: number | null
  confirm: () => void
}

export const useAgeGate = create<AgeGateState>()(
  persist(
    (set) => ({
      verified: false,
      verifiedAt: null,
      confirm: () => set({ verified: true, verifiedAt: Date.now() }),
    }),
    { name: 'verdant:age' },
  ),
)
