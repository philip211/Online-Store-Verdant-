import { useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { applyFilters, CATEGORY_LABELS, useCatalog, useProducts, type ProductCategory } from '@/entities/product'
import { FiltersPanel, SortSelect, useCatalogFilters } from '@/features/product-filters'
import { useT } from '@/shared/i18n'
import { useDocumentMeta } from '@/shared/lib'
import { Button, Drawer } from '@/shared/ui'
import { CategoryChips } from '@/widgets/category-chips'
import { ProductGrid } from '@/widgets/product-grid'
import { RecentlyViewed } from '@/widgets/recently-viewed'

export default function CatalogPage() {
  const { t, tn } = useT()
  const { filters, update, reset, activeCount } = useCatalogFilters()
  const { data, isLoading, isFetching } = useProducts(filters)
  const [mobileFilters, setMobileFilters] = useState(false)
  const catalog = useCatalog()
  useDocumentMeta({
    title: filters.category && filters.category !== 'all' ? t(CATEGORY_LABELS[filters.category]) : t('Shop'),
    description: t('CBD catalogue: flowers, oils, edibles, cosmetics. Filter by effect, price and CBD strength.'),
  })

  const counts = useMemo(() => {
    const all = applyFilters(catalog, { ...filters, category: 'all' as const })
    const out: Partial<Record<ProductCategory | 'all', number>> = { all: all.length }
    all.forEach((p) => {
      out[p.category] = (out[p.category] ?? 0) + 1
    })
    return out
  }, [filters, catalog])

  const title = filters.search ? t('Results for “{query}”', { query: filters.search }) : filters.category && filters.category !== 'all' ? t(CATEGORY_LABELS[filters.category]) : t('Shop')
  const count = data?.length ?? 0

  return (
    <div className="container-x py-10 lg:py-14">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">
            <span className="h-px w-6 bg-current" /> {t('Store')}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-forest-50 sm:text-5xl">{title}</h1>
          <p className="mt-2 text-sm text-forest-300">
            {data ? tn(count, '{count} product', '{count} products') : t('Loading…')}
            {isFetching && !isLoading && <span className="ml-2 animate-pulse">{t('updating')}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && (
            <Button variant="soft" size="sm" onClick={() => update({ search: undefined })}>
              <X className="size-3.5" /> {filters.search}
            </Button>
          )}
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal className="size-4" /> {t('Filters')} {activeCount > 0 && `(${activeCount})`}
          </Button>
          <SortSelect value={filters.sort ?? 'popular'} onChange={(sort) => update({ sort })} />
        </div>
      </header>

      <CategoryChips active={filters.category ?? 'all'} className="mt-8" />

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24">
            <FiltersPanel filters={filters} onChange={update} onReset={reset} activeCount={activeCount} counts={counts} />
          </div>
        </div>
        <div className="lg:col-span-9">
          <ProductGrid products={data} loading={isLoading} columns={3} onReset={reset} />
        </div>
      </div>

      <Drawer open={mobileFilters} onClose={() => setMobileFilters(false)} side="left" title={t('Filters')} footer={<Button className="w-full" onClick={() => setMobileFilters(false)}>{t('Show')} {tn(count, '{count} product', '{count} products')}</Button>}>
        <FiltersPanel filters={filters} onChange={update} onReset={reset} activeCount={activeCount} counts={counts} hideTitle />
      </Drawer>

      <RecentlyViewed className="mt-20" />
    </div>
  )
}
