import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Compass, FlaskConical, ShieldCheck, Star, Truck } from 'lucide-react'
import { ProductVisual, useCatalog, useProductById } from '@/entities/product'
import { useQuiz } from '@/features/product-quiz'
import { ROUTES, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice } from '@/shared/lib'
import { Button, WaveDivider } from '@/shared/ui'

export function Hero() {
  const { t, tn } = useT()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 600], [0, 80])
  const y2 = useTransform(scrollY, [0, 600], [0, -60])
  const openQuiz = useQuiz((s) => s.openQuiz)
  const featured = useProductById('p1')
  const second = useProductById('p5')
  const catalog = useCatalog()
  const reviewCount = catalog.reduce((n, p) => n + p.reviewsCount, 0)
  const avgRating = reviewCount ? catalog.reduce((n, p) => n + p.rating * p.reviewsCount, 0) / reviewCount : 0

  return (
    <section className="relative overflow-hidden bg-forest-950 text-forest-50">
      {/* LCP candidate: eager, high priority. The scrim keeps the headline readable over the foliage. */}
      <img src="/images/hero.webp" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/30" />

      <div className="container-x relative grid items-center gap-8 py-12 pb-24 sm:gap-12 sm:py-16 sm:pb-28 lg:min-h-[calc(100vh-110px)] lg:grid-cols-12 lg:py-20 lg:pb-32">
        <div className="lg:col-span-6">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow text-gold-400">
            <span className="h-px w-8 bg-gold-500" />
            {t('Organic hemp · Italy & Switzerland')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-5 text-balance text-4xl font-semibold leading-[1.02] sm:text-6xl">
            {t('Calm,')} <br />
            {t('grown by')} <span className="text-gradient-gold italic">{t('nature')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-6 max-w-lg text-lg leading-relaxed text-forest-100">
            {t('Premium CBD flowers, full-spectrum oils and skincare. Every batch is tested by an independent lab and the certificate ships in the box.')}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-9 flex flex-wrap items-center gap-3">
            <Link to={ROUTES.catalog}>
              <Button variant="gold" size="lg">
                {t('Shop the collection')} <ArrowRight className="nudge size-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={openQuiz}>
              <Compass className="size-4 text-gold-400" /> {t('Find my match in 30 s')}
            </Button>
          </motion.div>

          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 text-sm sm:mt-12 sm:grid-cols-4">
            {[
              { icon: FlaskConical, tt: t('Lab tested'), d: t('COA certificate') },
              { icon: ShieldCheck, tt: `THC < ${THC_LIMIT_PERCENT}%`, d: t('fully legal in the EU') },
              { icon: Truck, tt: t('2–4 days'), d: t('EU-wide delivery') },
              ...(reviewCount ? [{ icon: Star, tt: `${avgRating.toFixed(1)} / 5`, d: tn(reviewCount, '{count} review', '{count} reviews') }] : []),
            ].map(({ icon: Icon, tt, d }) => (
              <li key={tt} className="flex items-start gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <div>
                  <div className="font-semibold text-forest-50">{tt}</div>
                  <div className="text-xs text-forest-200">{d}</div>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>

        <div className="relative h-[340px] sm:h-[560px] lg:col-span-6 lg:h-[620px]">
          <motion.div style={{ y: y1 }} initial={{ opacity: 0, scale: 0.9, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="border-glow-dark absolute left-0 top-6 w-[62%] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-gold-500/30 sm:left-4">
            <div className="aspect-[4/5] bg-forest-900">{featured && <ProductVisual product={featured} variant="hero" />}</div>
            {featured && (
              <div className="absolute bottom-4 left-4 right-4 glass-dark rounded-2xl p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-gold-400">{t('Pick of the week')}</div>
                <div className="font-display text-xl font-semibold">{featured.name}</div>
                <div className="text-xs text-forest-200">CBD {featured.cbd}% · {t('from')} {formatPrice(featured.variants[0].price)}</div>
              </div>
            )}
          </motion.div>

          <motion.div style={{ y: y2 }} initial={{ opacity: 0, scale: 0.9, rotate: 8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }} transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="border-glow-dark absolute bottom-0 right-0 w-[52%] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-gold-500/30 sm:right-4">
            <div className="aspect-[4/5] bg-forest-900">{second && <ProductVisual product={second} variant="hero" angle={-6} />}</div>
          </motion.div>

        </div>
      </div>
      <WaveDivider />
    </section>
  )
}
