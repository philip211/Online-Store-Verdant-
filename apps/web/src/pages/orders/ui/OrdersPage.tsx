import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Coins, Package } from 'lucide-react'
import { getOrderStatus, useOrderStore, usePointsBalance, type OrderStatus } from '@/entities/order'
import { ProductVisual, useCatalog } from '@/entities/product'
import { POINTS_RATE, ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatDate, formatPrice, useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'

export const STATUS_LABELS: Record<OrderStatus, string> = { processing: 'Received', packed: 'Packed', shipped: 'On its way', delivered: 'Delivered' }

export default function OrdersPage() {
  const { t, tn } = useT()
  useDocumentMeta({ title: t('My orders'), description: t('Order history and loyalty points.') })
  const orders = useOrderStore((s) => s.orders)
  const points = usePointsBalance()
  const catalog = useCatalog()

  return (
    <div className="container-x py-12">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow"><span className="h-px w-6 bg-current" /> {t('Account')}</p>
          <h1 className="mt-2 text-4xl font-semibold text-forest-50 sm:text-5xl">{t('My orders')}</h1>

          {orders.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-white/20 py-20 text-center">
              <Package className="size-10 text-forest-400" />
              <h2 className="mt-4 font-display text-2xl font-semibold text-forest-50">{t('No orders yet')}</h2>
              <p className="mt-2 max-w-sm text-sm text-forest-300">{t('After your first purchase you will find the history, delivery status and loyalty points here.')}</p>
              <Link to={ROUTES.catalog} className="mt-6"><Button variant="outline">{t('Browse the shop')}</Button></Link>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {orders.map((o) => {
                const status = getOrderStatus(o)
                return (
                  <li key={o.id} className="border-glow rounded-3xl border border-white/10 glass-card p-5 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-display text-2xl font-semibold text-forest-50">{t('Order')} {o.id}</div>
                        <div className="text-sm text-forest-300">{formatDate(o.createdAt)} · {tn(o.items.length, '{count} item', '{count} items')}</div>
                      </div>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]', status === 'delivered' ? 'bg-forest-300 text-forest-950' : 'bg-gold-500 text-forest-950')}>{t(STATUS_LABELS[status])}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {o.items.slice(0, 4).map((i) => {
                          const p = catalog.find((x) => x.id === i.productId)
                          return (
                            <div key={i.key} className="size-12 overflow-hidden rounded-full ring-2 ring-forest-950">
                              {p && <ProductVisual product={p} variant="thumb" />}
                            </div>
                          )
                        })}
                      </div>
                      <div className="ml-auto text-right">
                        <div className="font-semibold tabular-nums text-forest-50">{formatPrice(o.grandTotal)}</div>
                        <div className="text-xs text-forest-300">+{o.pointsEarned} {t('points')}</div>
                      </div>
                      <Link to={ROUTES.order(o.id)}>
                        <Button variant="outline" size="sm">{t('Details')} <ArrowRight className="size-4" /></Button>
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="border-glow-dark sticky top-24 overflow-hidden rounded-3xl bg-forest-950 p-6 text-forest-50 shadow-glow">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold-400">
              <Coins className="size-4" /> {t('Loyalty points')}
            </div>
            <div className="mt-3 font-display text-6xl font-semibold text-gradient-gold">{points.toLocaleString()}</div>
            <p className="mt-2 text-sm text-forest-100">{t('1 point = €0.01. You earn {rate}% of every order and can redeem up to 30% of your next one.', { rate: Math.round(POINTS_RATE * 100) })}</p>
            <ul className="mt-5 space-y-2 text-sm text-forest-100">
              <li className="flex items-center gap-2"><Coins className="size-4 text-gold-400" /> {t('Double points on subscriptions')}</li>
              <li className="flex items-center gap-2"><Camera className="size-4 text-gold-400" /> {t('+200 points for a review with a photo')}</li>
            </ul>
            <Link to={ROUTES.catalog} className="mt-6 block">
              <Button variant="gold" shine className="w-full">{t('Keep earning')}</Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
