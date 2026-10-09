import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, FileText, Printer } from 'lucide-react'
import { canWithdraw, useCreateWithdrawal, useOrderStore, type Order, type WithdrawalReceipt } from '@/entities/order'
import { ApiError, api } from '@/shared/api'
import { ROUTES, SUPPORT_EMAIL } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Button, Input, Textarea } from '@/shared/ui'

type Step = 'identify' | 'confirm' | 'done'

const formatDateTime = (iso: string, intl: string) => new Date(iso).toLocaleString(intl, { dateStyle: 'long', timeStyle: 'short' })

/**
 * EU withdrawal button (Directive (EU) 2023/2673, Art. 11a CRD): step 1 identifies the contract, step 2 is the
 * explicit "Confirm withdrawal" action, then a receipt with date and time is shown and e-mailed when mail is configured.
 */
export default function WithdrawalPage() {
  const { t, intl } = useT()
  useDocumentMeta({ title: t('Withdraw from contract') })
  const [params] = useSearchParams()
  const knownOrders = useOrderStore((s) => s.orders)
  const prefillId = params.get('order') ?? ''
  const [orderId, setOrderId] = useState(prefillId)
  const [email, setEmail] = useState(params.get('email') ?? knownOrders.find((o) => o.id === prefillId)?.customer.email ?? '')
  const [step, setStep] = useState<Step>('identify')
  const [order, setOrder] = useState<Order | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [looking, setLooking] = useState(false)
  const [receipt, setReceipt] = useState<WithdrawalReceipt | null>(null)
  const create = useCreateWithdrawal()
  const queryClient = useQueryClient()

  const notFoundMsg = t('We could not find an order with this number and e-mail address')

  const identify = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const id = orderId.trim().toUpperCase()
    if (!/^VD-\d{6}$/.test(id)) return setError(t('Order numbers look like VD-123456'))
    setLooking(true)
    try {
      const found = await api.get<Order>(`/orders/${id}`)
      if (found.customer.email.toLowerCase() !== email.trim().toLowerCase()) return setError(notFoundMsg)
      if (!canWithdraw(found)) return setError(t('The withdrawal period for this order has ended. Please contact {email} and we will look at it individually.', { email: SUPPORT_EMAIL }))
      setOrder(found)
      setSelected(found.items.map((i) => i.key))
      setStep('confirm')
    } catch (err) {
      setError(err instanceof ApiError && err.status === 404 ? notFoundMsg : err instanceof Error ? err.message : notFoundMsg)
    } finally {
      setLooking(false)
    }
  }

  const confirm = async () => {
    if (!order || selected.length === 0) return
    setError(null)
    const whole = selected.length === order.items.length
    try {
      const res = await create.mutateAsync({ orderId: order.id, email: email.trim(), items: whole ? [] : selected, reason: reason.trim() || undefined })
      setReceipt(res)
      setStep('done')
      void queryClient.invalidateQueries({ queryKey: ['orders', order.id] })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Something went wrong. Please try again.'))
    }
  }

  const toggle = (key: string) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]))
  const withdrawnLines = order && receipt ? (receipt.items.length ? order.items.filter((i) => receipt.items.includes(i.key)) : order.items) : []

  return (
    <div className="container-x max-w-3xl py-12 lg:py-16">
      <p className="eyebrow"><span className="h-px w-6 bg-current" /> {t('Right of withdrawal')}</p>
      <h1 className="mt-3 text-4xl font-semibold text-forest-50 sm:text-5xl">{t('Withdraw from contract')}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-100">
        {t('You can withdraw from your purchase within 14 days of receiving the goods, without giving a reason. Two short steps: identify the order, then confirm.')}
      </p>

      <ol className="mt-8 flex gap-6 text-sm" aria-label={t('Steps')}>
        {[t('Identify the order'), t('Confirm withdrawal'), t('Receipt')].map((label, i) => {
          const index = ['identify', 'confirm', 'done'].indexOf(step)
          return (
            <li key={label} className={cn('flex items-center gap-2', i <= index ? 'text-forest-50' : 'text-forest-300')} aria-current={i === index ? 'step' : undefined}>
              <span className={cn('grid size-6 place-items-center rounded-full text-xs font-semibold', i < index ? 'bg-forest-300 text-forest-950' : i === index ? 'ring-1 ring-forest-300' : 'ring-1 ring-white/20')}>
                {i < index ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          )
        })}
      </ol>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      )}

      {step === 'identify' && (
        <form onSubmit={identify} className="mt-8 grid gap-5 rounded-3xl border border-white/10 p-6 sm:grid-cols-2">
          <Input label={t('Order number')} name="orderId" placeholder="VD-123456" autoComplete="off" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
          <Input label={t('E-mail used for the order')} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" loading={looking}>{t('Continue')}</Button>
          </div>
        </form>
      )}

      {step === 'confirm' && order && (
        <div className="mt-8 space-y-6 rounded-3xl border border-white/10 p-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-forest-50">{t('Order')} {order.id}</h2>
            <p className="mt-1 text-sm text-forest-300">{t('Select the items you are withdrawing from.')}</p>
          </div>
          <ul className="space-y-2">
            {order.items.map((i) => (
              <li key={i.key}>
                <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-white/10 px-4 py-3 hover:border-forest-300/60">
                  <input type="checkbox" checked={selected.includes(i.key)} onChange={() => toggle(i.key)} className="size-5 accent-[#a1c29f]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-forest-50">{i.name}</span>
                    <span className="text-sm text-forest-300">{formatVariantLabel(i.variantLabel)} × {i.qty}</span>
                  </span>
                  <span className="tabular-nums text-forest-100">{formatPrice(i.price * i.qty)}</span>
                </label>
              </li>
            ))}
          </ul>
          <Textarea label={t('Reason (optional)')} name="reason" value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
          <p className="text-sm text-forest-200">
            {t('By confirming, you declare your withdrawal from the selected items of order {id}. Unopened products are refunded in full, including the original standard shipping cost, within 14 days of receiving them back.', { id: order.id })}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={confirm} loading={create.isPending} disabled={selected.length === 0}>
              {t('Confirm withdrawal')}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => setStep('identify')}>
              <ArrowLeft className="size-4" /> {t('Back')}
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && receipt && order && (
        <section className="mt-8 rounded-3xl border border-forest-300/40 p-6" aria-labelledby="receipt-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest-300 text-forest-950"><FileText className="size-5" /></span>
            <div>
              <h2 id="receipt-title" className="font-display text-2xl font-semibold text-forest-50">{t('Withdrawal received')}</h2>
              <p className="mt-1 text-sm text-forest-200">
                {receipt.emailSent ? t('A copy of this confirmation has been sent to {email}.', { email: receipt.email }) : t('Please save or print this confirmation for your records.')}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-forest-300">{t('Reference')}</dt>
            <dd className="font-semibold text-forest-50">{receipt.id}</dd>
            <dt className="text-forest-300">{t('Received on')}</dt>
            <dd className="text-forest-50">{formatDateTime(receipt.createdAt, intl)}</dd>
            <dt className="text-forest-300">{t('Order')}</dt>
            <dd className="text-forest-50">{receipt.orderId}</dd>
            <dt className="text-forest-300">{t('Items')}</dt>
            <dd className="text-forest-50">{withdrawnLines.map((i) => `${i.name} ${formatVariantLabel(i.variantLabel)} × ${i.qty}`).join(', ')}</dd>
          </dl>
          <p className="mt-6 text-sm text-forest-200">
            {t('For a prepaid return label, write to {email} quoting the reference above.', { email: SUPPORT_EMAIL })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> {t('Print')}</Button>
            <Link to={ROUTES.order(receipt.orderId)}><Button variant="ghost">{t('View order')}</Button></Link>
          </div>
        </section>
      )}
    </div>
  )
}
