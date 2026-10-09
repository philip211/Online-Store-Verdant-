import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/shared/lib'
import { HempLeaf } from './HempLeaf'

interface Leaf {
  x: string
  y: string
  size: number
  rotate: number
  depth: number // 0 = far (blurred, slow), 1 = near (sharp, fast)
  opacity: number
  duration: number
}

const LEAVES: Leaf[] = [
  { x: '4%', y: '8%', size: 220, rotate: -18, depth: 0.2, opacity: 0.08, duration: 18 },
  { x: '78%', y: '4%', size: 300, rotate: 24, depth: 0.5, opacity: 0.1, duration: 22 },
  { x: '58%', y: '62%', size: 160, rotate: 55, depth: 0.9, opacity: 0.14, duration: 14 },
  { x: '14%', y: '68%', size: 260, rotate: -40, depth: 0.35, opacity: 0.07, duration: 26 },
  { x: '88%', y: '58%', size: 200, rotate: 10, depth: 0.7, opacity: 0.11, duration: 16 },
  { x: '40%', y: '-6%', size: 130, rotate: 80, depth: 1, opacity: 0.12, duration: 12 },
]

/**
 * Atmospheric background for dark sections: sun rays through foliage,
 * parallax hemp leaves at different depths, gold glow and grain.
 */
export function LeafField({ className, rays = true, dense = false }: { className?: string; rays?: boolean; dense?: boolean }) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const slow = useTransform(scrollY, [0, 1200], [0, -60])
  const fast = useTransform(scrollY, [0, 1200], [0, -180])
  const leaves = dense ? LEAVES : LEAVES.slice(0, 4)

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {/* deep gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,#1c4d2e_0%,#14381f_45%,#0d1f16_100%)]" />

      {/* sun rays */}
      {rays && (
        <>
          <div className="sun-rays absolute -top-[30%] left-[10%] h-[160%] w-[70%] opacity-70" />
          <div className="sun-rays-2 absolute -top-[20%] right-[-10%] h-[150%] w-[60%] opacity-50" />
        </>
      )}

      {/* colored glows: radial gradients, no filter: blur() on 900px elements */}
      <div className="ambient-glow absolute -left-[25%] -top-[15%] size-[90vw] max-w-[1300px] rounded-full" style={{ ['--glow-color' as string]: 'rgb(90 160 109 / 0.28)' }} />
      <div className="ambient-glow absolute right-[-25%] bottom-[-45%] size-[75vw] max-w-[1100px] rounded-full" style={{ ['--glow-color' as string]: 'rgb(201 169 110 / 0.16)' }} />

      {/* parallax leaves: move only with scroll. The old per-leaf infinite sway was a JS animation
          on a blurred layer, i.e. a GPU blur pass per leaf on every frame, even when nothing else moved. */}
      {leaves.map((l, i) => (
        <motion.div
          key={i}
          style={{
            left: l.x,
            top: l.y,
            width: l.size,
            height: l.size,
            y: reduce ? 0 : l.depth > 0.6 ? fast : slow,
            rotate: l.rotate,
            filter: `blur(${(1 - l.depth) * 6}px)`,
            opacity: l.opacity,
          }}
          className="absolute"
        >
          <HempLeaf className="h-full w-full text-forest-100" />
        </motion.div>
      ))}

      {/* fine leaf tile + grain */}
      <div className="absolute inset-0 leaf-tile opacity-[0.05]" />
      <div className="absolute inset-0 noise" />
      {/* bottom vignette so text stays legible */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest-950/60 to-transparent" />
    </div>
  )
}

/** Wavy gold edge, echoing the curved gold line of the brand reference. */
export function WaveDivider({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-x-0 z-10 h-16 sm:h-24', flip ? 'top-0 rotate-180' : 'bottom-0', className)}>
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="wave-gold" x1="0" x2="1">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0" />
            <stop offset="30%" stopColor="#e3cfa3" />
            <stop offset="70%" stopColor="#c9a96e" />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 64 C 240 8, 480 120, 720 56 S 1200 8, 1440 64 L1440 96 L0 96 Z" fill="#14201a" />
        <path d="M0 64 C 240 8, 480 120, 720 56 S 1200 8, 1440 64" fill="none" stroke="url(#wave-gold)" strokeWidth="2" />
      </svg>
    </div>
  )
}
