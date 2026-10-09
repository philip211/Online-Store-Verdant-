import type { ProductCategory } from '@/entities/product'

export interface Category {
  id: ProductCategory
  title: string
  tagline: string
  description: string
  hue: number
  /** Stock photo in /public/images (CC0, see public/images/CREDITS.md). */
  image: string
}

/** English copy doubles as translation keys. */
export const CATEGORIES: Category[] = [
  { id: 'flowers', title: 'CBD flowers', tagline: 'Premium-grade buds', description: 'Indoor and greenhouse strains from Italy and Switzerland. Up to 21% CBD.', hue: 140, image: '/images/flowers.webp' },
  { id: 'oils', title: 'Oils', tagline: 'Full & broad spectrum', description: 'CO2 extracts in MCT oil. From 5% to 15% CBD.', hue: 45, image: '/images/oils.webp' },
  { id: 'edibles', title: 'Edibles', tagline: 'Gummies and more', description: 'Precise dosing, vegan recipes, no sugar.', hue: 30, image: '/images/edibles.webp' },
  { id: 'cosmetics', title: 'Cosmetics', tagline: 'CBD skincare', description: 'Recovery balms and glow serums.', hue: 340, image: '/images/cosmetics.webp' },
  { id: 'prerolls', title: 'Pre-rolls', tagline: 'Ready to enjoy', description: 'Hand-rolled from premium flowers in RAW paper.', hue: 95, image: '/images/prerolls.webp' },
  { id: 'tea', title: 'Teas', tagline: 'Evening blends', description: 'CBD flowers with chamomile, lemon balm and lavender.', hue: 110, image: '/images/tea.webp' },
]
