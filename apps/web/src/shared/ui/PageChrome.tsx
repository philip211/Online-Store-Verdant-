import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useIsFetching } from '@tanstack/react-query'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

/** Thin gold progress bar: shows while a route changes or queries are in flight. */
export function TopProgress() {
  const fetching = useIsFetching()
  const { pathname } = useLocation()
  const [routeBusy, setRouteBusy] = useState(false)
  useEffect(() => {
    setRouteBusy(true)
    const t = setTimeout(() => setRouteBusy(false), 450)
    return () => clearTimeout(t)
  }, [pathname])
  const active = routeBusy || fetching > 0
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="top-progress"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] overflow-hidden"
          aria-hidden
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-gold-400 to-gold-300 shadow-[0_0_12px_rgba(227,207,163,0.8)]"
            initial={{ x: '-100%' }}
            animate={{ x: '300%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Floating "back to top" with a reading-progress ring. Desktop only (phones have the tab bar). */
export function ScrollTopButton() {
  const { scrollYProgress, scrollY } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })
  const dash = useTransform(progress, (v) => 113 * (1 - v))
  const [visible, setVisible] = useState(false)
  useEffect(() => scrollY.on('change', (v) => setVisible(v > 600)), [scrollY])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="glass-card fixed bottom-6 right-6 z-40 hidden size-12 place-items-center rounded-full text-forest-50 shadow-glow lg:grid"
        >
          <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <motion.circle cx="20" cy="20" r="18" fill="none" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeDasharray="113" style={{ strokeDashoffset: dash }} />
          </svg>
          <ArrowUp className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/** Cursor spotlight for every .glass-card: sets --mx/--my on the hovered card (desktop only). */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('.glass-card')
      if (!card) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])
}
