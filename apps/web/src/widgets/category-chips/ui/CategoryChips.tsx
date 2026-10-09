import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Candy, Coffee, Droplets, Flame, HandHeart, Leaf, type LucideIcon } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_SHORT, type ProductCategory } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { HempLeaf, staggerContainer, staggerItem } from '@/shared/ui'

const ICONS: Record<ProductCategory, LucideIcon> = { flowers: Leaf, oils: Droplets, edibles: Candy, cosmetics: HandHeart, prerolls: Flame, tea: Coffee }

export function CategoryChips({ active = 'all', className }: { active?: ProductCategory | 'all'; className?: string }) {
  const { t } = useT()
  const items: Array<{ id: ProductCategory | 'all'; label: string }> = [
    { id: 'all', label: t('All') },
    ...(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((id) => ({ id, label: t(CATEGORY_SHORT[id]) })),
  ]
  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className={cn('no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0', className)}>
      {items.map((c) => {
        const isActive = active === c.id
        const Icon = c.id === 'all' ? null : ICONS[c.id]
        return (
          <motion.div key={c.id} variants={staggerItem} className="shrink-0">
            <Link
              to={c.id === 'all' ? ROUTES.catalog : `${ROUTES.catalog}?category=${c.id}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex w-[84px] flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-semibold transition-all duration-300',
                isActive ? 'border-forest-300/60 bg-forest-300/15 text-forest-50 shadow-[0_0_0_1px_rgba(161,194,159,0.35),0_16px_30px_-16px_rgba(161,194,159,0.6)]' : 'glass-card text-forest-200 hover:-translate-y-0.5 hover:border-white/25 hover:text-forest-50',
              )}
            >
              <span className={cn('grid size-10 place-items-center rounded-xl', isActive ? 'bg-forest-300 text-forest-950' : 'bg-white/8 text-forest-100')}>{Icon ? <Icon className="size-5" /> : <HempLeaf className="size-5" />}</span>
              {c.label}
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
