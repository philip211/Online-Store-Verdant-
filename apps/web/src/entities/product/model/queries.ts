import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'
import { useLocale, type Locale } from '@/shared/i18n/core'
import { productApi } from '../api/productApi'
import type { Product, ProductFilters } from './types'

/** Every product query is keyed by locale so switching language refetches localized copy. */
export const productKeys = {
  all: ['products'] as const,
  catalog: (l: Locale) => [...productKeys.all, l, 'catalog'] as const,
  list: (l: Locale, filters: ProductFilters) => [...productKeys.all, l, 'list', filters] as const,
  detail: (l: Locale, slug: string) => [...productKeys.all, l, 'detail', slug] as const,
  byIds: (l: Locale, ids: string[]) => [...productKeys.all, l, 'ids', ids] as const,
  featured: (l: Locale) => [...productKeys.all, l, 'featured'] as const,
  newArrivals: (l: Locale) => [...productKeys.all, l, 'new'] as const,
  related: (l: Locale, id: string) => [...productKeys.all, l, 'related', id] as const,
}

const EMPTY: Product[] = []

export const useCatalogQuery = () => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.catalog(l), queryFn: ({ signal }) => productApi.all(signal), staleTime: 5 * 60_000 })
}

export const useCatalog = (): Product[] => useCatalogQuery().data ?? EMPTY

export const useProductById = (id?: string) => useCatalog().find((p) => p.id === id)

export const useProducts = (filters: ProductFilters = {}) => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.list(l, filters), queryFn: ({ signal }) => productApi.list(filters, signal), placeholderData: (prev) => prev })
}

export const useProduct = (slug: string) => {
  const l = useLocale()
  return useQuery({
    queryKey: productKeys.detail(l, slug),
    queryFn: async ({ signal }) => {
      try {
        return await productApi.bySlug(slug, signal)
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null
        throw e
      }
    },
    enabled: !!slug,
  })
}

export const useProductsByIds = (ids: string[]) => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.byIds(l, ids), queryFn: ({ signal }) => productApi.byIds(ids, signal), enabled: ids.length > 0 })
}

export const useFeaturedProducts = () => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.featured(l), queryFn: ({ signal }) => productApi.featured(signal) })
}

export const useNewArrivals = () => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.newArrivals(l), queryFn: ({ signal }) => productApi.newArrivals(signal) })
}

export const useRelatedProducts = (product?: Product | null) => {
  const l = useLocale()
  return useQuery({ queryKey: productKeys.related(l, product?.id ?? ''), queryFn: ({ signal }) => productApi.related(product!.id, signal), enabled: !!product })
}
