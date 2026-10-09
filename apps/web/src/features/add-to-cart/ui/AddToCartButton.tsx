import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import { getDefaultVariant, type Product, type ProductVariant } from '@/entities/product'
import { useT } from '@/shared/i18n'
import { cn, formatVariantLabel } from '@/shared/lib'
import { Burst, Button, type ButtonProps } from '@/shared/ui'

interface Props extends Omit<ButtonProps, 'onClick' | 'variant'> {
  product: Product
  selectedVariant?: ProductVariant
  buttonVariant?: ButtonProps['variant']
  qty?: number
  subscription?: boolean
  openCart?: boolean
  label?: string
  compact?: boolean
}

export function AddToCartButton({ product, selectedVariant, buttonVariant = 'primary', qty = 1, subscription = false, openCart = true, label, compact, className, ...rest }: Props) {
  const { t } = useT()
  const addItem = useCartStore((s) => s.addItem)
  const open = useCartStore((s) => s.open)
  const [done, setDone] = useState(false)
  const v = selectedVariant ?? getDefaultVariant(product)
  const outOfStock = v.stock <= 0

  const handleClick = () => {
    if (outOfStock) return
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variantId: v.id,
      variantLabel: v.label,
      price: v.price,
      oldPrice: v.oldPrice,
      qty,
      hue: product.hue,
      category: product.category,
      subscription,
      maxQty: v.stock,
    })
    setDone(true)
    setTimeout(() => setDone(false), 1400)
    toast.success(`${product.name} · ${formatVariantLabel(v.label)}`, {
      description: subscription ? t('Added with subscription, 15% off') : t('Added to your cart'),
      action: { label: t('Open'), onClick: open },
    })
    if (openCart) setTimeout(open, 350)
  }

  return (
    <Button onClick={handleClick} disabled={outOfStock} variant={done ? 'gold' : buttonVariant} shine className={cn('relative overflow-visible', compact && 'w-full', className)} {...rest}>
      <Burst show={done} />
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span key="done" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="flex items-center gap-2">
            <Check className="size-4" /> {t('Added')}
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} className="flex items-center gap-2">
            <ShoppingBag className="size-4" />
            {outOfStock ? t('Out of stock') : (label ?? t('Add to cart'))}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  )
}
