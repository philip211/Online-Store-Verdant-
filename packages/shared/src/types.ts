export type ProductCategory = 'flowers' | 'oils' | 'edibles' | 'cosmetics' | 'prerolls' | 'tea'
export type Effect = 'relax' | 'sleep' | 'focus' | 'energy' | 'balance' | 'recovery'
export type ProductBadge = 'new' | 'hit' | 'sale' | 'limited' | 'organic'
export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating' | 'new' | 'cbd'
export type Locale = 'en' | 'de' | 'fr'

export const LOCALES: Locale[] = ['en', 'de', 'fr']
export const PRODUCT_CATEGORIES: ProductCategory[] = ['flowers', 'oils', 'edibles', 'cosmetics', 'prerolls', 'tea']
export const EFFECTS: Effect[] = ['relax', 'sleep', 'focus', 'energy', 'balance', 'recovery']
export const PRODUCT_BADGES: ProductBadge[] = ['new', 'hit', 'sale', 'limited', 'organic']
export const SORT_OPTIONS: SortOption[] = ['popular', 'price-asc', 'price-desc', 'rating', 'new', 'cbd']

export interface ProductVariant {
  id: string
  label: string
  /** Price in euro cents, VAT included. */
  price: number
  /**
   * Reference price shown struck through. The API derives it from price history: it is set only when the
   * current price is below the lowest price of the 30 days before the reduction (EU Omnibus, Art. 6a PID).
   */
  oldPrice?: number
  /** Lowest price in the 30 days before the current price took effect; present whenever oldPrice is. */
  lowestPrice30d?: number
  stock: number
}

/** Translatable product copy. English lives on the product itself; other locales override here. */
export type ProductI18n = Partial<Pick<Product, 'name' | 'strain' | 'shortDescription' | 'description' | 'aroma' | 'terpenes' | 'origin'>>

export interface Product {
  id: string
  slug: string
  name: string
  strain?: string
  category: ProductCategory
  shortDescription: string
  description: string
  cbd: number
  thc: number
  effects: Effect[]
  terpenes: string[]
  aroma: string[]
  rating: number
  reviewsCount: number
  variants: ProductVariant[]
  badges: ProductBadge[]
  hue: number
  soldToday: number
  labReportUrl: string
  origin: string
  createdAt: string
  i18n?: Partial<Record<Exclude<Locale, 'en'>, ProductI18n>>
}

export interface ProductFilters {
  category?: ProductCategory | 'all'
  effects?: Effect[]
  minPrice?: number
  maxPrice?: number
  minCbd?: number
  search?: string
  sort?: SortOption
  inStock?: boolean
  badges?: ProductBadge[]
}

export interface Review {
  id: string
  productId: string
  author: string
  city: string
  rating: number
  title: string
  text: string
  date: string
  verified: boolean
  helpful: number
  effect?: string
}

export type DeliveryMethod = 'standard' | 'express' | 'pickup'
export type PaymentMethod = 'card' | 'paypal' | 'wallet' | 'sepa' | 'klarna'
export type OrderStatus = 'processing' | 'packed' | 'shipped' | 'delivered'
export type ShippingZone = 1 | 2

/** A priced line: enough to compute cart totals on either side. */
export interface PricedLine {
  price: number
  oldPrice?: number
  qty: number
  subscription: boolean
}

export interface CartTotals {
  count: number
  subtotal: number
  savings: number
  promoDiscount: number
  subscriptionDiscount: number
  shipping: number
  total: number
  freeShippingLeft: number
  freeShippingProgress: number
}

export interface OrderItem {
  key: string
  productId: string
  slug: string
  name: string
  variantId: string
  variantLabel: string
  price: number
  oldPrice?: number
  qty: number
  hue: number
  category: string
  subscription: boolean
  bundle?: boolean
  maxQty: number
}

export interface OrderCustomer {
  name: string
  email: string
  phone: string
  country: string
  city: string
  postalCode: string
  address: string
  comment?: string
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  items: OrderItem[]
  totals: CartTotals
  deliveryPrice: number
  grandTotal: number
  customer: OrderCustomer
  delivery: DeliveryMethod
  payment: PaymentMethod
  promoCode?: string | null
  pointsEarned: number
  /** Withdrawal declarations received for this order, newest first. */
  withdrawals?: WithdrawalReceipt[]
}

export interface PromoCode {
  type: 'percent' | 'fixed'
  value: number
  /** English label; the storefront translates it. */
  label: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export interface WithdrawalReceipt {
  id: string
  orderId: string
  email: string
  createdAt: string
  /** Line keys the customer withdrew from; empty means the whole order. */
  items: string[]
  /** True only when the confirmation e-mail was actually handed to a mail transport. */
  emailSent?: boolean
}
