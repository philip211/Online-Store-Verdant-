import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PenLine } from 'lucide-react'
import { ReviewCard, useProductReviews, type Review } from '@/entities/review'
import type { Product } from '@/entities/product'
import { WriteReviewModal } from '@/features/write-review'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button, SectionHeading, Skeleton, Stars } from '@/shared/ui'

type Sort = 'helpful' | 'new' | 'high' | 'low'

export function ProductReviews({ product }: { product: Product }) {
  const { t, tn } = useT()
  const { data, isLoading } = useProductReviews(product.id)
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('helpful')
  const [onlyStars, setOnlyStars] = useState<number | null>(null)
  const SORTS: { id: Sort; label: string }[] = [
    { id: 'helpful', label: t('Most helpful') },
    { id: 'new', label: t('Newest') },
    { id: 'high', label: t('Highest rating') },
    { id: 'low', label: t('Lowest rating') },
  ]

  const all = useMemo<Review[]>(() => data ?? [], [data])

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    all.forEach((r) => (counts[r.rating - 1] += 1))
    const synthetic = Math.max(0, product.reviewsCount - all.length)
    const w = product.rating
    const weights = [0.01, 0.02, 0.05, Math.max(0.05, 5 - w) * 0.6, Math.max(0.2, w - 4) * 2.4]
    const sum = weights.reduce((a, b) => a + b, 0)
    weights.forEach((x, i) => (counts[i] += Math.round((synthetic * x) / sum)))
    const total = counts.reduce((a, b) => a + b, 0) || 1
    return counts.map((c) => ({ c, pct: Math.round((c / total) * 100) })).reverse()
  }, [all, product.rating, product.reviewsCount])

  const list = useMemo(() => {
    const out = onlyStars ? all.filter((r) => r.rating === onlyStars) : [...all]
    switch (sort) {
      case 'new': out.sort((a, b) => b.date.localeCompare(a.date)); break
      case 'high': out.sort((a, b) => b.rating - a.rating); break
      case 'low': out.sort((a, b) => a.rating - b.rating); break
      default: out.sort((a, b) => b.helpful - a.helpful)
    }
    return out
  }, [all, sort, onlyStars])

  return (
    <section id="reviews" className="scroll-mt-28">
      <SectionHeading
        eyebrow={t('Reviews')}
        title={t('What customers say')}
        action={
          <Button variant="outline" onClick={() => setOpen(true)}>
            <PenLine className="size-4" /> {t('Write a review')}
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="border-glow rounded-3xl border border-white/10 glass-card p-6 lg:col-span-4">
          <div className="flex items-end gap-3">
            <span className="font-display text-6xl font-semibold leading-none text-forest-50">{product.rating}</span>
            <div className="pb-1">
              <Stars value={product.rating} size={18} />
              <div className="mt-1 text-sm text-forest-300">{tn(product.reviewsCount, '{count} review', '{count} reviews')}</div>
            </div>
          </div>
          <ul className="mt-5 space-y-2">
            {distribution.map((d, i) => {
              const stars = 5 - i
              const active = onlyStars === stars
              return (
                <li key={stars}>
                  <button onClick={() => setOnlyStars(active ? null : stars)} className={cn('flex w-full items-center gap-3 rounded-lg px-1 py-0.5 text-sm transition hover:bg-white/10', active && 'bg-white/10')} aria-pressed={active}>
                    <span className="w-8 shrink-0 text-forest-100">{stars} ★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <motion.span className="block h-full rounded-full bg-gold-500" initial={{ width: 0 }} whileInView={{ width: `${d.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.05 }} />
                    </span>
                    <span className="w-10 text-right tabular-nums text-forest-300">{d.pct}%</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {onlyStars && (
            <button onClick={() => setOnlyStars(null)} className="mt-3 text-xs font-semibold text-forest-300 hover:underline">{t('Show all ratings')}</button>
          )}
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button key={s.id} onClick={() => setSort(s.id)} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', sort === s.id ? 'border-forest-300 bg-forest-300 text-forest-950' : 'border-white/15 glass-card text-forest-100 hover:border-forest-300/60')}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-3xl" />)
              : list.length
                ? list.map((r) => <ReviewCard key={r.id} review={r} />)
                : <div className="col-span-full rounded-3xl border border-dashed border-white/20 p-10 text-center text-forest-300">{onlyStars ? t('No reviews with this rating yet.') : t('No reviews yet. Be the first!')}</div>}
          </div>
        </div>
      </div>

      <WriteReviewModal product={product} open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
