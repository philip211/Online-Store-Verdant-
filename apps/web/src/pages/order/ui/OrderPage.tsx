import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, FileText, MapPin, PackageCheck, RotateCcw, Truck, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import { canWithdraw, getOrderStatus, isFullyWithdrawn, ORDER_STEPS, useOrder } from '@/entities/order'
import { ProductVisual, useCatalog } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, countryName, formatDate, formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Button, Skeleton } from '@/shared/ui'
import { NotFoundPage } from '@/pages/not-found'
import { STATUS_LABELS } from '@/pages/orders/ui/OrdersPage'

const DELIVERY_LABEL = { standard: 'Standard delivery', express: 'Express delivery', pickup: 'Pickup point' }
const PAYMENT_LABEL = { card: 'Credit or debit card', paypal: 'PayPal', wallet: 'Apple Pay / Google Pay', sepa: 'SEPA direct debit', klarna: 'Klarna' }

export default function OrderPage() {
  const { t } = useT()
  const { id = '' } = useParams()
  const { data: order, isLoading } = useOrder(id)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.open)
  const [now, setNow] = useState(Date.now())
  const catalog = useCatalog()
  useDocumentMeta({ title: order ? `${t('Order')} ${order.id}` : t('Order') })

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container-x py-14">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="mt-8 h-40 rounded-3xl" />
      </div>
    )
  }
  if (!order) return <NotFoundPage />
  const status = getOrderStatus(order, now)
  const stepIndex = ORDER_STEPS.indexOf(status)
  const stepNotes = [t('Payment confirmed'), t('Packed in a neutral box'), t('Handed to the carrier'), t('Enjoy!')]

  const reorder = () => {
    order.items.forEach((i) => addItem({ ...i, qty: i.qty }))
    toast.success(t('Items added to your cart'))
    setTimeout(openCart, 300)
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <Link to={ROUTES.orders} className="inline-flex items-center gap-1.5 text-sm text-forest-300 hover:text-forest-50">
        <ArrowLeft className="size-4" /> {t('All orders')}
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-forest-50 sm:text-5xl">{t('Order')} {order.id}</h1>
          <p className="mt-2 text-sm text-forest-300">{t('Placed on')} {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {canWithdraw(order, now) && !isFullyWithdrawn(order) && (
            <Link to={`${ROUTES.withdrawal}?order=${order.id}&email=${encodeURIComponent(order.customer.email)}`}>
              <Button variant="ghost"><Undo2 className="size-4" /> {t('Withdraw from contract')}</Button>
            </Link>
          )}
          <Button variant="outline" onClick={reorder}><RotateCcw className="size-4" /> {t('Reorder')}</Button>
        </div>
      </div>

      {order.withdrawals?.map((w) => (
        <p key={w.id} className="mt-6 flex items-center gap-2 rounded-2xl border border-forest-300/40 px-4 py-3 text-sm text-forest-100">
          <FileText className="size-4 shrink-0 text-forest-300" />
          {t('Withdrawal {ref} received on {date}', { ref: w.id, date: formatDate(w.createdAt) })}
          {w.items.length > 0 && ` · ${t('{count} of {total} items', { count: w.items.length, total: order.items.length })}`}
        </p>
      ))}

      <ol className="border-glow mt-10 grid gap-4 rounded-3xl border border-white/10 glass-card p-6 shadow-card sm:grid-cols-4">
        {ORDER_STEPS.map((s, i) => {
          const done = i <= stepIndex
          const current = i === stepIndex
          const Icon = [Check, PackageCheck, Truck, MapPin][i]
          return (
            <li key={s} className="relative flex items-start gap-3">
              <motion.span animate={current ? { scale: [1, 1.12, 1] } : undefined} transition={{ duration: 1.6, repeat: Infinity }} className={cn('grid size-10 shrink-0 place-items-center rounded-full', done ? 'bg-forest-300 text-forest-950' : 'bg-white/10 text-forest-400')}>
                <Icon className="size-4" />
              </motion.span>
              <div>
                <div className={cn('font-semibold', done ? 'text-forest-50' : 'text-forest-400')}>{t(STATUS_LABELS[s])}</div>
                <div className="text-xs text-forest-300">{stepNotes[i]}</div>
              </div>
              {i < ORDER_STEPS.length - 1 && <span className={cn('absolute left-5 top-12 h-4 w-px sm:left-auto sm:right-0 sm:top-5 sm:h-px sm:w-6', done && i < stepIndex ? 'bg-forest-300' : 'bg-white/15')} />}
            </li>
          )
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <ul className="space-y-3 lg:col-span-8">
          {order.items.map((i) => {
            const p = catalog.find((x) => x.id === i.productId)
            return (
              <li key={i.key} className="flex items-center gap-4 rounded-2xl border border-white/10 glass-card p-3">
                <Link to={ROUTES.product(i.slug)} className="size-16 shrink-0 overflow-hidden rounded-xl">{p && <ProductVisual product={p} variant="thumb" />}</Link>
                <div className="min-w-0 flex-1">
                  <Link to={ROUTES.product(i.slug)} className="block truncate font-semibold text-forest-50 hover:underline">{p?.name ?? i.name}</Link>
                  <div className="text-xs text-forest-300">{formatVariantLabel(i.variantLabel)} × {i.qty}{i.subscription && ` · ${t('subscription')}`}{i.bundle && ` · ${t('bundle')}`}</div>
                </div>
                <div className="font-semibold tabular-nums">{formatPrice(i.price * i.qty)}</div>
              </li>
            )
          })}
        </ul>
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-3xl border border-white/10 glass-card p-5">
            <h3 className="font-display text-xl font-semibold text-forest-50">{t('Recipient')}</h3>
            <p className="mt-2 text-sm text-forest-100">{order.customer.name}<br />{order.customer.phone}<br />{order.customer.email}</p>
            <p className="mt-3 text-sm text-forest-100">{t(DELIVERY_LABEL[order.delivery])}<br />{order.customer.address}<br />{order.customer.postalCode} {order.customer.city}, {countryName(order.customer.country)}</p>
            <p className="mt-3 text-sm text-forest-300">{t('Payment')}: {t(PAYMENT_LABEL[order.payment])}</p>
          </div>
          <div className="rounded-3xl bg-forest-950 p-5 text-forest-50">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-forest-200">{t('Items')}</dt><dd className="tabular-nums">{formatPrice(order.totals.subtotal)}</dd></div>
              {order.totals.savings + order.totals.promoDiscount + order.totals.subscriptionDiscount > 0 && (
                <div className="flex justify-between"><dt className="text-forest-200">{t('Discounts')}</dt><dd className="tabular-nums">−{formatPrice(order.totals.savings + order.totals.promoDiscount + order.totals.subscriptionDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-forest-200">{t('Shipping')}</dt><dd>{order.deliveryPrice ? formatPrice(order.deliveryPrice) : t('Free')}</dd></div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="font-display text-lg font-semibold">{t('Total')}</dt>
                <dd className="font-display text-2xl font-semibold tabular-nums text-gold-300">{formatPrice(order.grandTotal)}</dd>
              </div>
              <div className="text-xs text-forest-200">{t('incl. VAT')} · {t('{points} loyalty points earned', { points: order.pointsEarned })}</div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
