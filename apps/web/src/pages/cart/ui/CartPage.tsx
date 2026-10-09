import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore, useCartTotals } from '@/entities/cart'
import { ProductVisual, useCatalog } from '@/entities/product'
import { PromoCodeForm } from '@/features/promo-code'
import { ROUTES, SUBSCRIPTION_DISCOUNT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Button, Stepper } from '@/shared/ui'
import { RecentlyViewed } from '@/widgets/recently-viewed'

export default function CartPage() {
  const { t, tn } = useT()
  useDocumentMeta({ title: t('Cart') })
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const totals = useCartTotals()
  const catalog = useCatalog()

  if (!items.length) {
    return (
      <div className="container-x flex flex-col items-center py-32 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-white/10 text-forest-300">
          <ShoppingBag className="size-10" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-forest-50">{t('Your cart is empty')}</h1>
        <p className="mt-3 max-w-sm text-forest-300">{t('Browse the shop: there is something for sleep, focus and recovery.')}</p>
        <Link to={ROUTES.catalog} className="mt-8">
          <Button size="lg">{t('Browse the shop')} <ArrowRight className="size-4" /></Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-semibold text-forest-50 sm:text-5xl">
        {t('Cart')} <span className="text-2xl font-normal text-forest-300">· {tn(totals.count, '{count} item', '{count} items')}</span>
      </h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <ul className="space-y-5 lg:col-span-8">
          {items.map((item) => {
            const product = catalog.find((p) => p.id === item.productId)
            const unit = item.subscription ? Math.round(item.price * (1 - SUBSCRIPTION_DISCOUNT)) : item.price
            return (
              <li key={item.key} className="flex gap-3 rounded-3xl border border-white/10 glass-card p-3 sm:gap-5 sm:p-5">
                <Link to={ROUTES.product(item.slug)} className="size-20 shrink-0 overflow-hidden rounded-2xl sm:size-32">
                  {product && <ProductVisual product={product} variant="thumb" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={ROUTES.product(item.slug)} className="font-display text-lg font-semibold leading-tight text-forest-50 hover:underline sm:text-2xl">{product?.name ?? item.name}</Link>
                      <div className="text-sm text-forest-300">
                        {formatVariantLabel(item.variantLabel)}
                        {item.subscription && <span className="ml-2 rounded-full bg-forest-300 px-2 py-0.5 text-xs font-semibold text-forest-950">{t('Subscription −15%')}</span>}
                        {item.bundle && <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-xs font-semibold text-gold-300">{t('bundle')}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-sm text-forest-300 hover:text-rose-400">{t('Remove')}</button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 sm:pt-4">
                    <Stepper value={item.qty} max={item.maxQty} onChange={(q) => setQty(item.key, q)} />
                    <div className="text-right">
                      <div className="text-xl font-semibold tabular-nums text-forest-50">{formatPrice(unit * item.qty)}</div>
                      <div className="text-xs text-forest-300">{formatPrice(unit)} / {t('each')}</div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <aside className="lg:col-span-4">
          <div className="border-glow sticky top-24 space-y-5 rounded-3xl border border-white/10 glass-card p-6 shadow-card">
            <h2 className="font-display text-2xl font-semibold text-forest-50">{t('Summary')}</h2>
            <PromoCodeForm />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-forest-300">{t('Items')}</dt><dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
              {totals.savings > 0 && <div className="flex justify-between text-forest-300"><dt>{t('Product discounts')}</dt><dd className="tabular-nums">−{formatPrice(totals.savings)}</dd></div>}
              {totals.subscriptionDiscount > 0 && <div className="flex justify-between text-forest-300"><dt>{t('Subscription')}</dt><dd className="tabular-nums">−{formatPrice(totals.subscriptionDiscount)}</dd></div>}
              {totals.promoDiscount > 0 && <div className="flex justify-between text-forest-300"><dt>{t('Promo code')}</dt><dd className="tabular-nums">−{formatPrice(totals.promoDiscount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-forest-300">{t('Shipping')}</dt><dd>{totals.shipping ? t('from {amount}', { amount: formatPrice(totals.shipping) }) : t('Free')}</dd></div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="font-display text-xl font-semibold">{t('Total')}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">{formatPrice(totals.total)}</dd>
              </div>
              <p className="text-right text-xs text-forest-400">{t('incl. VAT')}</p>
            </dl>
            <Link to={ROUTES.checkout} className="block">
              <Button size="lg" shine className="w-full">{t('Checkout')} <ArrowRight className="size-4" /></Button>
            </Link>
            {totals.freeShippingLeft > 0 && <p className="text-center text-xs text-forest-300">{t('{amount} more for free shipping', { amount: formatPrice(totals.freeShippingLeft) })}</p>}
          </div>
        </aside>
      </div>
      <RecentlyViewed className="mt-24" />
    </div>
  )
}
