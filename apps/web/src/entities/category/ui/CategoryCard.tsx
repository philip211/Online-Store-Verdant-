import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { staggerItem } from '@/shared/ui'
import type { Category } from '../model/data'

export function CategoryCard({ category, count, className }: { category: Category; count?: number; className?: string }) {
  const { t, tn } = useT()
  return (
    <motion.div variants={staggerItem} className={cn('h-full', className)}>
      <Link
        to={`${ROUTES.catalog}?category=${category.id}`}
        className="group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-3xl bg-forest-900 p-6 text-forest-50 ring-1 ring-white/10"
      >
        <img
          src={category.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
        />
        {/* Scrim keeps the copy at WCAG contrast over any photo. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/10" />
        <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/30 bg-forest-950/40 text-forest-50 transition-colors duration-200 group-hover:bg-forest-50 group-hover:text-forest-950">
          <ArrowUpRight className="size-4" />
        </span>
        <span className="relative text-xs font-semibold uppercase tracking-[0.14em] text-gold-300">{t(category.tagline)}</span>
        <h3 className="relative mt-1 font-display text-3xl font-semibold">{t(category.title)}</h3>
        <p className="relative mt-2 max-w-xs text-sm text-forest-100">{t(category.description)}</p>
        {count != null && <span className="relative mt-3 text-xs text-forest-200">{tn(count, '{count} product', '{count} products')}</span>}
      </Link>
    </motion.div>
  )
}
