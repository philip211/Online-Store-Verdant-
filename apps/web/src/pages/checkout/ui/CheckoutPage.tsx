import { forwardRef, useMemo, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CreditCard, Lock, MapPin, User } from 'lucide-react'
import { toast } from 'sonner'
import { COUNTRY_CODES, DELIVERY_OPTIONS, PAYMENT_OPTIONS, deliveryDaysFor, deliveryPriceFor, grandTotalFor, restrictedCategoriesFor, VAT_RATE } from '@verdant/shared'
import { useCartStore, useCartTotals } from '@/entities/cart'
import { useCreateOrder, useOrderStore } from '@/entities/order'
import { CATEGORY_LABELS, ProductVisual, useCatalog } from '@/entities/product'
import { PromoCodeForm } from '@/features/promo-code'
import { errorMessage } from '@/shared/api'
import { ROUTES, SUBSCRIPTION_DISCOUNT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, countryName, formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Button, Input, Select, Textarea } from '@/shared/ui'
import { checkoutSchema, type CheckoutForm } from '../model/schema'

const STEPS = [
  { id: 0, title: 'Contact', icon: User, fields: ['name', 'phone', 'email'] as const },
  { id: 1, title: 'Delivery', icon: MapPin, fields: ['country', 'delivery', 'city', 'postalCode', 'address'] as const },
  { id: 2, title: 'Payment', icon: CreditCard, fields: ['payment', 'agree', 'age'] as const },
]

