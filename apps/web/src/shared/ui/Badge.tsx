import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib'

type Tone = 'forest' | 'gold' | 'cream' | 'danger' | 'dark' | 'outline'

const tones: Record<Tone, string> = {
  forest: 'bg-forest-300 text-forest-950',
  gold: 'bg-gold-500 text-forest-950',
  cream: 'bg-white/15 text-forest-50 ring-1 ring-white/15',
  danger: 'bg-rose-500 text-white',
  dark: 'bg-forest-950/90 text-forest-100 ring-1 ring-gold-500/50',
  outline: 'ring-1 ring-white/25 text-forest-50 bg-forest-950/70',
}

export function Badge({ className, tone = 'forest', ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
        tones[tone],
        className,
      )}
      {...rest}
    />
  )
}
