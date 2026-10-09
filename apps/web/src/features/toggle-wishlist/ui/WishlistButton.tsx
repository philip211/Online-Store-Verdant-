import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useIsWishlisted, useWishlistStore } from '@/entities/wishlist'
import type { Product } from '@/entities/product'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'

interface Props {
  product: Product
  className?: string
  size?: 'sm' | 'md'
  withLabel?: boolean
}

export function WishlistButton({ product, className, size = 'sm', withLabel }: Props) {
  const { t } = useT()
  const active = useIsWishlisted(product.id)
  const toggle = useWishlistStore((s) => s.toggle)

  const onClick = () => {
    const added = toggle(product.id)
    toast(added ? t('Saved to wishlist') : t('Removed from wishlist'), { description: product.name })
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? t('Remove from wishlist') : t('Save to wishlist')}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full shadow-soft transition-all duration-300',
        active ? 'bg-rose-500 text-white' : 'glass-lite text-forest-200 hover:bg-white/20',
        withLabel ? 'h-11 px-5 text-sm font-semibold' : size === 'sm' ? 'size-10' : 'size-12',
        className,
      )}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: [0.6, 1.25, 1] }} transition={{ duration: 0.35 }} className="grid place-items-center">
        <Heart className={cn('size-4', active && 'fill-current')} />
      </motion.span>
      {withLabel && (active ? t('In wishlist') : t('Save to wishlist'))}
    </motion.button>
  )
}
