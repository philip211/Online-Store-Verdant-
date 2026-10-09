import { Link, NavLink, useLocation } from 'react-router-dom'
import { Compass, Heart, House, Leaf, Package } from 'lucide-react'
import { useWishlistCount } from '@/entities/wishlist'
import { useQuiz } from '@/features/product-quiz'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'

export function MobileTabBar() {
  const { t } = useT()
  const wishlist = useWishlistCount()
  const openQuiz = useQuiz((s) => s.openQuiz)
  const { pathname } = useLocation()
  if (pathname.startsWith('/checkout')) return null

  const TABS = [
    { to: ROUTES.home, label: t('Home'), icon: House, end: true },
    { to: ROUTES.catalog, label: t('Shop'), icon: Leaf },
    { to: ROUTES.wishlist, label: t('Wishlist'), icon: Heart },
    { to: ROUTES.orders, label: t('Orders'), icon: Package },
  ]

  const item = (active: boolean) => cn('flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-0.5 py-1.5 text-[10px] font-semibold leading-none transition-colors', active ? 'text-forest-50' : 'text-forest-300')
  const bubble = (active: boolean) => cn('grid size-9 place-items-center rounded-2xl transition-all', active ? 'bg-forest-300 shadow-[0_8px_20px_-8px_rgba(161,194,159,0.8)]' : 'bg-white/5')

  return (
    <nav aria-label={t('Mobile navigation')} className="fixed inset-x-3 bottom-3 z-40 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="glass-card flex items-center gap-0.5 rounded-[1.6rem] p-1 shadow-2xl">
        {TABS.slice(0, 2).map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => item(isActive)}>
            {({ isActive }) => (
              <>
                <span className={bubble(isActive)}>
                  <tab.icon className={cn('size-[18px]', isActive ? 'text-forest-950' : 'text-forest-100')} />
                </span>
                <span className={cn('w-full truncate text-center', isActive && 'text-forest-50')}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button type="button" onClick={openQuiz} className={item(false)} aria-label={t('Find my match')}>
          <span className="grid size-11 -translate-y-3 place-items-center rounded-2xl bg-gold-500 text-forest-950 shadow-glow">
            <Compass className="size-5" />
          </span>
          <span className="-mt-2">{t('Match')}</span>
        </button>
        {TABS.slice(2).map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => item(isActive)}>
            {({ isActive }) => (
              <>
                <span className={cn(bubble(isActive), 'relative')}>
                  <tab.icon className={cn('size-[18px]', isActive ? 'text-forest-950' : 'text-forest-100')} />
                  {tab.to === ROUTES.wishlist && wishlist > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{wishlist}</span>}
                </span>
                <span className={cn('w-full truncate text-center', isActive && 'text-forest-50')}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <Link to={ROUTES.cart} className="sr-only">{t('Cart')}</Link>
    </nav>
  )
}
