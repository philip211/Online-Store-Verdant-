import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Coins, FlaskConical, Leaf, PackageCheck, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { CATEGORY_LABELS, EffectIcons, getDefaultVariant, Price, ProductBadges, VariantSelector, type Product, type ProductVariant } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { CompareButton } from '@/features/toggle-compare'
import { WishlistButton } from '@/features/toggle-wishlist'
import { FREE_SHIPPING_THRESHOLD, POINTS_RATE, ROUTES, SHIPPING_COST, SUBSCRIPTION_DISCOUNT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, cn, formatPrice, formatVariantLabel } from '@/shared/lib'
import { Stars, Stepper } from '@/shared/ui'
import { DeliveryEstimate } from '@/widgets/delivery-estimate'

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { t, tn } = useT()
  const [variant, setVariant] = useState<ProductVariant>(() => getDefaultVariant(product))
  const [qty, setQty] = useState(1)
  const [subscription, setSubscription] = useState(false)
  const subPrice = Math.round(variant.price * (1 - SUBSCRIPTION_DISCOUNT))
  const lineTotal = (subscription ? subPrice : variant.price) * qty
  const shipping = lineTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

  return (
    <div className="flex flex-col">
      <ProductBadges badges={product.badges} max={3} />
      <span className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-forest-300">
        {t(CATEGORY_LABELS[product.category])}
        {product.strain ? ` · ${product.strain}` : ''} · {product.origin}
      </span>
      <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.02] text-forest-50 sm:text-5xl">{product.name}</h1>
      <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-forest-200 hover:underline">
        <Stars value={product.rating} size={15} />
        <strong>{product.rating}</strong> · {tn(product.reviewsCount, '{count} review', '{count} reviews')}
      </a>
      <p className="mt-5 text-base leading-relaxed text-forest-100">{product.shortDescription}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat icon={FlaskConical} label="CBD" value={cbdLabel(product.cbd, product.category)} />
        <Stat icon={ShieldCheck} label="THC" value={`${product.thc}%`} />
        <Stat icon={Leaf} label={t('Effect')} value={<EffectIcons effects={product.effects} className="text-lg" />} />
      </div>

      {product.variants.length > 1 && (
        <div className="mt-7">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-forest-300">{t('Size')}</div>
          <VariantSelector variants={product.variants} value={variant} onChange={setVariant} />
        </div>
      )}

      <div className="mt-7 space-y-2">
        <ModeOption active={!subscription} onClick={() => setSubscription(false)} title={t('One-time purchase')} price={variant.price} oldPrice={variant.oldPrice} />
        <ModeOption active={subscription} onClick={() => setSubscription(true)} title={t('Subscribe every 30 days')} badge="−15%" price={subPrice} oldPrice={variant.price} note={t('Cancel anytime')} icon={RefreshCw} />
      </div>

      <div className="mt-7 flex items-end justify-between gap-4">
        <div>
          <Price animated price={lineTotal} oldPrice={(subscription ? variant.price : (variant.oldPrice ?? 0)) * qty || undefined} lowestPrice30d={subscription || variant.lowestPrice30d == null ? undefined : variant.lowestPrice30d * qty} size="lg" />
          <div className="mt-1 text-sm text-forest-200">
            {shipping === 0
              ? t('incl. VAT · free shipping')
              : t('incl. VAT · + {shipping} shipping = {total}', { shipping: formatPrice(shipping), total: formatPrice(lineTotal + shipping) })}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-forest-300">
            <Coins className="size-3.5 text-gold-500" /> {t('+{points} loyalty points', { points: Math.round(lineTotal * POINTS_RATE) })}
          </div>
          {variant.stock <= 8 && variant.stock > 0 && (
            <div className="mt-1 text-xs text-forest-300">
              {t('Only {count} left in this size', { count: variant.stock })} ({formatVariantLabel(variant.label)})
            </div>
          )}
        </div>
        <Stepper value={qty} onChange={setQty} max={variant.stock} />
      </div>

      <div className="mt-5 flex gap-2">
        <AddToCartButton product={product} selectedVariant={variant} qty={qty} subscription={subscription} size="lg" className="flex-1" />
        <WishlistButton product={product} size="md" className="size-13 shadow-none ring-1 ring-white/15" />
        <CompareButton product={product} className="size-13 shadow-none ring-1 ring-white/15" />
      </div>

      <DeliveryEstimate className="mt-5" />

      <ul className="mt-6 grid gap-2 text-sm text-forest-200 sm:grid-cols-2">
        <li className="flex items-center gap-2"><Truck className="size-4 text-forest-400" /> {t('Free from {amount}', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) })}</li>
        <li className="flex items-center gap-2"><PackageCheck className="size-4 text-forest-400" /> {t('Discreet packaging')}</li>
        <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-forest-400" /> {t('COA certificate in the box')}</li>
        <li>
          <Link to={ROUTES.legal('shipping')} className="flex items-center gap-2 underline decoration-white/25 underline-offset-4 hover:text-forest-50 hover:decoration-forest-300">
            <Check className="size-4 text-forest-400" /> {t('14-day returns')}
          </Link>
        </li>
      </ul>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Leaf; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 glass-card px-3 py-2.5">
      <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-forest-300">
        <Icon className="size-3" /> {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-forest-50">{value}</div>
    </div>
  )
}

function ModeOption({ active, onClick, title, price, oldPrice, badge, note, icon: Icon }: { active: boolean; onClick: () => void; title: string; price: number; oldPrice?: number; badge?: string; note?: string; icon?: typeof RefreshCw }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200', active ? 'border-forest-300 bg-forest-300/15 shadow-soft' : 'border-white/15 glass-card hover:border-forest-300/60')}>
      <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', active ? 'border-forest-300' : 'border-white/20')}>
        {active && <motion.span layoutId="mode-dot" className="size-2.5 rounded-full bg-forest-300" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-semibold text-forest-50">
          {Icon && <Icon className="size-3.5 text-forest-300" />}
          {title}
          {badge && <span className="text-xs font-semibold text-gold-300">{badge}</span>}
        </span>
        {note && <span className="block text-xs text-forest-300">{note}</span>}
      </span>
      <span className="text-right">
        <span className="block font-semibold tabular-nums text-forest-50">{formatPrice(price)}</span>
        {oldPrice && oldPrice > price && <span className="block text-xs tabular-nums text-forest-400 line-through">{formatPrice(oldPrice)}</span>}
      </span>
    </button>
  )
}
