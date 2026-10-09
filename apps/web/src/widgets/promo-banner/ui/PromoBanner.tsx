import { Link } from 'react-router-dom'
import { ArrowRight, FileCheck2 } from 'lucide-react'
import { getMinPrice, ProductVisual, useProductById } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, formatPrice } from '@/shared/lib'
import { Button, Reveal } from '@/shared/ui'

/** Editorial spotlight on one product: real product data only, no countdown or invented urgency. */
export function PromoBanner() {
  const { t } = useT()
  const pick = useProductById('p4')

  if (!pick) return null

  return (
    <section className="container-x py-24">
      <Reveal className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6 lg:order-2">
          <Link to={ROUTES.product(pick.slug)} className="group block overflow-hidden rounded-[2rem] ring-1 ring-white/10">
            <div className="aspect-[4/5] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.02]">
              <ProductVisual product={pick} variant="hero" />
            </div>
          </Link>
        </div>
        <div className="lg:col-span-6 lg:order-1">
          <p className="eyebrow text-gold-400">
            <span className="h-px w-8 bg-gold-500" />
            {t('In focus')}
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight text-forest-50 sm:text-5xl">{pick.name}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest-100">{pick.shortDescription}</p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-y border-white/10 py-5 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-forest-300">CBD</dt>
              <dd className="mt-1 font-semibold text-forest-50">{cbdLabel(pick.cbd, pick.category)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-forest-300">THC</dt>
              <dd className="mt-1 font-semibold text-forest-50">{pick.thc}%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-forest-300">{t('from')}</dt>
              <dd className="mt-1 font-semibold tabular-nums text-forest-50">{formatPrice(getMinPrice(pick))}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link to={ROUTES.product(pick.slug)}>
              <Button size="lg">
                {pick.name} <ArrowRight className="nudge size-4" />
              </Button>
            </Link>
            <a href={pick.labReportUrl} className="inline-flex items-center gap-2 text-sm text-forest-200 underline decoration-white/25 underline-offset-4 hover:text-forest-50">
              <FileCheck2 className="size-4 text-gold-400" /> {t('Batch lab report')}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
