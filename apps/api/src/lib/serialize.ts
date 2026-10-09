import type { Order as OrderRow, OrderItem as OrderItemRow, PriceHistory as PriceRow, Product as ProductRow, Review as ReviewRow, Variant as VariantRow, Withdrawal as WithdrawalRow } from '@prisma/client'
import { localizeProduct, PRICE_REFERENCE_DAYS, statusForAge, type CartTotals, type Locale, type Order, type Product, type Review, type WithdrawalReceipt } from '@verdant/shared'

const arr = (json: string) => {
  try {
    const v = JSON.parse(json)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
const obj = (json: string) => {
  try {
    const v = JSON.parse(json)
    return v && typeof v === 'object' ? v : {}
  } catch {
    return {}
  }
}

export const productInclude = { variants: { include: { prices: true } } } as const

/**
 * Omnibus reference price: the lowest price the variant had during the 30 days before its current price
 * took effect. Returned only when the current price is actually below it, so a "discount" cannot be shown
 * without a real, recorded higher price behind it.
 */
export function priceReference(current: number, history: Pick<PriceRow, 'price' | 'startedAt'>[], now = new Date()) {
  const past = history.filter((h) => h.startedAt <= now).sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  const since = past.at(-1)?.startedAt
  if (!since) return {}
  const windowStart = since.getTime() - PRICE_REFERENCE_DAYS * 86_400_000
  const before = past.filter((h, i) => h.startedAt < since && (past[i + 1]?.startedAt ?? since).getTime() > windowStart)
  if (!before.length) return {}
  const lowest = Math.min(...before.map((h) => h.price))
  return lowest > current ? { oldPrice: lowest, lowestPrice30d: lowest } : {}
}

type VariantWithPrices = VariantRow & { prices: PriceRow[] }

export function toProduct(row: ProductRow & { variants: VariantWithPrices[] }, locale: Locale = 'en'): Product {
  const base: Product = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    strain: row.strain ?? undefined,
    category: row.category as Product['category'],
    shortDescription: row.shortDescription,
    description: row.description,
    cbd: row.cbd,
    thc: row.thc,
    effects: arr(row.effects),
    terpenes: arr(row.terpenes),
    aroma: arr(row.aroma),
    rating: Math.round(row.rating * 10) / 10,
    reviewsCount: row.reviewsCount,
    variants: [...row.variants]
      .sort((a, b) => a.sort - b.sort)
      .map((v) => ({ id: v.id, label: v.label, price: v.price, ...priceReference(v.price, v.prices), stock: v.stock })),
    badges: arr(row.badges),
    hue: row.hue,
    soldToday: row.soldToday,
    labReportUrl: row.labReportUrl,
    origin: row.origin,
    createdAt: row.createdAt.toISOString(),
    i18n: obj(row.i18n),
  }
  // Ship the localized copy and drop the translation bundle to keep payloads small.
  const { i18n: _i18n, ...localized } = localizeProduct(base, locale)
  void _i18n
  return localized
}

export function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.productId,
    author: row.author,
    city: row.city,
    rating: row.rating,
    title: row.title,
    text: row.text,
    date: row.date.toISOString(),
    verified: row.verified,
    helpful: row.helpful,
    effect: row.effect ?? undefined,
  }
}

type OrderItemWithProduct = OrderItemRow & { product: { slug: string; hue: number; category: string }; variant: { stock: number } }

export function toWithdrawal(row: WithdrawalRow): WithdrawalReceipt {
  return { id: row.id, orderId: row.orderId, email: row.email, createdAt: row.createdAt.toISOString(), items: arr(row.items) }
}

export function toOrder(row: OrderRow & { items: OrderItemWithProduct[]; withdrawals?: WithdrawalRow[] }): Order {
  return {
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    status: statusForAge(row.createdAt),
    items: row.items.map((i) => ({
      key: `${i.productId}:${i.variantId}:${i.subscription ? 'sub' : 'once'}${i.bundle ? ':bundle' : ''}`,
      productId: i.productId,
      slug: i.product.slug,
      name: i.name,
      variantId: i.variantId,
      variantLabel: i.variantLabel,
      price: i.price,
      oldPrice: i.oldPrice ?? undefined,
      qty: i.qty,
      hue: i.product.hue,
      category: i.product.category,
      subscription: i.subscription,
      bundle: i.bundle,
      maxQty: i.variant.stock,
    })),
    totals: JSON.parse(row.totals) as CartTotals,
    deliveryPrice: row.deliveryPrice,
    grandTotal: row.grandTotal,
    customer: {
      name: row.name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      city: row.city,
      postalCode: row.postalCode,
      address: row.address,
      comment: row.comment ?? undefined,
    },
    delivery: row.delivery as Order['delivery'],
    payment: row.payment as Order['payment'],
    promoCode: row.promoCode,
    pointsEarned: row.pointsEarned,
    withdrawals: row.withdrawals?.map(toWithdrawal),
  }
}

export const orderInclude = {
  items: { include: { product: { select: { slug: true, hue: true, category: true } }, variant: { select: { stock: true } } } },
  withdrawals: { orderBy: { createdAt: 'desc' } },
} as const
