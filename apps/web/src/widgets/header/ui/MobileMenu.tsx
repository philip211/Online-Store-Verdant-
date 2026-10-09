import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowRight,
  Candy,
  ChevronRight,
  Coffee,
  Droplets,
  Flame,
  FlaskConical,
  Heart,
  Instagram,
  Leaf,
  MessageCircle,
  Package,
  Compass,
  HandHeart,
  Phone,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useCartCount, useCartStore } from '@/entities/cart'
import { useCompareCount } from '@/entities/compare'
import { CATEGORY_SHORT, type ProductCategory } from '@/entities/product'
import { useWishlistCount } from '@/entities/wishlist'
import { FREE_SHIPPING_THRESHOLD, ROUTES, STORE_NAME, SUPPORT_PHONE, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice } from '@/shared/lib'
import { HempLeaf, LeafField } from '@/shared/ui'
import { LanguageSwitcher } from './LanguageSwitcher'

interface Props {
  open: boolean
  onClose: () => void
  onSearch: () => void
  onQuiz: () => void
}

const CATEGORIES: { id: ProductCategory; icon: LucideIcon; hue: string }[] = [
  { id: 'flowers', icon: Leaf, hue: 'from-forest-500/40' },
  { id: 'oils', icon: Droplets, hue: 'from-gold-500/35' },
  { id: 'edibles', icon: Candy, hue: 'from-amber-400/30' },
  { id: 'cosmetics', icon: HandHeart, hue: 'from-rose-300/25' },
  { id: 'prerolls', icon: Flame, hue: 'from-orange-400/30' },
  { id: 'tea', icon: Coffee, hue: 'from-forest-300/35' },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
}

