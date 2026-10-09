import { cn, formatPrice, formatVariantLabel } from '@/shared/lib'
import type { ProductVariant } from '../model/types'

interface Props {
  variants: ProductVariant[]
  value: ProductVariant
  onChange: (v: ProductVariant) => void
  className?: string
}

export function VariantSelector({ variants, value, onChange, className }: Props) {
  if (variants.length <= 1) return null
  const base = variants[0].price / parseFloat(variants[0].label)
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {variants.map((v) => {
        const active = v.id === value.id
        const unit = parseFloat(v.label)
        const perUnit = Number.isFinite(unit) && unit > 0 ? v.price / unit : null
        const save = perUnit && base ? Math.round((1 - perUnit / base) * 100) : 0
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v)}
            disabled={v.stock <= 0}
            aria-pressed={active}
            className={cn(
              'relative flex min-w-24 flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition-all duration-200',
              active ? 'border-forest-300 bg-forest-300 text-forest-950 shadow-soft' : 'border-white/15 glass-card text-forest-100 hover:border-forest-300/60',
              v.stock <= 0 && 'opacity-40 line-through',
            )}
          >
            <span className="text-sm font-semibold">{formatVariantLabel(v.label)}</span>
            <span className={cn('text-xs tabular-nums', active ? 'text-forest-900' : 'text-forest-300')}>
              {formatPrice(v.price)}
              {save > 0 && v.stock > 0 && <span className="ml-1.5 font-semibold">−{save}%</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
