import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowRight, X } from 'lucide-react'
import { useCompareStore } from '@/entities/compare'
import { CATEGORY_LABELS, EffectIcon, getDefaultVariant, getMinPrice, Price, ProductVisual, useProductsByIds, type Product } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, cn, formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Button, Skeleton, Stars } from '@/shared/ui'

const pricePerUnit = (p: Product) => {
  const v = p.variants[p.variants.length - 1]
  const unit = parseFloat(v.label)
  if (!Number.isFinite(unit) || unit <= 0) return null
  const suffix = v.label.replace(/[\d.,\s]/g, '')
  return `${formatPrice(Math.round(v.price / unit))} / ${suffix}`
}

export default function ComparePage() {
  const { t, tn } = useT()
  useDocumentMeta({ title: t('Compare products'), description: t('Compare CBD products by strength, effects, price and reviews.') })
  const ids = useCompareStore((s) => s.ids)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const { data, isLoading } = useProductsByIds(ids)
  const products = ids.map((id) => data?.find((p) => p.id === id)).filter((p): p is Product => !!p)

  if (!ids.length) {
    return (
      <div className="container-x flex flex-col items-center py-32 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-white/10 text-forest-300">
          <ArrowLeftRight className="size-10" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-forest-50">{t('Nothing to compare yet')}</h1>
        <p className="mt-3 max-w-sm text-forest-300">{t('Add up to three products with the “Compare” button on a card and we will line them up.')}</p>
        <Link to={ROUTES.catalog} className="mt-8">
          <Button size="lg">{t('Browse the shop')} <ArrowRight className="size-4" /></Button>
        </Link>
      </div>
    )
  }

  const best = { cbd: Math.max(...products.map((p) => p.cbd)), rating: Math.max(...products.map((p) => p.rating)), price: Math.min(...products.map(getMinPrice)) }

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: t('Category'), render: (p) => `${t(CATEGORY_LABELS[p.category])}${p.strain ? ` · ${p.strain}` : ''}` },
    { label: t('Price from'), render: (p) => <span className={cn('font-semibold tabular-nums', getMinPrice(p) === best.price && 'text-forest-300')}>{formatPrice(getMinPrice(p))}</span> },
    { label: t('Price per unit (largest size)'), render: (p) => pricePerUnit(p) ?? '—' },
    { label: 'CBD', render: (p) => <span className={cn('font-semibold', p.cbd === best.cbd && 'text-forest-300')}>{cbdLabel(p.cbd, p.category)}</span> },
    { label: 'THC', render: (p) => `${p.thc}%` },
    { label: t('Effects'), render: (p) => <span className="flex flex-wrap gap-2">{p.effects.map((e) => <EffectIcon key={e} effect={e} withLabel className="text-sm" />)}</span> },
    { label: t('Terpenes'), render: (p) => (p.terpenes.length ? p.terpenes.join(', ') : '—') },
    { label: t('Aroma'), render: (p) => p.aroma.join(', ') },
    { label: t('Rating'), render: (p) => <span className={cn('inline-flex items-center gap-2', p.rating === best.rating && 'font-semibold text-forest-300')}><Stars value={p.rating} size={13} /> {p.rating} ({p.reviewsCount})</span> },
    { label: t('Origin'), render: (p) => p.origin },
    { label: t('Sizes'), render: (p) => p.variants.map((v) => formatVariantLabel(v.label)).join(' · ') },
    { label: t('In stock'), render: (p) => tn(p.variants.reduce((n, v) => n + v.stock, 0), '{count} unit', '{count} units') },
  ]

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><span className="h-px w-6 bg-current" /> {t('Comparison')}</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest-50 sm:text-5xl">{tn(products.length, 'Compare {count} product', 'Compare {count} products')}</h1>
          <p className="mt-2 text-sm text-forest-300">{t('Best values are highlighted in green.')}</p>
        </div>
        <Button variant="ghost" onClick={clear}><X className="size-4" /> {t('Clear')}</Button>
      </div>

      {isLoading ? (
        <Skeleton className="mt-10 h-96 rounded-3xl" />
      ) : (
        <div className="mt-10 overflow-x-auto rounded-3xl border border-white/10 glass-card shadow-card">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="align-top">
                <th className="w-48 p-5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-forest-300">{t('Attribute')}</th>
                {products.map((p) => {
                  const v = getDefaultVariant(p)
                  return (
                    <th key={p.id} className="p-5 text-left font-normal">
                      <div className="relative">
                        <button onClick={() => remove(p.id)} aria-label={t('Remove')} className="absolute right-0 top-0 z-10 grid size-8 place-items-center rounded-full bg-forest-900/90 text-forest-100 shadow-soft hover:bg-white/20">
                          <X className="size-4" />
                        </button>
                        <Link to={ROUTES.product(p.slug)} className="block aspect-[4/5] max-w-56 overflow-hidden rounded-2xl">
                          <ProductVisual product={p} variant="thumb" />
                        </Link>
                        <Link to={ROUTES.product(p.slug)} className="mt-3 block font-display text-2xl font-semibold text-forest-50 hover:underline">{p.name}</Link>
                        <Price price={v.price} oldPrice={v.oldPrice} lowestPrice30d={v.lowestPrice30d} size="sm" className="mt-1" />
                        <AddToCartButton product={p} size="sm" className="mt-3" openCart={false} />
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-white/10">
                  <th className="p-5 text-left align-top text-xs font-semibold uppercase tracking-[0.12em] text-forest-300">{r.label}</th>
                  {products.map((p) => (
                    <td key={p.id} className="p-5 align-top text-forest-100">{r.render(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
