import { deliveryDaysFor, DISPATCH_CUTOFF_HOUR, type DeliveryMethod } from '@verdant/shared'
import { formatShortDate, formatWeekday } from './format'

const addBusinessDays = (from: Date, days: number) => {
  const d = new Date(from)
  let left = days
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left -= 1
  }
  return d
}

export interface DeliveryEstimate {
  dispatchToday: boolean
  cutoff: Date
  from: Date
  to: Date
  label: string
  weekday: string
}

export function getDeliveryEstimate(country = 'DE', method: DeliveryMethod = 'standard', now = new Date()): DeliveryEstimate {
  const [minDays, maxDays] = deliveryDaysFor(method, country)
  const cutoff = new Date(now)
  cutoff.setHours(DISPATCH_CUTOFF_HOUR, 0, 0, 0)
  const weekend = now.getDay() === 0 || now.getDay() === 6
  const dispatchToday = now < cutoff && !weekend
  const base = dispatchToday ? now : addBusinessDays(now, 1)
  const from = addBusinessDays(base, minDays)
  const to = addBusinessDays(base, maxDays)
  const label = from.getMonth() === to.getMonth() ? `${from.getDate()}–${formatShortDate(to)}` : `${formatShortDate(from)} – ${formatShortDate(to)}`
  return { dispatchToday, cutoff, from, to, label, weekday: formatWeekday(from) }
}
