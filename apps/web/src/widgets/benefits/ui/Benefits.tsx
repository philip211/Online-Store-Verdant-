import { motion } from 'framer-motion'
import { FlaskConical, Leaf, PackageCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice } from '@/shared/lib'
import { AnimatedNumber, LeafField, SectionHeading, staggerContainer, staggerItem } from '@/shared/ui'

export function Benefits() {
  const { t } = useT()
  const items = [
    { icon: FlaskConical, title: t('Independent lab testing'), text: t('Every batch is tested for cannabinoids, pesticides and heavy metals. Report via QR code.') },
    { icon: Leaf, title: t('Organic cultivation'), text: t('No pesticides or synthetic fertilisers. EU Organic certified farms in Tuscany and Ticino.') },
    { icon: ShieldCheck, title: `THC < ${THC_LIMIT_PERCENT}%`, text: t('Fully compliant industrial hemp products. No psychoactive effect.') },
    { icon: Truck, title: t('EU delivery in 2–4 days'), text: t('DHL, DPD or pickup point. Free from {amount}. Same-day dispatch before 15:00.', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) }) },
    { icon: PackageCheck, title: t('Discreet packaging'), text: t('Neutral box without any mention of the contents. Airtight bags with humidity packs.') },
    { icon: RotateCcw, title: t('14-day right of withdrawal'), text: t('Changed your mind? Return unopened products within 14 days as EU consumer law provides.') },
  ]
  const stats = [
    { value: 3200, suffix: '+', label: t('happy customers') },
    { value: 98, suffix: '%', label: t('repeat orders') },
    { value: 47, suffix: '', label: t('strains and products') },
    { value: 4.9, suffix: '', label: t('average rating'), decimals: true },
  ]

  return (
    <section className="relative overflow-hidden bg-forest-950 py-24 text-forest-50">
      <LeafField rays={false} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="container-x relative">
        <SectionHeading tone="dark" align="center" eyebrow={t('Why Verdant')} title={t('A quality standard you can verify')} description={t('We do not ask you to take our word for it: every claim is backed by documents that ship with your order.')} />

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={staggerItem} className="border-glow-dark group rounded-3xl border border-white/5 bg-forest-900/50 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/40 hover:bg-forest-900">
              <span className="grid size-12 place-items-center rounded-2xl bg-forest-300/15 text-gold-300 transition-colors duration-500 group-hover:bg-gold-500 group-hover:text-forest-950">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-200">{text}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-6 border-t border-white/10 pt-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-5xl font-semibold text-gradient-gold">{s.decimals ? '4.9' : <AnimatedNumber value={s.value} suffix={s.suffix} />}</div>
              <div className="mt-1 text-sm text-forest-200">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
