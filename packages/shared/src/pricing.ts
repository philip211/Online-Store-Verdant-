import {
  DELIVERY_OPTIONS,
  FLOWER_RESTRICTED_COUNTRIES,
  FREE_SHIPPING_THRESHOLD,
  POINTS_RATE,
  PROMO_CODES,
  RESTRICTED_CATEGORIES,
  SHIPPING_COST,
  SHIPPING_COUNTRIES,
  SUBSCRIPTION_DISCOUNT,
} from './constants'
import type { CartTotals, DeliveryMethod, PricedLine, ProductCategory, ShippingZone } from './types'

/** Single source of truth for cart math: used by the web cart and re-run on the server when an order is placed. */
export function computeTotals(items: PricedLine[], promoCode: string | null | undefined): CartTotals {
  const count = items.reduce((n, i) => n + i.qty, 0)
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0)
  const savings = items.reduce((n, i) => n + ((i.oldPrice ?? i.price) - i.price) * i.qty, 0)
  const subscriptionDiscount = Math.round(
    items.filter((i) => i.subscription).reduce((n, i) => n + i.price * i.qty * SUBSCRIPTION_DISCOUNT, 0),
  )
  const afterSub = subtotal - subscriptionDiscount
  const promo = promoCode ? PROMO_CODES[promoCode.toUpperCase()] : null
  const promoDiscount = promo
    ? promo.type === 'percent'
      ? Math.round((afterSub * promo.value) / 100)
      : Math.min(promo.value, afterSub)
    : 0
  const goods = afterSub - promoDiscount
  const shipping = goods === 0 || goods >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  return {
    count,
    subtotal,
    savings,
    promoDiscount,
    subscriptionDiscount,
    shipping,
    total: goods + shipping,
    freeShippingLeft: Math.max(0, FREE_SHIPPING_THRESHOLD - goods),
    freeShippingProgress: Math.min(1, goods / FREE_SHIPPING_THRESHOLD),
  }
}

export const zoneFor = (country: string): ShippingZone | null => SHIPPING_COUNTRIES[country.toUpperCase()] ?? null
export const canShipTo = (country: string) => zoneFor(country) !== null

export function deliveryPriceFor(method: DeliveryMethod, country: string, totals: CartTotals) {
  const zone = zoneFor(country) ?? 2
  const option = DELIVERY_OPTIONS.find((d) => d.id === method) ?? DELIVERY_OPTIONS[0]
  // Free shipping covers the standard service; express and pickup keep their surcharge above the baseline.
  if (totals.shipping === 0) return method === 'standard' ? 0 : Math.max(0, option.price[zone] - DELIVERY_OPTIONS[0].price[zone])
  return option.price[zone]
}

export function deliveryDaysFor(method: DeliveryMethod, country: string): [number, number] {
  const zone = zoneFor(country) ?? 2
  return (DELIVERY_OPTIONS.find((d) => d.id === method) ?? DELIVERY_OPTIONS[0]).days[zone]
}

export function grandTotalFor(totals: CartTotals, deliveryPrice: number) {
  return totals.total - totals.shipping + deliveryPrice
}

export const pointsFor = (grandTotal: number) => Math.round(grandTotal * POINTS_RATE)

export const isValidPromo = (code: string) => code.trim().toUpperCase() in PROMO_CODES

/** Categories that cannot be shipped to the given country (empty when everything is allowed). */
export function restrictedCategoriesFor(country: string): ProductCategory[] {
  return FLOWER_RESTRICTED_COUNTRIES.includes(country.toUpperCase()) ? RESTRICTED_CATEGORIES : []
}
