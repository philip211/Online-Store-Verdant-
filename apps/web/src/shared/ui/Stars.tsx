import { Star } from 'lucide-react'
import { cn } from '@/shared/lib'

interface StarsProps {
  value: number
  size?: number
  className?: string
  interactive?: boolean
  onChange?: (v: number) => void
}

export function Stars({ value, size = 14, className, interactive, onChange }: StarsProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={'Rating ' + value + ' of 5'}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, value - i))
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={cn('relative', interactive ? 'cursor-pointer transition hover:scale-110' : 'cursor-default')}
            style={{ width: size, height: size }}
          >
            <Star style={{ width: size, height: size }} className="absolute inset-0 text-white/20" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: fill * 100 + '%' }}>
              <Star style={{ width: size, height: size }} className="text-gold-500" fill="currentColor" strokeWidth={0} />
            </span>
          </button>
        )
      })}
    </span>
  )
}
