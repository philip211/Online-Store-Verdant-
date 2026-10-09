import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { useProductsByIds } from '@/entities/product'
import { useWishlistStore } from '@/entities/wishlist'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { ProductGrid } from '@/widgets/product-grid'

export default function WishlistPage() {
  const { t, tn } = useT()
  useDocumentMeta({ title: t('Wishlist') })
  const ids = useWishlistStore((s) => s.ids)
  const { data, isLoading } = useProductsByIds(ids)

  if (!ids.length) {
    return (
      <div className="container-x flex flex-col items-center py-32 text-center">
        <div className="grid size-24 place-items-center rounded-full bg-white/10 text-forest-300">
          <Heart className="size-10" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold text-forest-50">{t('Your wishlist is empty')}</h1>
        <p className="mt-3 max-w-sm text-forest-300">{t('Tap the heart on any product to come back to it later.')}</p>
        <Link to={ROUTES.catalog} className="mt-8">
          <Button size="lg">{t('Browse the shop')} <ArrowRight className="size-4" /></Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-4xl font-semibold text-forest-50 sm:text-5xl">
        {t('Wishlist')} <span className="text-2xl font-normal text-forest-300">· {tn(ids.length, '{count} product', '{count} products')}</span>
      </h1>
      <ProductGrid products={data} loading={isLoading} skeletons={ids.length} className="mt-10" />
    </div>
  )
}
