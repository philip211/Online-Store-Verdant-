import { useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  BADGE_LABELS,
  CATEGORY_LABELS,
  EFFECT_LABELS,
  EffectIcon,
  getMinPrice,
  useCatalog,
  type Effect,
  type ProductBadge,
  type ProductCategory,
  type ProductFilters,
} from '@/entities/product'
import { useT } from '@/shared/i18n'
import { cn, formatPrice } from '@/shared/lib'
import { Button } from '@/shared/ui'

interface Props {
  filters: ProductFilters
  onChange: (patch: Partial<ProductFilters>) => void
  onReset: () => void
  activeCount: number
  counts?: Partial<Record<ProductCategory | 'all', number>>
  className?: string
  hideTitle?: boolean
}

const CBD_STEPS = [0, 5, 10, 15, 20]

export function FiltersPanel({ filters, onChange, onReset, activeCount, counts, className, hideTitle }: Props) {
  const { t } = useT()
  const catalog = useCatalog()
  const range = useMemo(() => {
    const prices = catalog.map(getMinPrice)
    return prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : { min: 0, max: 12000 }
  }, [catalog])
  const max = filters.maxPrice ?? range.max
  const min = filters.minPrice ?? range.min

  const toggleIn = <T,>(arr: T[] | undefined, v: T) => (arr?.includes(v) ? arr.filter((x) => x !== v) : [...(arr ?? []), v])

  return (
    <aside className={cn('space-y-8', className)}>
      <div className={cn('flex items-center justify-between', hideTitle && 'justify-end')}>
        {!hideTitle && <h3 className="font-display text-2xl font-semibold text-forest-50">{t('Filters')}</h3>}
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="size-3.5" /> {t('Reset')} ({activeCount})
          </Button>
        )}
      </div>

      <Group title={t('Category')}>
        <ul className="space-y-1">
          {(['all', ...(Object.keys(CATEGORY_LABELS) as ProductCategory[])] as const).map((c) => {
            const active = (filters.category ?? 'all') === c
            return (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => onChange({ category: c })}
                  className={cn('flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition', active ? 'bg-forest-300 font-semibold text-forest-950' : 'text-forest-100 hover:bg-white/10')}
                >
                  {c === 'all' ? t('All products') : t(CATEGORY_LABELS[c])}
                  {counts?.[c] != null && <span className={cn('text-xs tabular-nums', active ? 'text-forest-900' : 'text-forest-300')}>{counts[c]}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </Group>

      <Group title={t('Effect')}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EFFECT_LABELS) as Effect[]).map((e) => (
            <Chip key={e} active={!!filters.effects?.includes(e)} onClick={() => onChange({ effects: toggleIn(filters.effects, e) })}>
              <EffectIcon effect={e} className="text-sm" /> {t(EFFECT_LABELS[e].label)}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title={t('Price')}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm tabular-nums text-forest-100">
            <span>{formatPrice(min)}</span>
            <span>{formatPrice(max)}</span>
          </div>
          <div className="relative h-8">
            <input type="range" min={range.min} max={range.max} step={100} value={min} onChange={(e) => onChange({ minPrice: Math.min(Number(e.target.value), max - 100) })} className="range-input" aria-label={t('Minimum price')} />
            <input type="range" min={range.min} max={range.max} step={100} value={max} onChange={(e) => onChange({ maxPrice: Math.max(Number(e.target.value), min + 100) })} className="range-input" aria-label={t('Maximum price')} />
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15">
              <div className="absolute h-full rounded-full bg-forest-300" style={{ left: `${((min - range.min) / (range.max - range.min)) * 100}%`, right: `${100 - ((max - range.min) / (range.max - range.min)) * 100}%` }} />
            </div>
          </div>
        </div>
      </Group>

      <Group title={t('CBD strength, at least')}>
        <div className="flex flex-wrap gap-2">
          {CBD_STEPS.map((v) => (
            <Chip key={v} active={(filters.minCbd ?? 0) === v} onClick={() => onChange({ minCbd: v || undefined })}>
              {v === 0 ? t('Any') : `${v}%+`}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title={t('Highlights')}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BADGE_LABELS) as ProductBadge[]).map((b) => (
            <Chip key={b} active={!!filters.badges?.includes(b)} onClick={() => onChange({ badges: toggleIn(filters.badges, b) })}>
              {t(BADGE_LABELS[b])}
            </Chip>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-forest-100">
          <input type="checkbox" checked={!!filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} className="size-4 rounded accent-forest-300" />
          {t('In stock only')}
        </label>
      </Group>

      <style>{`
        .range-input{position:absolute;inset:0;width:100%;height:100%;background:transparent;-webkit-appearance:none;appearance:none;pointer-events:none;margin:0}
        .range-input::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:20px;height:20px;border-radius:999px;background:#14381f;border:2px solid #c9a96e;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.4)}
        .range-input::-moz-range-thumb{pointer-events:auto;width:20px;height:20px;border-radius:999px;background:#14381f;border:2px solid #c9a96e;cursor:pointer}
        .range-input::-webkit-slider-runnable-track{background:transparent}
        .range-input::-moz-range-track{background:transparent}
      `}</style>
    </aside>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-forest-300">{title}</h4>
      {children}
    </section>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
        active ? 'border-forest-300 bg-forest-300 text-forest-950 shadow-soft' : 'border-white/15 glass-card text-forest-100 hover:border-forest-300/60',
      )}
    >
      {children}
    </button>
  )
}
