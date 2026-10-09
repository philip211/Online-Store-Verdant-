import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Mail, PackageCheck, Truck } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice, useDocumentMeta } from '@/shared/lib'
import { Button, HempLeaf } from '@/shared/ui'

interface State {
  orderId: string
  total: number
  email: string
  name: string
  points?: number
}

export default function OrderSuccessPage() {
  const { t } = useT()
  const state = useLocation().state as State | null
  useDocumentMeta({ title: t('Order confirmed') })

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!state) return <Navigate to={ROUTES.home} replace />

  return (
    <div className="container-x py-20">
      <div className="border-glow-dark relative mx-auto max-w-2xl overflow-hidden rounded-[2.5rem] bg-forest-950 p-8 text-center text-forest-50 shadow-glow ring-1 ring-gold-500/30 noise sm:p-14">
        <HempLeaf className="pointer-events-none absolute -right-16 -top-16 size-72 text-forest-100/[0.05]" />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }} className="mx-auto grid size-20 place-items-center rounded-full bg-gold-500 text-forest-950">
          <CheckCircle2 className="size-10" />
        </motion.div>
        <p className="eyebrow mt-6 justify-center text-gold-400">{t('Order')} {state.orderId}</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{t('Thank you, {name}!', { name: state.name })}</h1>
        <p className="mx-auto mt-4 max-w-md text-forest-100">
          {t('Your order of {amount} is confirmed. The receipt and tracking number are on their way to {email}.', { amount: formatPrice(state.total), email: state.email })}
          {state.points ? <> {t('You earned {points} loyalty points.', { points: state.points })}</> : null}
        </p>

        <ol className="mx-auto mt-10 grid max-w-lg gap-4 text-left sm:grid-cols-3">
          {[
            { icon: Mail, tt: t('Confirmation'), d: t('in your inbox') },
            { icon: PackageCheck, tt: t('Packing'), d: t('today before 15:00') },
            { icon: Truck, tt: t('Delivery'), d: t('2–6 business days') },
          ].map(({ icon: Icon, tt, d }, i) => (
            <motion.li key={tt} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.12 }} className="rounded-2xl border border-white/10 bg-forest-900/60 p-4">
              <Icon className="size-5 text-gold-400" />
              <div className="mt-2 text-sm font-semibold">{tt}</div>
              <div className="text-xs text-forest-200">{d}</div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to={ROUTES.catalog}>
            <Button variant="gold" shine>
              {t('Continue shopping')} <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link to={ROUTES.order(state.orderId)}>
            <Button variant="outline">{t('Track order')}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
