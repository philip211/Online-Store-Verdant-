import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Effect, ProductBadge, ProductCategory, ProductFilters, SortOption } from '@/entities/product'

const CATEGORIES: ProductCategory[] = ['flowers', 'oils', 'edibles', 'cosmetics', 'prerolls', 'tea']
const EFFECTS: Effect[] = ['relax', 'sleep', 'focus', 'energy', 'balance', 'recovery']
const BADGES: ProductBadge[] = ['new', 'hit', 'sale', 'limited', 'organic']
const SORTS: SortOption[] = ['popular', 'price-asc', 'price-desc', 'rating', 'new', 'cbd']

const num = (v: string | null) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : undefined)

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<ProductFilters>(() => {
    const category = params.get('category')
    const sort = params.get('sort')
    return {
      category: CATEGORIES.includes(category as ProductCategory) ? (category as ProductCategory) : 'all',
      effects: params.getAll('effect').filter((e): e is Effect => EFFECTS.includes(e as Effect)),
      badges: params.getAll('badge').filter((b): b is ProductBadge => BADGES.includes(b as ProductBadge)),
      minPrice: num(params.get('min')),
      maxPrice: num(params.get('max')),
      minCbd: num(params.get('cbd')),
      search: params.get('q') ?? undefined,
      sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : 'popular',
      inStock: params.get('stock') === '1',
    }
  }, [params])

  const update = useCallback(
    (patch: Partial<ProductFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const setOrDelete = (k: string, v?: string | number | null) => {
            if (v == null || v === '' || v === 'all' || v === 0) next.delete(k)
            else next.set(k, String(v))
          }
          if ('category' in patch) setOrDelete('category', patch.category)
          if ('sort' in patch) setOrDelete('sort', patch.sort === 'popular' ? null : patch.sort)
          if ('minPrice' in patch) setOrDelete('min', patch.minPrice)
          if ('maxPrice' in patch) setOrDelete('max', patch.maxPrice)
          if ('minCbd' in patch) setOrDelete('cbd', patch.minCbd)
          if ('search' in patch) setOrDelete('q', patch.search)
          if ('inStock' in patch) setOrDelete('stock', patch.inStock ? '1' : null)
          if ('effects' in patch) {
            next.delete('effect')
            patch.effects?.forEach((e) => next.append('effect', e))
          }
          if ('badges' in patch) {
            next.delete('badge')
            patch.badges?.forEach((b) => next.append('badge', b))
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams])

  const activeCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.effects?.length ?? 0) +
    (filters.badges?.length ?? 0) +
    (filters.minPrice != null || filters.maxPrice != null ? 1 : 0) +
    (filters.minCbd != null ? 1 : 0) +
    (filters.inStock ? 1 : 0)

  return { filters, update, reset, activeCount }
}
