import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, X } from 'lucide-react'
import { useCompareStore } from '@/entities/compare'
import { ProductVisual, useCatalog } from '@/entities/product'
import { COMPARE_LIMIT, ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

export function CompareBar() {
  const { t } = useT()
  const ids = useCompareStore((s) => s.ids)
  const remove = useCompareStore((s) => s.remove)
  const clear = useCompareStore((s) => s.clear)
  const { pathname } = useLocation()
  const visible = ids.length > 0 && pathname !== ROUTES.compare && !pathname.startsWith(ROUTES.checkout)
  const onProduct = pathname.startsWith('/product/')
  const catalog = useCatalog()
  const products = ids.map((id) => catalog.find((p) => p.id === id)).filter(Boolean)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className={cn('fixed inset-x-0 z-40 px-4', onProduct ? 'bottom-[164px] lg:bottom-4' : 'bottom-[92px] lg:bottom-4')}>
          <div className="border-glow-dark mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-forest-950/95 py-2 pl-3 pr-2 text-forest-50 shadow-glow backdrop-blur">
            <div className="flex items-center gap-2">
              {products.map((p) => (
                <div key={p!.id} className="group relative size-11 overflow-hidden rounded-full ring-1 ring-gold-500/40">
                  <ProductVisual product={p!} variant="thumb" />
                  <button onClick={() => remove(p!.id)} aria-label={t('Remove {name}', { name: p!.name })} className="absolute inset-0 grid place-items-center bg-forest-950/70 opacity-0 transition group-hover:opacity-100">
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              {Array.from({ length: COMPARE_LIMIT - products.length }).map((_, i) => (
                <div key={i} className="size-11 rounded-full border border-dashed border-forest-400/50" />
              ))}
            </div>
            <span className="hidden flex-1 text-sm text-forest-200 sm:block">{t('{count} of {max} to compare', { count: products.length, max: COMPARE_LIMIT })}</span>
            <Button variant="ghost" size="sm" className="hidden text-forest-200 hover:bg-white/10 sm:inline-flex" onClick={clear}>{t('Clear')}</Button>
            <Link to={ROUTES.compare}>
              <Button variant="gold" size="sm" disabled={products.length < 2}>
                <ArrowLeftRight className="size-4" /> {t('Compare')}
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
