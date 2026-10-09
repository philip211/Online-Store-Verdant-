import { CURRENCY } from '@verdant/shared'
import { getIntlLocale, getLocale } from '@/shared/i18n/core'

const priceFormatters = new Map<string, Intl.NumberFormat>()

/** Formats euro cents in the active locale: en-IE → €12.90, de-DE → 12,90 €, fr-FR → 12,90 €. */
export const formatPrice = (cents: number) => {
  const loc = getIntlLocale()
  let f = priceFormatters.get(loc)
  if (!f) {
    f = new Intl.NumberFormat(loc, { style: 'currency', currency: CURRENCY, minimumFractionDigits: 2, maximumFractionDigits: 2 })
    priceFormatters.set(loc, f)
  }
  return f.format(cents / 100)
}

export const formatNumber = (n: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(getIntlLocale(), opts).format(n)

export const formatDiscount = (price: number, oldPrice?: number) => {
  if (!oldPrice || oldPrice <= price) return null
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

/** Kept for API compatibility: languages handled here (en/de/fr) all pluralise on count === 1. */
export const pluralize = (n: number, forms: [string, string, string]) => (Math.abs(n) === 1 ? forms[0] : forms[2])

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(getIntlLocale(), { day: 'numeric', month: 'long', year: 'numeric' })

export const formatShortDate = (d: Date) => d.toLocaleDateString(getIntlLocale(), { day: 'numeric', month: 'long' })

export const formatWeekday = (d: Date) => d.toLocaleDateString(getIntlLocale(), { weekday: 'long' })

/** Localised country name from an ISO code, e.g. DE → Germany / Deutschland / Allemagne. */
export const countryName = (code: string) => {
  try {
    return new Intl.DisplayNames([getIntlLocale()], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

const UNITS: Record<string, Record<string, string>> = {
  pcs: { en: 'pcs', de: 'Stk.', fr: 'pcs' },
}

/** Variant labels are stored as "30 pcs" / "10 ml"; only the unit word needs translating. */
export const formatVariantLabel = (label: string) => {
  const locale = getLocale()
  return label.replace(/\b(pcs)\b/, (u) => UNITS[u]?.[locale] ?? u)
}

/** CBD strength suffix: percent for flowers/oils/tea, milligrams for edibles and cosmetics. */
export const cbdLabel = (cbd: number, category: string) =>
  category === 'cosmetics' || category === 'edibles' ? `${formatNumber(cbd)} mg` : `${formatNumber(cbd)}%`
