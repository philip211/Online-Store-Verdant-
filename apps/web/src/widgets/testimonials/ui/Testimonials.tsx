import { motion } from 'framer-motion'
import { ReviewCard, useTopReviews } from '@/entities/review'
import { useT } from '@/shared/i18n'
import { SectionHeading, Skeleton, Stars, staggerContainer, staggerItem } from '@/shared/ui'

export function Testimonials() {
  const { t } = useT()
  const { data, isLoading } = useTopReviews()
  return (
    <section className="container-x py-24">
      <SectionHeading
        eyebrow={t('Reviews')}
        title={t('What our customers say')}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Stars value={4.9} size={16} /> <strong>4.9 / 5</strong> {t('based on 3,214 verified purchases')}
          </span>
        }
      />
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-3xl" />)
          : data?.map((r) => (
              <motion.div key={r.id} variants={staggerItem} className="h-full">
                <ReviewCard review={r} compact />
              </motion.div>
            ))}
      </motion.div>
    </section>
  )
}
