import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '@/shared/i18n'
import { cn, formatPrice, formatDiscount } from '@/shared/lib'

interface Props {
  price: number
  oldPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  prefix?: string
  /** Animate value changes (variant / quantity switches). */
  animated?: boolean
  /** EU Omnibus: lowest price of the 30 days before the reduction; shown whenever a reduction is shown. */
  lowestPrice30d?: number
}

export function Price({ price, oldPrice, size = 'md', className, prefix, animated, lowestPrice30d }: Props) {
  const { t } = useT()
  const discount = formatDiscount(price, oldPrice)
  const value = formatPrice(price)
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      {prefix && <span className="text-xs text-forest-300">{prefix}</span>}
      <span
        className={cn(
          'relative inline-block overflow-hidden font-semibold tabular-nums text-forest-50',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-xl',
          size === 'lg' && 'font-display text-4xl',
        )}
      >
        {animated ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: '40%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-40%', opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="inline-block"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        ) : (
          value
        )}
      </span>
      {discount && (
        <>
          <span className={cn('tabular-nums text-forest-400 line-through', size === 'lg' ? 'text-lg' : 'text-sm')}>{formatPrice(oldPrice!)}</span>
          <span className="text-xs font-semibold tabular-nums text-gold-300">−{discount}%</span>
          {lowestPrice30d != null && (
            <span className="basis-full text-xs text-forest-300">{t('Lowest price in the 30 days before: {price}', { price: formatPrice(lowestPrice30d) })}</span>
          )}
        </>
      )}
    </div>
  )
}