export default function CheckoutPage() {
  const { t, locale } = useT()
  useDocumentMeta({ title: t('Checkout') })
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const promoCode = useCartStore((s) => s.promoCode)
  const totals = useCartTotals()
  const addOrder = useOrderStore((s) => s.addOrder)
  const createOrder = useCreateOrder()
  const catalog = useCatalog()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const placed = useRef(false)

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: { delivery: 'standard', payment: 'card', country: locale === 'fr' ? 'FR' : locale === 'de' ? 'DE' : 'DE', city: '', postalCode: '', address: '', comment: '' } as Partial<CheckoutForm>,
  })
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = form
  const delivery = watch('delivery')
  const payment = watch('payment')
  const country = watch('country') || 'DE'
  const err = (m?: string) => (m ? t(m) : undefined)
  const countryOptions = useMemo(
    () => [...COUNTRY_CODES].sort((a, b) => countryName(a).localeCompare(countryName(b))).map((c) => ({ value: c, label: countryName(c) })),
    // countryName reads the active locale, so the list is rebuilt when the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  )

  const restricted = useMemo(() => restrictedCategoriesFor(country), [country])
  const blocked = useMemo(() => items.filter((i) => restricted.includes(i.category as (typeof restricted)[number])), [items, restricted])
  if (!items.length && !placed.current) return <Navigate to={ROUTES.cart} replace />

  const deliveryPrice = deliveryPriceFor(delivery, country, totals)
  const grandTotal = grandTotalFor(totals, deliveryPrice)
  const vat = Math.round(grandTotal - grandTotal / (1 + VAT_RATE))

  const next = async () => {
    const ok = await trigger(STEPS[step].fields as unknown as (keyof CheckoutForm)[])
    if (!ok) return
    if (step === 1 && blocked.length) {
      toast.error(t('Some products cannot be shipped to {country}', { country: countryName(country) }))
      return
    }
    setStep((s) => Math.min(2, s + 1))
  }

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true)
    try {
      const order = await createOrder.mutateAsync({
        customer: { name: data.name, email: data.email, phone: data.phone, country: data.country, city: data.city, postalCode: data.postalCode, address: data.address, comment: data.comment || undefined },
        delivery: data.delivery,
        payment: data.payment,
        promoCode,
        items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, subscription: i.subscription, bundle: !!i.bundle })),
        locale,
      })
      placed.current = true
      addOrder(order)
      clear()
      navigate(ROUTES.orderSuccess, { state: { orderId: order.id, total: order.grandTotal, email: data.email, name: data.name, points: order.pointsEarned }, replace: true })
    } catch (e) {
      toast.error(t('Could not place the order'), { description: errorMessage(e) })
      setSubmitting(false)
    }
  }

  return (
    <div className="container-x py-10 lg:py-14">
      <Link to={ROUTES.cart} className="inline-flex items-center gap-1.5 text-sm text-forest-300 hover:text-forest-50">
        <ArrowLeft className="size-4" /> {t('Back to cart')}
      </Link>
      <h1 className="mt-4 text-4xl font-semibold text-forest-50 sm:text-5xl">{t('Checkout')}</h1>

      <ol className="mt-8 flex items-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <li key={s.id} className="flex flex-1 items-center gap-3">
              <button type="button" onClick={() => i < step && setStep(i)} className={cn('flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold transition', active ? 'bg-forest-300 text-forest-950' : done ? 'bg-white/10 text-forest-100' : 'text-forest-400')}>
                <span className={cn('grid size-8 place-items-center rounded-full', active ? 'bg-forest-200' : done ? 'bg-forest-300 text-forest-950' : 'bg-white/10')}>{done ? <Check className="size-4" /> : <Icon className="size-4" />}</span>
                <span className="hidden sm:inline">{t(s.title)}</span>
              </button>
              {i < STEPS.length - 1 && <span className={cn('h-px flex-1', done ? 'bg-forest-300' : 'bg-white/15')} />}
            </li>
          )
        })}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="border-glow space-y-6 rounded-3xl border border-white/10 glass-card p-6 sm:p-8">
            {step === 0 && (
              <>
                <h2 className="font-display text-3xl font-semibold text-forest-50">{t('Contact details')}</h2>
                <Input label={t('Full name')} placeholder={t('First and last name')} autoComplete="name" {...register('name')} error={err(errors.name?.message)} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label={t('Phone')} placeholder="+49 30 123 45 67" autoComplete="tel" inputMode="tel" {...register('phone')} error={err(errors.phone?.message)} />
                  <Input label="E-mail" placeholder="you@example.com" autoComplete="email" inputMode="email" {...register('email')} error={err(errors.email?.message)} hint={t('For the receipt and tracking number')} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="font-display text-3xl font-semibold text-forest-50">{t('Delivery')}</h2>
                <Select
                  variant="field"
                  name="country"
                  label={t('Country')}
                  value={country}
                  options={countryOptions}
                  onChange={(c) => setValue('country', c, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                  error={err(errors.country?.message)}
                />

                {blocked.length > 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <strong>{t('Not available in {country}', { country: countryName(country) })}</strong>
                      <p className="mt-1 text-rose-200/90">{t('Hemp flowers and pre-rolls cannot be shipped to this country. Remove these items or choose another country:')}</p>
                      <ul className="mt-1 list-disc pl-5">{blocked.map((b) => <li key={b.key}>{b.name} ({t(CATEGORY_LABELS[b.category as keyof typeof CATEGORY_LABELS])})</li>)}</ul>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map((d) => {
                    const price = deliveryPriceFor(d.id, country, totals)
                    const [min, max] = deliveryDaysFor(d.id, country)
                    const titles = { standard: t('Standard delivery'), express: t('Express delivery'), pickup: t('Pickup point') }
                    return (
                      <OptionCard key={d.id} active={delivery === d.id} onClick={() => setValue('delivery', d.id, { shouldValidate: true })} title={titles[d.id]} note={`${d.carrier} · ${t('{min}–{max} business days', { min, max })}`} right={price === 0 ? t('Free') : formatPrice(price)} />
                    )
                  })}
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Input label={t('Postal code')} placeholder="10115" autoComplete="postal-code" {...register('postalCode')} error={err(errors.postalCode?.message)} />
                  <div className="sm:col-span-2">
                    <Input label={t('City')} placeholder="Berlin" autoComplete="address-level2" {...register('city')} error={err(errors.city?.message)} />
                  </div>
                </div>
                <Input label={delivery === 'pickup' ? t('Pickup point address') : t('Street and house number')} placeholder={t('Street, number, apartment')} autoComplete="street-address" {...register('address')} error={err(errors.address?.message)} />
                <Textarea label={t('Note for the courier')} placeholder={t('Door code, preferred time…')} {...register('comment')} />
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="font-display text-3xl font-semibold text-forest-50">{t('Payment')}</h2>
                <div className="space-y-2">
                  {PAYMENT_OPTIONS.map((p) => (
                    <OptionCard key={p.id} active={payment === p.id} onClick={() => setValue('payment', p.id, { shouldValidate: true })} title={t(p.title)} note={t(p.note)} />
                  ))}
                </div>
                <div className="space-y-3 pt-2">
                  <CheckRow error={err(errors.age?.message)} {...register('age')}>{t('I confirm that I am 18 years or older')}</CheckRow>
                  <CheckRow error={err(errors.agree?.message)} {...register('agree')}>
                    {t('I accept the')} <Link to={ROUTES.legal('terms')} className="underline">{t('terms & conditions')}</Link> {t('and the')} <Link to={ROUTES.legal('privacy')} className="underline">{t('privacy policy')}</Link>
                  </CheckRow>
                </div>
                <p className="flex items-center gap-2 text-xs text-forest-300">
                  <Lock className="size-3.5" /> {t('Your data is protected. Payments are processed under PCI DSS with 3-D Secure.')}
                </p>
              </>
            )}

            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="size-4" /> {t('Back')}
                </Button>
              ) : <span />}
              {step < 2 ? (
                <Button type="button" onClick={next} size="lg">
                  {t('Next')} <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" variant="gold" size="lg" shine loading={submitting} disabled={blocked.length > 0}>
                  {t('Pay {amount}', { amount: formatPrice(grandTotal) })}
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <aside className="lg:col-span-5">
          <div className="border-glow sticky top-24 space-y-5 rounded-3xl border border-white/10 glass-card p-6 shadow-card">
            <h2 className="font-display text-2xl font-semibold text-forest-50">{t('Your order')}</h2>
            <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => {
                const product = catalog.find((p) => p.id === i.productId)
                const unit = i.subscription ? Math.round(i.price * (1 - SUBSCRIPTION_DISCOUNT)) : i.price
                return (
                  <li key={i.key} className="flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                      {product && <ProductVisual product={product} variant="thumb" />}
                      <span className="absolute -right-0 -top-0 grid size-5 place-items-center rounded-full bg-forest-300 text-[10px] font-bold text-forest-950">{i.qty}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-forest-50">{product?.name ?? i.name}</div>
                      <div className="text-xs text-forest-300">{formatVariantLabel(i.variantLabel)}{i.subscription && ` · ${t('subscription')}`}</div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">{formatPrice(unit * i.qty)}</div>
                  </li>
                )
              })}
            </ul>
            <PromoCodeForm />
            <dl className="space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-forest-300">{t('Items')}</dt><dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd></div>
              {totals.savings + totals.subscriptionDiscount + totals.promoDiscount > 0 && (
                <div className="flex justify-between text-forest-300"><dt>{t('Discounts')}</dt><dd className="tabular-nums">−{formatPrice(totals.savings + totals.subscriptionDiscount + totals.promoDiscount)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-forest-300">{t('Shipping')} · {countryName(country)}</dt><dd>{deliveryPrice ? formatPrice(deliveryPrice) : t('Free')}</dd></div>
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="font-display text-xl font-semibold">{t('Total')}</dt>
                <dd className="font-display text-3xl font-semibold tabular-nums">{formatPrice(grandTotal)}</dd>
              </div>
              <p className="text-right text-xs text-forest-400">{t('incl. {amount} VAT ({rate}%)', { amount: formatPrice(vat), rate: Math.round(VAT_RATE * 100) })}</p>
            </dl>
          </div>
        </aside>
      </form>
    </div>
  )
}

function OptionCard({ active, onClick, title, note, right }: { active: boolean; onClick: () => void; title: string; note: string; right?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition', active ? 'border-forest-300 bg-forest-300/15 shadow-soft' : 'border-white/15 glass-card hover:border-forest-300/60')}>
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', active ? 'border-forest-300' : 'border-white/20')}>{active && <span className="size-2.5 rounded-full bg-forest-300" />}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-forest-50">{title}</span>
        <span className="block text-xs text-forest-300">{note}</span>
      </span>
      {right && <span className="text-sm font-semibold tabular-nums text-forest-100">{right}</span>}
    </button>
  )
}

const CheckRow = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string; children: ReactNode }>(({ error, children, ...rest }, ref) => (
  <label className="block">
    <span className="flex cursor-pointer items-start gap-3 text-sm text-forest-100">
      <input ref={ref} type="checkbox" className="mt-0.5 size-4 shrink-0 rounded accent-forest-300" {...rest} />
      <span>{children}</span>
    </span>
    {error && <span className="mt-1 block pl-7 text-xs text-rose-300">{error}</span>}
  </label>
))
CheckRow.displayName = 'CheckRow'
