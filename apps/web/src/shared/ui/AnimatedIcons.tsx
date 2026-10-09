import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Gift, PartyPopper, type LucideProps } from 'lucide-react'
import { cn } from '@/shared/lib'

type IconProps = LucideProps & { className?: string }

const spring = { type: 'spring', stiffness: 260, damping: 14 } as const

/** Flickering flame for "sold today" urgency. */
/** CSS-driven flicker (see .flame in index.css). Paused until the surrounding .group/link is hovered,
 * or always on with `always`: a dozen of these per grid used to run JS animations on every frame. */
export function AnimatedFlame({ className, always, ...rest }: IconProps & { always?: boolean }) {
  return (
    <span className={cn('flame text-orange-500', always && 'flame--always', className)} aria-hidden>
      <Flame className="size-[1em]" fill="currentColor" fillOpacity={0.25} {...rest} />
    </span>
  )
}

/** Confetti pop with twinkling sparkles, for success moments. */
export function AnimatedParty({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={cn('relative inline-flex align-middle', className)} aria-hidden>
      <motion.span
        initial={{ scale: 0.6, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={spring}
        className="inline-flex text-gold-600"
      >
        <PartyPopper className="size-[1em]" />
      </motion.span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute text-gold-500"
          style={{ left: `${40 + i * 25}%`, top: `${-20 - i * 10}%` }}
          animate={reduce ? undefined : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4], y: [4, -6, -12] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
        >
          <span className="block size-[0.3em] rounded-full bg-current" />
        </motion.span>
      ))}
    </span>
  )
}

/** Gift box gently bouncing, for perks and promo callouts. */
export function AnimatedGift({ className, ...rest }: IconProps) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={cn('inline-flex', className)}
      animate={reduce ? undefined : { y: [0, -3, 0], rotate: [0, -4, 4, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <Gift className="size-[1em]" {...rest} />
    </motion.span>
  )
}
