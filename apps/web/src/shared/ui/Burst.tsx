import { AnimatePresence, motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 10 }).map((_, i) => {
  const angle = (i / 10) * Math.PI * 2
  return { x: Math.cos(angle) * 46, y: Math.sin(angle) * 46, delay: i * 0.012, gold: i % 3 === 0 }
})

/** Tiny sparkle burst rendered on top of a button after a successful action. */
export function Burst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <span className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible" aria-hidden>
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              className={p.gold ? 'absolute size-2 rounded-full bg-gold-300' : 'absolute size-1.5 rounded-full bg-forest-100'}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          <motion.span
            className="absolute size-6 rounded-full border-2 border-gold-300/70"
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </span>
      )}
    </AnimatePresence>
  )
}
