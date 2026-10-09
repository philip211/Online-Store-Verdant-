import { HempLeaf } from './HempLeaf'

/**
 * Page-wide backdrop in the "glass botanical" style: deep green base, out-of-focus foliage,
 * soft light pools and film grain. Fixed and pointer-transparent; content floats on glass above it.
 * Deliberately static: any motion here would force every backdrop-filter surface above to re-blur per frame.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_15%_0%,#24392c_0%,#16241c_45%,#0f1a14_100%)]" />

      {/* out-of-focus foliage */}
      <HempLeaf className="ambient-leaf absolute -left-40 -top-24 size-[44rem] rotate-[18deg] text-forest-600/25 blur-[14px]" />
      <HempLeaf className="ambient-leaf-2 absolute -right-48 top-[28%] size-[52rem] -rotate-[26deg] text-forest-500/20 blur-[22px]" />
      <HempLeaf className="ambient-leaf-3 absolute left-[30%] -bottom-56 size-[40rem] rotate-[64deg] text-forest-700/30 blur-[18px]" />
      <HempLeaf className="ambient-leaf absolute left-[58%] top-[8%] size-[16rem] rotate-[100deg] text-forest-400/15 blur-[6px]" />

      {/* light pools */}
      {/* light pools: radial gradients instead of filter: blur() on huge elements */}
      <div className="ambient-glow absolute -left-[25%] -top-[10%] size-[85vw] rounded-full" style={{ ['--glow-color' as string]: 'rgb(123 174 138 / 0.16)' }} />
      <div className="ambient-glow absolute right-[-30%] top-[15%] size-[80vw] rounded-full" style={{ ['--glow-color' as string]: 'rgb(161 194 159 / 0.11)' }} />
      <div className="ambient-glow absolute left-[5%] bottom-[-45%] size-[75vw] rounded-full" style={{ ['--glow-color' as string]: 'rgb(201 169 110 / 0.08)' }} />

      <div className="absolute inset-0 leaf-tile opacity-[0.035] invert" />
      <div className="absolute inset-0 noise" />
      {/* subtle top vignette so the header sits in */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest-950/70 to-transparent" />
    </div>
  )
}
