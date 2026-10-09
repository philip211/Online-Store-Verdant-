import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { getMinPrice, ProductVisual, useProductsByIds, useRecentlyViewed } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice } from '@/shared/lib'
import { Reveal } from '@/shared/ui'

export function RecentlyViewed({ excludeId, className }: { excludeId?: string; className?: string }) {
  const { t } = useT()
  const ids = useRecentlyViewed((s) => s.ids).filter((id) => id !== excludeId)
  const { data } = useProductsByIds(ids)
  if (!ids.length || !data?.length) return null
  const ordered = ids.map((id) => data.find((p) => p.id === id)).filter(Boolean)

  return (
    <Reveal className={cn('container-x', className)}>
      <h3 className="flex items-center gap-2 font-display text-2xl font-semibold text-forest-50">
        <History className="size-5 text-forest-400" /> {t('Recently viewed')}
      </h3>
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
        {ordered.map((p) => (
          <Link key={p!.id} to={ROUTES.product(p!.slug)} className="group w-40 shrink-0">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
              <ProductVisual product={p!} variant="thumb" className="transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="mt-2 line-clamp-1 text-sm font-semibold text-forest-50">{p!.name}</div>
            <div className="text-xs text-forest-300">{t('from')} {formatPrice(getMinPrice(p!))}</div>
          </Link>
        ))}
      </div>
    </Reveal>
  )
}
