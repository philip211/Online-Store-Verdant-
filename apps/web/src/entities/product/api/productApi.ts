import type { Product, ProductFilters } from '@verdant/shared'
import { api } from '@/shared/api'

const toParams = (f: ProductFilters = {}) => ({
  category: f.category && f.category !== 'all' ? f.category : undefined,
  effect: f.effects,
  badge: f.badges,
  min: f.minPrice,
  max: f.maxPrice,
  cbd: f.minCbd,
  q: f.search,
  sort: f.sort && f.sort !== 'popular' ? f.sort : undefined,
  stock: f.inStock ? '1' : undefined,
})

export const productApi = {
  list: (filters?: ProductFilters, signal?: AbortSignal) =>
    api.get<{ items: Product[]; total: number }>('/products', toParams(filters), signal).then((r) => r.items),
  all: (signal?: AbortSignal) => api.get<{ items: Product[]; total: number }>('/products', undefined, signal).then((r) => r.items),
  bySlug: (slug: string, signal?: AbortSignal) => api.get<Product>(`/products/${encodeURIComponent(slug)}`, undefined, signal),
  byIds: (ids: string[], signal?: AbortSignal) => api.get<Product[]>('/products/by-ids', { ids: ids.join(',') }, signal),
  featured: (signal?: AbortSignal) => api.get<Product[]>('/products/featured', undefined, signal),
  newArrivals: (signal?: AbortSignal) => api.get<Product[]>('/products/new', undefined, signal),
  related: (productId: string, signal?: AbortSignal) => api.get<Product[]>(`/products/${productId}/related`, undefined, signal),
}
