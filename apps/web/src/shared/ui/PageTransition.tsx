import { useEffect, useRef, useState, useTransition, type AnimationEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useOutlet } from 'react-router-dom'
import { STORE_NAME } from '@/shared/config'
import { HempLeaf } from './HempLeaf'

/**
 * Route transition in the store's own language: two skewed frosted-glass "leaves"
 * close over the old page, a gold hemp leaf blooms on the seam, then the leaves
 * part to reveal the new page. Keyframes live in styles/index.css (`.page-veil`).
 *
 * Performance notes:
 * - The page content itself is never animated (no opacity/filter/transform on the
 *   route tree), so the glass cards with backdrop-filter are not repainted per frame.
 * - Only the overlay moves, via CSS keyframes on transform/opacity, which run on the
 *   compositor and keep going even while React is busy rendering the next page.
 * - The overlay exists only while a transition runs, so no idle GPU layers.
 * - The route swap happens while the screen is fully covered, inside a React
 *   transition: a lazily loaded page keeps the veil closed until its chunk is ready,
 *   and the scroll-to-top jump is hidden behind the veil.
 *
 * Render this in place of <Outlet /> inside the layout route.
 */

type Phase = 'idle' | 'closing' | 'covered' | 'opening'

const MIN_HOLD_MS = 110

export function PageTransition() {
  const { pathname } = useLocation()
  const outlet = useOutlet()

  const [shownPath, setShownPath] = useState(pathname)
  const [phase, setPhase] = useState<Phase>('idle')
  const [isPending, startTransition] = useTransition()

  // Snapshot of the last route element rendered while idle; shown while the veil closes.
  const frozenRef = useRef<ReactNode>(outlet)
  const latestPathRef = useRef(pathname)
  const coveredAtRef = useRef(0)
  latestPathRef.current = pathname

  const isCurrent = pathname === shownPath
  // Mount the veil in the very same render that brings the new pathname, so it does
  // not wait for a second commit while the old page is still on screen.
  const effPhase: Phase = !isCurrent && phase === 'idle' ? 'closing' : phase

  useEffect(() => {
    if (isCurrent && phase === 'idle') frozenRef.current = outlet
  })

  // A new pathname arrived: start closing (also restarts a veil that is mid-opening).
  useEffect(() => {
    if (!isCurrent && (phase === 'idle' || phase === 'opening')) setPhase('closing')
  }, [isCurrent, phase])

  // Fully covered and the new page has committed: hide the scroll jump, then open.
  useEffect(() => {
    if (phase !== 'covered' || isPending || !isCurrent) return
    const wait = Math.max(0, MIN_HOLD_MS - (performance.now() - coveredAtRef.current))
    const id = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      setPhase('opening')
    }, wait)
    return () => clearTimeout(id)
  }, [phase, isPending, isCurrent])

  const onSeamAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.animationName.startsWith('veil-close')) {
      coveredAtRef.current = performance.now()
      setPhase('covered')
      startTransition(() => setShownPath(latestPathRef.current))
    } else if (e.animationName.startsWith('veil-open')) {
      setPhase('idle')
    }
  }

  const state = effPhase === 'closing' || effPhase === 'covered' ? 'cover' : 'open'

  return (
    <>
      {isCurrent ? outlet : frozenRef.current}

      {effPhase !== 'idle' &&
        createPortal(
          <div aria-hidden data-page-veil data-state={state} className="page-veil fixed inset-0 z-[80] overflow-hidden">
            {/* right leaf sits behind the seam */}
            <div className="page-veil__leaf page-veil__leaf--r absolute inset-y-0">
              <div className="page-veil__skin page-veil__skin--r absolute inset-0">
                <div className="leaf-tile absolute inset-0 opacity-[0.05] invert" />
              </div>
            </div>

            {/* left leaf carries the gold seam and drives the phase machine */}
            <div className="page-veil__leaf page-veil__leaf--l absolute inset-y-0" onAnimationEnd={onSeamAnimationEnd}>
              <div className="page-veil__skin absolute inset-0">
                <div className="leaf-tile absolute inset-0 opacity-[0.05] invert" />
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gold-400/20 to-transparent" />
                <div className="absolute inset-y-0 right-px w-px bg-white/15" />
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold-300 to-transparent" />
              </div>
            </div>

            {/* brand emblem on the seam */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="page-veil__emblem flex flex-col items-center gap-3">
                <span className="grid size-20 place-items-center rounded-full border border-gold-400/30 bg-forest-950/40 shadow-[0_0_60px_-10px_rgba(201,169,110,0.55)]">
                  <HempLeaf className="size-11 text-gold-400" />
                </span>
                <span className="font-display text-sm uppercase tracking-[0.42em] text-gold-300/85">{STORE_NAME}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
