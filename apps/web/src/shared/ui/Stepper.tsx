import { Minus, Plus } from 'lucide-react'
import { cn } from '@/shared/lib'

interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function Stepper({ value, onChange, min = 1, max = 99, size = 'md', className }: StepperProps) {
  const btn = cn(
    'grid place-items-center rounded-full text-forest-200 transition hover:bg-white/10 disabled:opacity-30',
    size === 'sm' ? 'size-8' : 'size-10',
  )
  return (
    <div className={cn('inline-flex items-center rounded-full border border-white/15 glass-card p-1', className)}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
        <Minus className="size-4" />
      </button>
      <span className={cn('min-w-8 text-center font-semibold tabular-nums', size === 'sm' ? 'text-sm' : 'text-base')}>
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        <Plus className="size-4" />
      </button>
    </div>
  )
}
