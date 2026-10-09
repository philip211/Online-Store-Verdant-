import { memo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, FlaskConical } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, cn } from '@/shared/lib'
import { Stars, staggerItem } from '@/shared/ui'
import { CATEGORY_LABELS, getDefaultVariant, getTotalStock, type Product } from '../model/types'
import { Price } from './Price'
import { ProductBadges } from './ProductBadges'
import { ProductVisual } from './ProductVisual'

interface Props {
  product: Product
  /** Slot for the add-to-cart feature button (kept outside the entity to respect FSD layering). */
  actionSlot?: ReactNode
  /** Slot for the wishlist toggle. */
  wishlistSlot?: ReactNode
  /** Slot for the compare toggle. */
  compareSlot?: ReactNode
  onQuickView?: (product: Product) => void
  className?: string
  animated?: boolean
}

function ProductCardImpl({ product, actionSlot, wishlistSlot, compareSlot, onQuickView, className, animated = true }: Props) {
  const { t, tn } = useT()
  const variant = getDefaultVariant(product)
  const stock = getTotalStock(product)
  const lowStock = stock > 0 && stock <= 8
  const Wrapper = animated ? motion.article : 'article'

  return (
    <Wrapper {...(animated ? { variants: staggerItem } : {})} className={cn('group relative flex flex-col', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/10">
        <Link to={ROUTES.product(product.slug)} aria-label={product.name} className="block h-full w-full">
          <ProductVisual product={product} className="transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]" />
        </Link>
        {/* Top scrim keeps badges and icon buttons legible on bright photos. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-forest-950/55 to-transparent" />

        <ProductBadges badges={product.badges} className="absolute left-2 right-12 top-2 sm:left-3 sm:right-14 sm:top-3" />

        <div className="absolute right-2 top-2 flex flex-col gap-2 sm:right-3 sm:top-3">
          {wishlistSlot}
          <div className="hidden sm:contents">{compareSlot}</div>
          {onQuickView && (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={t('Quick view')}
              className="hidden size-10 place-items-center rounded-full glass-lite text-forest-200 opacity-0 shadow-soft transition-all duration-300 translate-y-2 hover:bg-white/20 group-hover:translate-y-0 group-hover:opacity-100 lg:grid"
            >
              <Eye className="size-4" />
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-forest-950/85 px-2.5 py-1 text-xs font-semibold text-forest-100">
          <FlaskConical className="size-3 text-gold-400" />
          CBD {cbdLabel(product.cbd, product.category)}
        </div>

        {actionSlot && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-[140%] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 group-focus-within:translate-y-0 lg:block">
            {actionSlot}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1.5 px-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="min-w-0 basis-full truncate text-xs font-semibold uppercase tracking-[0.12em] text-forest-300 sm:flex-1 sm:basis-auto">
            {t(CATEGORY_LABELS[product.category])}
            {product.strain ? ` · ${product.strain}` : ''}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs text-forest-300">
            <Stars value={product.rating} size={12} />
            <span className="tabular-nums">({product.reviewsCount})</span>
          </span>
        </div>
        <Link to={ROUTES.product(product.slug)} className="font-display text-lg font-semibold leading-snug text-forest-50 transition-colors hover:text-forest-300 sm:text-xl">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm leading-snug text-forest-200">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <Price price={variant.price} oldPrice={variant.oldPrice} lowestPrice30d={variant.lowestPrice30d} size="sm" prefix={product.variants.length > 1 ? t('from') : undefined} />
          {lowStock && <span className="text-xs text-forest-300">{tn(stock, 'Only {count} left', 'Only {count} left')}</span>}
        </div>
        {actionSlot && <div className="mt-3 lg:hidden">{actionSlot}</div>}
      </div>
    </Wrapper>
  )
}

/** Memoised: the grid re-renders on every URL change (router context) while the cards' props do not. */
export const ProductCard = memo(ProductCardImpl)
