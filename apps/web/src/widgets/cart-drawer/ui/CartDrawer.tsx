import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Gift, RefreshCw, ShoppingBag, Trash2, Truck } from 'lucide-react'
import { useCartStore, useCartTotals, type CartItem } from '@/entities/cart'
import { ProductVisual, useProductById } from '@/entities/product'
import { PromoCodeForm } from '@/features/promo-code'
import { POINTS_RATE, ROUTES, SUBSCRIPTION_DISCOUNT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice, formatVariantLabel } from '@/shared/lib'
import { AnimatedParty, Button, Drawer, Stepper } from '@/shared/ui'

export function CartDrawer() {
  const { t, tn } = useT()
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const totals = useCartTotals()
  const navigate = useNavigate()

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={
        <span className="flex items-center gap-2">
          {t('Cart')}
          {totals.count > 0 && <span className="text-base font-normal text-forest-300">· {tn(totals.count, '{count} item', '{count} items')}</span>}
        </span>
      }
      footer={
        items.length > 0 && (
          <div className="space-y-4">
            <PromoCodeForm />
            <dl className="space-y-1.5 text-sm">
              <Row label={t('Items')} value={formatPrice(totals.subtotal)} />
              {totals.savings > 0 && <Row label={t('Product discounts')} value={`−${formatPrice(totals.savings)}`} accent />}
              {totals.subscriptionDiscount > 0 && <Row label={t('Subscription −15%')} value={`−${formatPrice(totals.subscriptionDiscount)}`} accent />}
              {totals.promoDiscount > 0 && <Row label={t('Promo code')} value={`−${formatPrice(totals.promoDiscount)}`} accent />}
              <Row label={t('Shipping')} value={totals.shipping === 0 ? t('Free') : t('from {amount}', { amount: formatPrice(totals.shipping) })} />
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="font-display text-xl font-semibold">{t('Total')}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">{formatPrice(totals.total)}</dd>
              </div>
              <p className="text-right text-xs text-forest-400">{t('incl. VAT')}</p>
            </dl>
            <Button
              size="lg"
              shine
              className="w-full"
              onClick={() => {
                close()
                navigate(ROUTES.checkout)
              }}
            >
              {t('Checkout')} <ArrowRight className="size-4" />
            </Button>
            <p className="text-center text-xs text-forest-300">{t('+{points} loyalty points with this order', { points: Math.round(totals.total * POINTS_RATE) })}</p>
            <p className="text-center text-xs text-forest-300">{t('Secure payment · 14-day returns · Discreet packaging')}</p>
          </div>
        )
      }
    >
      <FreeShippingBar left={totals.freeShippingLeft} progress={totals.freeShippingProgress} />

      {items.length === 0 ? (
        <EmptyCart onClose={close} />
      ) : (
        <ul className="mt-5 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <CartLine key={item.key} item={item} />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Drawer>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-forest-300">{label}</dt>
      <dd className={cn('tabular-nums', accent ? 'font-semibold text-forest-300' : 'text-forest-50')}>{value}</dd>
    </div>
  )
}

function FreeShippingBar({ left, progress }: { left: number; progress: number }) {
  const { t } = useT()
  const done = left === 0
  return (
    <div className="rounded-2xl border border-white/10 glass-card p-4">
      <div className="flex items-center gap-2 text-sm">
        {done ? <Gift className="size-4 text-gold-400" /> : <Truck className="size-4 text-forest-300" />}
        <span className="text-forest-50">
          {done ? (
            <strong className="inline-flex items-center gap-1.5">{t('Free shipping unlocked')} <AnimatedParty /></strong>
          ) : (
            <>
              {t('Add')} <strong className="tabular-nums">{formatPrice(left)}</strong> {t('more for free shipping')}
            </>
          )}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div className={cn('h-full rounded-full', done ? 'bg-gold-500' : 'bg-forest-300')} initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  )
}

function CartLine({ item }: { item: CartItem }) {
  const { t } = useT()
  const setQty = useCartStore((s) => s.setQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const toggleSubscription = useCartStore((s) => s.toggleSubscription)
  const product = useProductById(item.productId)
  const unit = item.subscription ? Math.round(item.price * (1 - SUBSCRIPTION_DISCOUNT)) : item.price

  return (
    <motion.li layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30, height: 0, marginTop: 0 }} className="flex gap-4">
      <Link to={ROUTES.product(item.slug)} className="size-24 shrink-0 overflow-hidden rounded-2xl">
        {product && <ProductVisual product={product} variant="thumb" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={ROUTES.product(item.slug)} className="line-clamp-1 font-semibold text-forest-50 hover:underline">
              {product?.name ?? item.name}
            </Link>
            <div className="text-xs text-forest-300">
              {formatVariantLabel(item.variantLabel)}
              {item.bundle && ` · ${t('bundle')}`}
            </div>
          </div>
          <button onClick={() => removeItem(item.key)} aria-label={t('Remove')} className="text-forest-400 transition hover:text-rose-400">
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Stepper size="sm" value={item.qty} max={item.maxQty} onChange={(q) => setQty(item.key, q)} />
          <div className="text-right">
            <div className="font-semibold tabular-nums text-forest-50">{formatPrice(unit * item.qty)}</div>
            {item.oldPrice && item.oldPrice > item.price && <div className="text-xs tabular-nums text-forest-400 line-through">{formatPrice(item.oldPrice * item.qty)}</div>}
          </div>
        </div>
        <button
          onClick={() => toggleSubscription(item.key)}
          className={cn('mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition', item.subscription ? 'bg-forest-300 text-forest-950' : 'bg-white/10 text-forest-100 hover:bg-white/15')}
        >
          <RefreshCw className="size-3" />
          {item.subscription ? t('Every 30 days · −15%') : t('Subscribe & save 15%')}
        </button>
      </div>
    </motion.li>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  const { t } = useT()
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="grid size-20 place-items-center rounded-full bg-white/10 text-forest-300">
        <ShoppingBag className="size-8" />
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-forest-50">{t('Your cart is empty')}</h3>
      <p className="mt-2 max-w-xs text-sm text-forest-300">{t('Time to pick something for balance, sleep or focus.')}</p>
      <Link to={ROUTES.catalog} onClick={onClose} className="mt-6">
        <Button variant="outline">{t('Browse the shop')}</Button>
      </Link>
    </div>
  )
}
