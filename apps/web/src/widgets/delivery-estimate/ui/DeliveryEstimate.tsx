import { useMemo } from 'react'
import { CalendarCheck, Clock3, Truck } from 'lucide-react'
import { useT } from '@/shared/i18n'
import { cn, getDeliveryEstimate, useCountdown } from '@/shared/lib'

export function DeliveryEstimate({ className, country = 'DE' }: { className?: string; country?: string }) {
  const { t, locale } = useT()
  const est = useMemo(() => getDeliveryEstimate(country), [country, locale])
  const { hours, minutes } = useCountdown(est.cutoff)
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest-300/15 text-gold-300">
          <Truck className="size-4" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-x-2 font-semibold text-forest-50">
            <CalendarCheck className="size-4 text-forest-300" /> {t('Delivery {dates}', { dates: est.label })}
            <span className="font-normal text-forest-300">({est.weekday})</span>
          </div>
          {est.dispatchToday ? (
            <div className="mt-1 flex items-center gap-1.5 text-forest-200">
              <Clock3 className="size-3.5 text-gold-500" />
              {t('Order within')} <strong className="tabular-nums">{pad(hours)}:{pad(minutes)}</strong> {t('and we ship today')}
            </div>
          ) : (
            <div className="mt-1 text-forest-200">{t('Ships on the next business day')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
