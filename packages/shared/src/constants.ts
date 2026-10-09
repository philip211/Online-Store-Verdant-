import type { DeliveryMethod, PaymentMethod, ProductCategory, PromoCode, ShippingZone } from './types'

export const STORE_NAME = 'Verdant'
export const SITE_URL = 'https://verdant.eu'
export const CURRENCY = 'EUR'
export const LEGAL_AGE = 18
export const SUBSCRIPTION_DISCOUNT = 0.15
export const BUNDLE_DISCOUNT = 0.1
export const POINTS_RATE = 0.05
export const DISPATCH_CUTOFF_HOUR = 15
export const COMPARE_LIMIT = 3
export const SUPPORT_PHONE = '+49 30 1234 5678'
export const SUPPORT_EMAIL = 'care@verdant.eu'
export const VAT_RATE = 0.19
/** Statutory withdrawal period in days, counted from receipt of the goods. */
export const WITHDRAWAL_DAYS = 14
/**
 * The withdrawal button stays available this many days after the order is placed: the 14 days run from
 * delivery, so this adds a margin for the longest transit time. A longer window is always lawful.
 */
export const WITHDRAWAL_WINDOW_DAYS = 30
/** Omnibus reference window for "lowest price before the reduction". */
export const PRICE_REFERENCE_DAYS = 30
/** EU-wide legal ceiling used in all product copy. Several member states use 0.3%; we stay conservative. */
export const THC_LIMIT_PERCENT = 0.2

/** All amounts are euro cents. */
export const FREE_SHIPPING_THRESHOLD = 4900
/** Baseline shipping used before the customer picks a country (zone 1 standard). */
export const SHIPPING_COST = 490

export const PROMO_CODES: Record<string, PromoCode> = {
  WELCOME10: { type: 'percent', value: 10, label: '10% off for new customers' },
  VERDANT5: { type: 'fixed', value: 500, label: '€5 off your order' },
  GREEN20: { type: 'percent', value: 20, label: '20% off promotion' },
  COMEBACK15: { type: 'percent', value: 15, label: '15% welcome-back discount' },
}

/** Countries we ship to (ISO 3166-1 alpha-2) with their shipping zone. */
export const SHIPPING_COUNTRIES: Record<string, ShippingZone> = {
  DE: 1, AT: 1, NL: 1, BE: 1, LU: 1,
  FR: 2, IT: 2, ES: 2, PT: 2, IE: 2, DK: 2, SE: 2, FI: 2, PL: 2, CZ: 2, SK: 2, HU: 2, SI: 2, HR: 2,
  RO: 2, BG: 2, GR: 2, EE: 2, LV: 2, LT: 2, CY: 2, MT: 2,
}
export const COUNTRY_CODES = Object.keys(SHIPPING_COUNTRIES)

/**
 * Member states where raw hemp flower / pre-rolls cannot be sold at a distance under local rules.
 * Configurable: confirm with counsel before launch. Oils, edibles, cosmetics and tea are unaffected.
 */
export const FLOWER_RESTRICTED_COUNTRIES = ['IE', 'SE', 'FI', 'LT', 'SK']
export const RESTRICTED_CATEGORIES: ProductCategory[] = ['flowers', 'prerolls']

export const DELIVERY_OPTIONS: {
  id: DeliveryMethod
  carrier: string
  price: Record<ShippingZone, number>
  days: Record<ShippingZone, [number, number]>
}[] = [
  { id: 'standard', carrier: 'DHL / DPD', price: { 1: 490, 2: 790 }, days: { 1: [2, 4], 2: [3, 6] } },
  { id: 'express', carrier: 'DHL Express', price: { 1: 1290, 2: 1690 }, days: { 1: [1, 2], 2: [2, 3] } },
  { id: 'pickup', carrier: 'Packstation / pickup point', price: { 1: 390, 2: 690 }, days: { 1: [2, 4], 2: [3, 6] } },
]

export const PAYMENT_OPTIONS: { id: PaymentMethod; title: string; note: string }[] = [
  { id: 'card', title: 'Credit or debit card', note: 'Visa, Mastercard, American Express' },
  { id: 'paypal', title: 'PayPal', note: 'Pay with your PayPal balance or linked card' },
  { id: 'wallet', title: 'Apple Pay / Google Pay', note: 'One-tap checkout on supported devices' },
  { id: 'sepa', title: 'SEPA direct debit', note: 'Bank transfer from any EU account' },
  { id: 'klarna', title: 'Klarna', note: 'Pay in 30 days or in 3 instalments' },
]
