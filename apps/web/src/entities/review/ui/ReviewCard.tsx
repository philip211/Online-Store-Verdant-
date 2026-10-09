import { BadgeCheck, ThumbsUp } from 'lucide-react'
import { useT } from '@/shared/i18n'
import { cn, formatDate } from '@/shared/lib'
import { Stars } from '@/shared/ui'
import type { Review } from '@verdant/shared'

export function ReviewCard({ review, className, compact }: { review: Review; className?: string; compact?: boolean }) {
  const { t } = useT()
  return (
    <article className={cn('border-glow flex h-full flex-col rounded-3xl border border-white/10 glass-card p-6 shadow-card backdrop-blur', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-forest-800 font-display text-lg font-semibold text-gold-300">{review.author.charAt(0)}</div>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-forest-50">
              {review.author}
              {review.verified && (
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-forest-300">
                  <BadgeCheck className="size-3.5 text-forest-400" /> {t('verified purchase')}
                </span>
              )}
            </div>
            <div className="text-xs text-forest-300">
              {review.city} · {formatDate(review.date)}
            </div>
          </div>
        </div>
        <Stars value={review.rating} size={13} />
      </div>

      <h4 className="mt-4 font-display text-xl font-semibold leading-tight text-forest-50">{review.title}</h4>
      <p className={cn('mt-2 text-sm leading-relaxed text-forest-100', compact && 'line-clamp-3')}>{review.text}</p>

      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-forest-300">
        {review.effect ? <span className="rounded-full bg-white/10 px-2.5 py-1 font-medium text-forest-100">{t('Effect')}: {t(review.effect)}</span> : <span />}
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="size-3.5" /> {review.helpful}
        </span>
      </div>
    </article>
  )
}
