import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { ProductCard, useQuickView, type Product } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { CompareButton } from '@/features/toggle-compare'
import { WishlistButton } from '@/features/toggle-wishlist'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button, ProductCardSkeleton, staggerContainer } from '@/shared/ui'

interface Props {
  products?: Product[]
  loading?: boolean
  skeletons?: number
  columns?: 2 | 3 | 4
  className?: string
  onReset?: () => void
}

export function ProductGrid({ products, loading, skeletons = 8, columns = 4, className, onReset }: Props) {
  const { t } = useT()
  const openQuickView = useQuickView((s) => s.open)
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' }[columns]

  if (loading) {
    return (
      <div className={cn('grid gap-x-5 gap-y-10', cols, className)}>
        {Array.from({ length: skeletons }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/20 py-20 text-center">
        <SearchX className="size-10 text-forest-400" />
        <h3 className="mt-4 font-display text-2xl font-semibold text-forest-50">{t('Nothing found')}</h3>
        <p className="mt-2 max-w-sm text-sm text-forest-300">{t('Try adjusting the filters or reset them.')}</p>
        {onReset && (
          <Button variant="outline" className="mt-6" onClick={onReset}>
            {t('Reset filters')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className={cn('grid gap-x-5 gap-y-10', cols, className)}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onQuickView={openQuickView} wishlistSlot={<WishlistButton product={p} />} compareSlot={<CompareButton product={p} />} actionSlot={<AddToCartButton product={p} compact size="sm" className="w-full shadow-lg" />} />
      ))}
    </motion.div>
  )
}
