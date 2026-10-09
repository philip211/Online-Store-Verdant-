import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Compass, Heart, Menu, Package, Search, ShieldCheck, ShoppingBag, Truck, Undo2 } from 'lucide-react'
import { useCartCount, useCartStore } from '@/entities/cart'
import { useWishlistCount } from '@/entities/wishlist'
import { SearchCommand } from '@/features/product-search'
import { useQuiz } from '@/features/product-quiz'
import { FREE_SHIPPING_THRESHOLD, ROUTES, STORE_NAME, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice, useScrolled } from '@/shared/lib'
import { HempLeaf, Marquee } from '@/shared/ui'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'

const NAV = [
  { to: ROUTES.catalog, label: 'Shop' },
  { to: `${ROUTES.catalog}?category=flowers`, label: 'Flowers' },
  { to: `${ROUTES.catalog}?category=oils`, label: 'Oils' },
  { to: ROUTES.lab, label: 'Lab reports' },
  { to: ROUTES.about, label: 'About' },
]

export function Header() {
  const { t } = useT()
  const scrolled = useScrolled(24)
  const cartCount = useCartCount()
  const wishlistCount = useWishlistCount()
  const openCart = useCartStore((s) => s.open)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const openQuiz = useQuiz((s) => s.openQuiz)
  const location = useLocation()

  useEffect(() => setMenu(false), [location.pathname, location.search])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearch((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <div className="bg-forest-950 text-xs font-medium text-forest-200">
        <Marquee className="py-2" speed={46}>
          {[
            { icon: Truck, text: t('Free EU shipping from {amount}', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) }) },
            { icon: Undo2, text: t('14-day right of withdrawal') },
            { icon: ShieldCheck, text: t('Lab certificate in every box · THC < {thc}%', { thc: THC_LIMIT_PERCENT }) },
            { icon: Heart, text: t('Subscribe & save 15% on your favourites') },
          ].map(({ icon: Icon, text }, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <Icon className="size-3.5 text-gold-400" />
              {text}
            </span>
          ))}
        </Marquee>
      </div>

      <header className={cn('sticky top-0 z-50 transition-all duration-500', scrolled ? 'glass-dark shadow-soft' : 'border-b border-white/5 bg-forest-950/95')}>
        <div className="container-x flex h-16 items-center justify-between gap-3 sm:h-[72px] sm:gap-6">
          <Link to={ROUTES.home} className="group flex items-center gap-2.5" aria-label={STORE_NAME}>
            <span className="grid size-9 place-items-center rounded-full border border-gold-500/50 bg-forest-900 transition-transform duration-500 group-hover:rotate-12 sm:size-10">
              <HempLeaf className="size-5 text-gold-400" />
            </span>
            <span className="font-display text-xl font-semibold tracking-wide text-forest-50 sm:text-2xl">{STORE_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t('Main navigation')}>
            <button onClick={openQuiz} className="rounded-full px-4 py-2 text-sm font-medium text-gold-300 transition-colors hover:text-gold-200">
              <span className="inline-flex items-center gap-1.5"><Compass className="size-3.5" /> {t('Find my match')}</span>
            </button>
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                className={({ isActive }) =>
                  cn('relative rounded-full px-4 py-2 text-sm font-medium transition-colors', 'text-forest-200 hover:text-forest-50', isActive && !n.to.includes('?') && 'text-forest-50')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative z-10">{t(n.label)}</span>
                    {isActive && !n.to.includes('?') && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/8 ring-1 ring-white/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button
              onClick={() => setSearch(true)}
              className="hidden h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-forest-200 transition hover:border-gold-500/40 hover:text-forest-50 md:flex"
              aria-label={t('Search')}
            >
              <Search className="size-4" />
              <span>{t('Search')}</span>
              <kbd className="ml-2 rounded border border-white/10 px-1.5 text-[10px]">⌘K</kbd>
            </button>
            <LanguageSwitcher className="hidden sm:block" />
            <IconBtn onClick={() => setSearch(true)} label={t('Search')} className="md:hidden">
              <Search className="size-5" />
            </IconBtn>
            <Link to={ROUTES.wishlist} className="relative hidden sm:block" aria-label={t('Wishlist')}>
              <IconBtn label={t('Wishlist')}>
                <Heart className="size-5" />
                <Counter n={wishlistCount} />
              </IconBtn>
            </Link>
            <Link to={ROUTES.orders} aria-label={t('My orders')} className="hidden sm:block">
              <IconBtn label={t('My orders')}>
                <Package className="size-5" />
              </IconBtn>
            </Link>
            <IconBtn onClick={openCart} label={t('Cart')}>
              <ShoppingBag className="size-5" />
              <Counter n={cartCount} gold />
            </IconBtn>
            <IconBtn onClick={() => setMenu(true)} label={t('Menu')} className="lg:hidden">
              <Menu className="size-5" />
            </IconBtn>
          </div>
        </div>
      </header>

      <SearchCommand open={search} onClose={() => setSearch(false)} />

      <MobileMenu
        open={menu}
        onClose={() => setMenu(false)}
        onSearch={() => {
          setMenu(false)
          setSearch(true)
        }}
        onQuiz={() => {
          setMenu(false)
          openQuiz()
        }}
      />
    </>
  )
}

function IconBtn({ children, onClick, label, className }: { children: React.ReactNode; onClick?: () => void; label: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cn('relative grid size-10 place-items-center rounded-full text-forest-200 transition hover:bg-white/10 hover:text-forest-50 sm:size-11', className)}>
      {children}
    </button>
  )
}

function Counter({ n, gold }: { n: number; gold?: boolean }) {
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.3, 1], opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          className={cn('absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full px-1 text-xs font-bold tabular-nums', gold ? 'bg-gold-500 text-forest-950' : 'bg-rose-500 text-white')}
        >
          {n}
        </motion.span>
      )}
    </AnimatePresence>
  )
}
