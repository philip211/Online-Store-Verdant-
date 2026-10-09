import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CATEGORIES, CategoryCard } from '@/entities/category'
import { useCatalog } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { Button, SectionHeading, staggerContainer } from '@/shared/ui'

export function CategoryShowcase() {
  const { t } = useT()
  const catalog = useCatalog()
  return (
    <section className="container-x py-24">
      <SectionHeading
        eyebrow={t('Categories')}
        title={
          <>
            {t('Find your')} <em className="font-normal italic text-forest-300">{t('ritual')}</em>
          </>
        }
        description={t('From morning focus to deep sleep: six categories built around what you need, not around the stock list.')}
        action={
          <Link to={ROUTES.catalog}>
            <Button variant="outline">
              {t('Full catalogue')} <ArrowRight className="nudge size-4" />
            </Button>
          </Link>
        }
      />
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c, i) => (
          <CategoryCard key={c.id} category={c} count={catalog.length ? catalog.filter((p) => p.category === c.id).length : undefined} className={i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : ''} />
        ))}
      </motion.div>
    </section>
  )
}
