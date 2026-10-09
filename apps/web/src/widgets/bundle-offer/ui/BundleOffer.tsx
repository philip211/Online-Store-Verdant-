import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Package, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import { getDefaultVariant, ProductVisual, useCatalog, type Product } from '@/entities/product'
import { BUNDLE_DISCOUNT, ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice, formatVariantLabel } from '@/shared/lib'
import { Button, Reveal } from '@/shared/ui'

export function BundleOffer({ product }: { product: Product }) {
  const { t } = useT()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const catalog = useCatalog()
  const companions = useMemo(
    () =>
      catalog
        .filter((p) => p.id !== product.id && p.category !== product.category)
        .map((p) => ({ p, score: p.effects.filter((e) => product.effects.includes(e)).length * 2 + p.rating + (p.badges.includes('hit') ? 1 : 0) }))
        .sort((a, b) => b.score - a.score)
        .reduce<Product[]>((acc, { p }) => (acc.length < 2 && !acc.some((x) => x.category === p.category) ? [...acc, p] : acc), []),
    [product, catalog],
  )
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const items = [product, ...companions]
  const isOn = (id: string) => (id === product.id ? true : (selected[id] ?? true))
  const chosen = items.filter((p) => isOn(p.id))
  const full = chosen.reduce((n, p) => n + getDefaultVariant(p).price, 0)
  const discounted = chosen.length > 1 ? Math.round(full * (1 - BUNDLE_DISCOUNT)) : full
  const pct = Math.round(BUNDLE_DISCOUNT * 100)

  if (companions.length < 1) return null

  const addBundle = () => {
    chosen.forEach((p) => {
      const v = getDefaultVariant(p)
      const bundle = chosen.length > 1
      addItem({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        variantId: v.id,
        variantLabel: v.label,
        price: bundle ? Math.round(v.price * (1 - BUNDLE_DISCOUNT)) : v.price,
        oldPrice: bundle ? v.price : v.oldPrice,
        hue: p.hue,
        category: p.category,
        subscription: false,
        bundle,
        maxQty: v.stock,
      })
    })
    toast.success(chosen.length > 1 ? t('Bundle of {count} products added', { count: chosen.length }) : t('Product added'), {
      description: chosen.length > 1 ? t('Bundle discount −{pct}%', { pct }) : undefined,
    })
    setTimeout(openCart, 350)
  }

  return (
    <Reveal className="border-glow rounded-3xl border border-white/10 glass-card p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            <Package className="size-3.5" /> {t('Frequently bought together')}
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-forest-50">{t('Build a bundle and save {pct}%', { pct })}</h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:items-center">
        <div className="flex flex-wrap items-center gap-3 lg:col-span-8">
          {items.map((p, i) => {
            const on = isOn(p.id)
            const v = getDefaultVariant(p)
            return (
              <div key={p.id} className="flex items-center gap-3">
                <button type="button" disabled={p.id === product.id} onClick={() => setSelected((s) => ({ ...s, [p.id]: !(s[p.id] ?? true) }))} aria-pressed={on} className={cn('relative w-36 rounded-2xl border p-2 text-left transition-all', on ? 'border-forest-300 bg-forest-300/15 shadow-soft' : 'border-white/15 opacity-60 hover:opacity-100')}>
                  <span className={cn('absolute right-2 top-2 z-10 grid size-6 place-items-center rounded-full', on ? 'bg-forest-300 text-forest-950' : 'border border-white/20 bg-forest-950/70')}>{on && <Check className="size-3.5" />}</span>
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <ProductVisual product={p} variant="thumb" />
                  </div>
                  <Link to={ROUTES.product(p.slug)} className="mt-2 block truncate text-sm font-semibold text-forest-50 hover:underline">{p.name}</Link>
                  <div className="text-xs text-forest-300">{formatVariantLabel(v.label)} · {formatPrice(v.price)}</div>
                </button>
                {i < items.length - 1 && <Plus className="size-5 shrink-0 text-forest-400" />}
              </div>
            )
          })}
        </div>
        <div className="rounded-2xl bg-forest-950 p-5 text-forest-50 lg:col-span-4">
          <div className="text-xs uppercase tracking-[0.12em] text-forest-200">{t('Bundle price')}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-gold-300">{formatPrice(discounted)}</span>
            {discounted < full && <span className="text-sm text-forest-200 line-through">{formatPrice(full)}</span>}
          </div>
          {discounted < full && <div className="mt-1 text-sm text-forest-200">{t('You save {amount}', { amount: formatPrice(full - discounted) })}</div>}
          <Button variant="gold" shine className="mt-4 w-full" onClick={addBundle}>
            {chosen.length > 1 ? t('Add bundle to cart') : t('Add to cart')}
          </Button>
        </div>
      </div>
    </Reveal>
  )
}
