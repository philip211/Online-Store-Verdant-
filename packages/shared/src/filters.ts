import type { Locale, Product, ProductFilters } from './types'

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .trim()
export const getMinPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price))
export const getTotalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0)
export const getDefaultVariant = (p: Product) => p.variants.find((v) => v.stock > 0) ?? p.variants[0]

/** Returns a copy of the product with copy fields swapped for the requested locale (English is the base). */
export function localizeProduct(p: Product, locale: Locale): Product {
  if (locale === 'en' || !p.i18n?.[locale]) return p
  const t = p.i18n[locale]!
  return { ...p, ...t }
}

export function applyFilters(list: Product[], f: ProductFilters = {}): Product[] {
  let out = [...list]

  if (f.category && f.category !== 'all') out = out.filter((p) => p.category === f.category)
  if (f.effects?.length) out = out.filter((p) => f.effects!.some((e) => p.effects.includes(e)))
  if (f.badges?.length) out = out.filter((p) => f.badges!.some((b) => p.badges.includes(b)))
  if (f.minPrice != null) out = out.filter((p) => getMinPrice(p) >= f.minPrice!)
  if (f.maxPrice != null) out = out.filter((p) => getMinPrice(p) <= f.maxPrice!)
  if (f.minCbd != null) out = out.filter((p) => p.cbd >= f.minCbd!)
  if (f.inStock) out = out.filter((p) => getTotalStock(p) > 0)
  if (f.search) {
    const q = normalize(f.search)
    out = out.filter((p) => {
      const pool = [p.name, p.strain ?? '', p.shortDescription, ...p.aroma, ...p.terpenes]
      Object.values(p.i18n ?? {}).forEach((t) => {
        pool.push(t.name ?? '', t.shortDescription ?? '', ...(t.aroma ?? []), ...(t.terpenes ?? []))
      })
      return pool.some((s) => normalize(s).includes(q))
    })
  }

  switch (f.sort) {
    case 'price-asc':
      out.sort((a, b) => getMinPrice(a) - getMinPrice(b))
      break
    case 'price-desc':
      out.sort((a, b) => getMinPrice(b) - getMinPrice(a))
      break
    case 'rating':
      out.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
      break
    case 'new':
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    case 'cbd':
      out.sort((a, b) => b.cbd - a.cbd)
      break
    default:
      out.sort((a, b) => b.soldToday * b.rating - a.soldToday * a.rating)
  }
  return out
}

export function relatedProducts(all: Product[], product: Product, limit = 4): Product[] {
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      score: (p.category === product.category ? 3 : 0) + p.effects.filter((e) => product.effects.includes(e)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)
}
