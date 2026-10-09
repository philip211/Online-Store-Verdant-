import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, Leaf, ShieldCheck } from 'lucide-react'
import { CATEGORY_LABELS, EffectIcon, getDefaultVariant, Price, ProductBadges, ProductVisual, useQuickView, VariantSelector, type ProductVariant } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { WishlistButton } from '@/features/toggle-wishlist'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel } from '@/shared/lib'
import { Modal, Stars, Stepper } from '@/shared/ui'

export function QuickViewModal() {
  const { t, tn } = useT()
  const product = useQuickView((s) => s.product)
  const close = useQuickView((s) => s.close)
  const [variant, setVariant] = useState<ProductVariant | null>(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setVariant(getDefaultVariant(product))
      setQty(1)
    }
  }, [product])

  return (
    <Modal open={!!product} onClose={close} size="xl">
      {product && variant && (
        <div className="grid md:grid-cols-2">
          <div className="aspect-[4/3] sm:aspect-square md:aspect-auto">
            <ProductVisual product={product} variant="hero" />
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <ProductBadges badges={product.badges} max={3} />
            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-forest-300">
              {t(CATEGORY_LABELS[product.category])}
              {product.strain ? ` · ${product.strain}` : ''}
            </span>
            <h3 className="mt-1 font-display text-4xl font-semibold leading-tight text-forest-50">{product.name}</h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-forest-300">
              <Stars value={product.rating} /> {product.rating} · {tn(product.reviewsCount, '{count} review', '{count} reviews')}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-forest-100">{product.shortDescription}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Spec icon={FlaskConical} label={`CBD ${cbdLabel(product.cbd, product.category)}`} />
              <Spec icon={ShieldCheck} label={`THC ${product.thc}%`} />
              <Spec icon={Leaf} label={product.origin} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.effects.map((e) => (
                <span key={e} className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs text-forest-100">
                  <EffectIcon effect={e} withLabel className="text-sm" />
                </span>
              ))}
            </div>

            <VariantSelector variants={product.variants} value={variant} onChange={setVariant} className="mt-6" />

            <div className="mt-6 flex items-end justify-between gap-4">
              <Price animated price={variant.price} oldPrice={variant.oldPrice} lowestPrice30d={variant.lowestPrice30d} size="lg" />
              <Stepper value={qty} onChange={setQty} max={variant.stock} />
            </div>

            <div className="mt-5 flex gap-2">
              <AddToCartButton product={product} selectedVariant={variant} qty={qty} size="lg" className="flex-1" />
              <WishlistButton product={product} size="md" className="size-13 shadow-none ring-1 ring-white/15" />
            </div>

            <Link to={ROUTES.product(product.slug)} onClick={close} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-300 hover:underline">
              {t('View full details')} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Spec({ icon: Icon, label }: { icon: typeof Leaf; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 glass-card px-3 py-1 text-xs font-medium text-forest-100">
      <Icon className="size-3.5 text-forest-300" /> {label}
    </span>
  )
}