export function MobileMenu({ open, onClose, onSearch, onQuiz }: Props) {
  const { t } = useT()
  const wishlist = useWishlistCount()
  const compare = useCompareCount()
  const cart = useCartCount()
  const openCart = useCartStore((s) => s.open)

  const links: { to: string; label: string; icon: LucideIcon; badge?: number; accent?: boolean }[] = [
    { to: ROUTES.catalog, label: 'All products', icon: Leaf },
    { to: ROUTES.lab, label: 'Lab reports', icon: FlaskConical },
    { to: ROUTES.orders, label: 'My orders', icon: Package },
    { to: ROUTES.wishlist, label: 'Wishlist', icon: Heart, badge: wishlist },
    { to: ROUTES.compare, label: 'Compare', icon: ArrowLeftRight, badge: compare },
    { to: ROUTES.about, label: 'About us', icon: ShieldCheck },
  ]

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div key="mobile-menu" className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-forest-950 text-forest-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} transition={{ duration: 0.3 }}>
          <LeafField dense />

          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="relative flex h-16 shrink-0 items-center justify-between px-4">
            <Link to={ROUTES.home} onClick={onClose} className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full border border-gold-500/50 bg-forest-900">
                <HempLeaf className="size-4 text-gold-400" />
              </span>
              <span className="font-display text-xl font-semibold tracking-wide">{STORE_NAME}</span>
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onClose()
                  openCart()
                }}
                aria-label={t('Cart')}
                className="relative grid size-10 place-items-center rounded-full glass-card"
              >
                <ShoppingBag className="size-4" />
                {cart > 0 && <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-forest-950">{cart}</span>}
              </button>
              <motion.button whileTap={{ scale: 0.9, rotate: 90 }} onClick={onClose} aria-label={t('Close menu')} className="grid size-10 place-items-center rounded-full glass-card">
                <X className="size-5" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={container} initial="hidden" animate="show" exit="exit" className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-2">
            <motion.button variants={item} onClick={onSearch} className="glass-card flex h-12 w-full items-center gap-3 rounded-full px-4 text-left text-sm text-forest-300">
              <Search className="size-4 text-forest-200" />
              {t('Search: strain, effect, aroma…')}
            </motion.button>

            <motion.div variants={item} className="mt-3 flex items-center justify-between">
              <span className="text-xs text-forest-300">{t('Language & currency')}</span>
              <LanguageSwitcher compact />
            </motion.div>

            <motion.button variants={item} onClick={onQuiz} whileTap={{ scale: 0.98 }} className="border-glow-dark relative mt-4 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-forest-800/90 via-forest-900/90 to-forest-950 p-5 text-left shadow-glow">
              <div className="pointer-events-none absolute -right-8 -top-10 size-44 rounded-full bg-gold-500/25 blur-3xl" />
              <HempLeaf className="pointer-events-none absolute -right-4 -bottom-6 size-32 rotate-12 text-forest-100/[0.06]" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest-950">
                <Compass className="size-3" /> {t('30 seconds')}
              </span>
              <div className="mt-3 font-display text-2xl font-semibold leading-tight">{t('Find the product for your goal')}</div>
              <div className="mt-1 text-sm text-forest-200">{t('Sleep, focus or recovery: three questions, three best matches')}</div>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-300">
                {t('Start the quiz')} <ArrowRight className="size-4" />
              </span>
            </motion.button>

            <motion.div variants={item} className="mt-6 flex items-center justify-between">
              <span className="eyebrow">{t('Categories')}</span>
              <Link to={ROUTES.catalog} onClick={onClose} className="text-xs font-semibold text-forest-200">{t('All')} →</Link>
            </motion.div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {CATEGORIES.map((c) => (
                <motion.div key={c.id} variants={item}>
                  <Link to={`${ROUTES.catalog}?category=${c.id}`} onClick={onClose} className="glass-card relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl px-2 py-3.5 text-center text-xs font-semibold text-forest-100 transition-transform active:scale-95">
                    <span className={cn('pointer-events-none absolute -top-6 left-1/2 size-16 -translate-x-1/2 rounded-full bg-gradient-to-b to-transparent blur-xl', c.hue)} />
                    <span className="relative grid size-10 place-items-center rounded-xl bg-white/8 text-forest-50">
                      <c.icon className="size-5" />
                    </span>
                    <span className="relative">{t(CATEGORY_SHORT[c.id])}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div variants={item} className="mt-6">
              <span className="eyebrow">{t('Navigation')}</span>
            </motion.div>
            <ul className="mt-2 divide-y divide-white/8 overflow-hidden rounded-2xl glass-card">
              {links.map((l) => (
                <motion.li key={l.label} variants={item}>
                  <Link to={l.to} onClick={onClose} className="flex items-center gap-3 px-4 py-3.5 transition-colors active:bg-white/10">
                    <span className={cn('grid size-9 place-items-center rounded-xl', l.accent ? 'bg-gold-500/20 text-gold-300' : 'bg-white/8 text-forest-100')}>
                      <l.icon className="size-4" />
                    </span>
                    <span className={cn('flex-1 font-semibold', l.accent && 'text-gold-300')}>{t(l.label)}</span>
                    {l.badge ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-forest-50">{l.badge}</span> : null}
                    <ChevronRight className="size-4 text-forest-400" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div variants={item} className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-gold-500/50 bg-gold-500/10 px-4 py-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.12em] text-gold-300">{t('First order −10%')}</div>
                <div className="font-mono text-lg font-bold tracking-[0.2em] text-forest-50">WELCOME10</div>
              </div>
              <Link to={ROUTES.catalog} onClick={onClose} className="rounded-full bg-gold-500 px-4 py-2 text-xs font-bold text-forest-950">
                {t('Shop now')}
              </Link>
            </motion.div>

            <motion.ul variants={item} className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-forest-200">
              {[
                { icon: Truck, text: t('Free from {amount}', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) }) },
                { icon: FlaskConical, text: t('COA certificate') },
                { icon: ShieldCheck, text: `THC < ${THC_LIMIT_PERCENT}%` },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 px-2 py-3">
                  <Icon className="size-4 text-gold-400" />
                  {text}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={item} className="mt-6 flex items-center justify-between">
              <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-forest-100">
                <span className="grid size-9 place-items-center rounded-full bg-white/8"><Phone className="size-4" /></span>
                <span>
                  {SUPPORT_PHONE}
                  <span className="block text-xs font-normal text-forest-300">{t('Mon–Fri 9:00–18:00 CET')}</span>
                </span>
              </a>
              <div className="flex gap-1.5">
                {[Instagram, Send, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social" className="grid size-9 place-items-center rounded-full bg-white/8 text-forest-200 active:bg-white/15">
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
