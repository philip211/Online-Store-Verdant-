import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useFeaturedProducts, useNewArrivals } from '@/entities/product'
import { DoseCalculator } from '@/features/dose-calculator'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { useDocumentMeta } from '@/shared/lib'
import { Button, Reveal, SectionDivider, SectionHeading } from '@/shared/ui'
import { Benefits } from '@/widgets/benefits'
import { CategoryChips } from '@/widgets/category-chips'
import { CategoryShowcase } from '@/widgets/category-showcase'
import { Faq } from '@/widgets/faq'
import { Hero } from '@/widgets/hero'
import { HowItWorks } from '@/widgets/how-it-works'
import { LabTrust } from '@/widgets/lab-trust'
import { NewsletterCta } from '@/widgets/newsletter-cta'
import { ProductGrid } from '@/widgets/product-grid'
import { PromoBanner } from '@/widgets/promo-banner'
import { RecentlyViewed } from '@/widgets/recently-viewed'
import { Testimonials } from '@/widgets/testimonials'

export default function HomePage() {
  const { t } = useT()
  useDocumentMeta({ description: t('Premium CBD flowers, full-spectrum oils and skincare with lab certificates. EU-wide delivery in 2–4 days.') })
  const featured = useFeaturedProducts()
  const fresh = useNewArrivals()

  return (
    <>
      <Hero />

      <div className="container-x pt-10">
        <CategoryChips />
      </div>

      <section className="container-x py-16">
        <SectionHeading
          eyebrow={t('Bestsellers')}
          title={t('What people order again and again')}
          description={t('The four products with the highest repeat-purchase rate over the last 90 days.')}
          action={
            <Link to={`${ROUTES.catalog}?badge=hit`}>
              <Button variant="outline">
                {t('All bestsellers')} <ArrowRight className="nudge size-4" />
              </Button>
            </Link>
          }
        />
        <ProductGrid products={featured.data} loading={featured.isLoading} skeletons={4} className="mt-10" />
      </section>

      <SectionDivider />
      <CategoryShowcase />
      <PromoBanner />
      <Benefits />

      <section className="container-x py-24">
        <SectionHeading
          eyebrow={t('New arrivals')}
          title={t('Fresh harvest of the season')}
          description={t('New strains and formulas that just passed lab control.')}
          action={
            <Link to={`${ROUTES.catalog}?sort=new`}>
              <Button variant="outline">
                {t('All new arrivals')} <ArrowRight className="nudge size-4" />
              </Button>
            </Link>
          }
        />
        <ProductGrid products={fresh.data} loading={fresh.isLoading} skeletons={4} className="mt-10" />
      </section>

      <section className="container-x py-12">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t('Personal')} title={t('Not sure where to start?')} description={t('Answer three questions and we suggest a starting dose and a matching product. It takes 20 seconds.')} />
          </div>
          <Reveal delay={0.1} className="lg:col-span-7">
            <DoseCalculator />
          </Reveal>
        </div>
      </section>

      <SectionDivider />
      <HowItWorks />
      <LabTrust />
      <SectionDivider />
      <Testimonials />
      <Faq />
      <NewsletterCta />
      <RecentlyViewed className="py-12" />
    </>
  )
}
