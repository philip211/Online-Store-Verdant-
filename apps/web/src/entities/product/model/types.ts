import type { Effect, ProductBadge, ProductCategory, SortOption } from '@verdant/shared'

export type { Effect, Product, ProductBadge, ProductCategory, ProductFilters, ProductVariant, SortOption } from '@verdant/shared'
export { getDefaultVariant, getMinPrice, getTotalStock } from '@verdant/shared'

/** English labels double as translation keys: render them through t(). */
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  flowers: 'CBD flowers',
  oils: 'Oils & tinctures',
  edibles: 'Edibles',
  cosmetics: 'Cosmetics',
  prerolls: 'Pre-rolls',
  tea: 'Herbal teas',
}

export const CATEGORY_SHORT: Record<ProductCategory, string> = {
  flowers: 'Flowers',
  oils: 'Oils',
  edibles: 'Edibles',
  cosmetics: 'Cosmetics',
  prerolls: 'Pre-rolls',
  tea: 'Teas',
}

export const EFFECT_LABELS: Record<Effect, { label: string }> = {
  relax: { label: 'Relaxation' },
  sleep: { label: 'Sleep' },
  focus: { label: 'Focus' },
  energy: { label: 'Energy' },
  balance: { label: 'Balance' },
  recovery: { label: 'Recovery' },
}

export const BADGE_LABELS: Record<ProductBadge, string> = {
  new: 'New',
  hit: 'Bestseller',
  sale: 'Sale',
  limited: 'Limited',
  organic: 'Organic',
}

export const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Most popular',
  rating: 'Top rated',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  new: 'Newest first',
  cbd: 'CBD strength',
}
