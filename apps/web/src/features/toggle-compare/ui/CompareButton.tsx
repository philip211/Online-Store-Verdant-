import { motion } from 'framer-motion'
import { ArrowLeftRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useCompareStore, useIsCompared } from '@/entities/compare'
import type { Product } from '@/entities/product'
import { COMPARE_LIMIT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'

export function CompareButton({ product, className, withLabel }: { product: Product; className?: string; withLabel?: boolean }) {
  const { t } = useT()
  const active = useIsCompared(product.id)
  const toggle = useCompareStore((s) => s.toggle)

  const onClick = () => {
    const res = toggle(product.id)
    if (res === 'full') toast.error(t('You can compare up to {count} products', { count: COMPARE_LIMIT }))
    else toast(res === 'added' ? t('Added to comparison') : t('Removed from comparison'), { description: product.name })
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? t('Remove from comparison') : t('Compare')}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full shadow-soft transition-all duration-300',
        active ? 'bg-forest-300 text-forest-950' : 'glass-lite text-forest-200 hover:bg-white/20',
        withLabel ? 'h-11 px-5 text-sm font-semibold' : 'size-10',
        className,
      )}
    >
      {active ? <Check className="size-4" /> : <ArrowLeftRight className="size-4" />}
      {withLabel && (active ? t('In comparison') : t('Compare'))}
    </motion.button>
  )
}
