import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { Crosshair, HeartPulse, Leaf, Moon, Scale, Zap } from 'lucide-react'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { EFFECT_LABELS, type Effect } from '../model/types'

interface Props {
  effect: Effect
  className?: string
  withLabel?: boolean
  hoverOnly?: boolean
}

const loop = (duration: number): Transition => ({ duration, repeat: Infinity, ease: 'easeInOut' })

const CONFIG: Record<Effect, { icon: typeof Leaf; color: string; animate: Record<string, number[]>; transition: Transition }> = {
  relax: { icon: Leaf, color: 'text-forest-400', animate: { rotate: [-8, 8, -8], y: [0, -1.5, 0] }, transition: loop(3.2) },
  sleep: { icon: Moon, color: 'text-indigo-400', animate: { rotate: [-12, 6, -12], scale: [1, 1.08, 1] }, transition: loop(4) },
  focus: { icon: Crosshair, color: 'text-forest-200', animate: { scale: [1, 0.85, 1], rotate: [0, 90, 90] }, transition: loop(2.6) },
  energy: { icon: Zap, color: 'text-amber-400', animate: { scale: [1, 1.2, 1, 1.15, 1], opacity: [1, 0.7, 1, 0.8, 1] }, transition: loop(1.4) },
  balance: { icon: Scale, color: 'text-gold-400', animate: { rotate: [-6, 6, -6] }, transition: loop(3) },
  recovery: { icon: HeartPulse, color: 'text-rose-400', animate: { scale: [1, 1.18, 1, 1.1, 1] }, transition: loop(1.3) },
}

/** Icons animate on hover by default: a row of six looping JS animations in the filter panel
 * (and more in quick view / compare) kept the main thread and GPU busy on every frame. */
export function EffectIcon({ effect, className, withLabel, hoverOnly = true }: Props) {
  const { t } = useT()
  const reduce = useReducedMotion()
  const { icon: Icon, color, animate, transition } = CONFIG[effect]
  const label = t(EFFECT_LABELS[effect].label)

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={label}>
      <motion.span className={cn('inline-flex', color)} animate={reduce || hoverOnly ? undefined : animate} whileHover={hoverOnly ? animate : undefined} transition={transition} aria-hidden>
        <Icon className="size-[1em]" strokeWidth={2.2} />
      </motion.span>
      {withLabel && <span>{label}</span>}
      {!withLabel && <span className="sr-only">{label}</span>}
    </span>
  )
}

export function EffectIcons({ effects, className }: { effects: Effect[]; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {effects.map((e) => (
        <EffectIcon key={e} effect={e} />
      ))}
    </span>
  )
}
