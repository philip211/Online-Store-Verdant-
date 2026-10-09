import { motion } from 'framer-motion'
import { useT } from '@/shared/i18n'
import { SectionHeading, Sprig, staggerContainer, staggerItem } from '@/shared/ui'

export function HowItWorks() {
  const { t } = useT()
  const steps = [
    { n: '01', title: t('Pick your goal'), text: t('Sleep, focus, recovery or balance. Effect filters narrow the choice down to two or three products.') },
    { n: '02', title: t('Find your dose'), text: t('The calculator accounts for weight, experience and goal. Start low and go slow.') },
    { n: '03', title: t('Receive it in 2–4 days'), text: t('Discreet box, certificate inside, tracking number as soon as it ships.') },
    { n: '04', title: t('Save with a subscription'), text: t('Your favourites arrive every 30 days at 15% off. Cancel in one click.') },
  ]
  return (
    <section className="container-x py-24">
      <SectionHeading align="center" eyebrow={t('How it works')} title={t('Four steps to your ritual')} />
      <motion.ol variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.li key={s.n} variants={staggerItem} className="border-glow relative rounded-3xl border border-white/10 glass-card p-7">
            {i < steps.length - 1 && <span className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 bg-gold-500/60 lg:block" />}
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-semibold text-white/15">{s.n}</span>
              <Sprig className="size-6 text-gold-400" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold text-forest-50">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-forest-200">{s.text}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}
