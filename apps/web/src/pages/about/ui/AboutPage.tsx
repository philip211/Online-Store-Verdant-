import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { useDocumentMeta } from '@/shared/lib'
import { Button, Reveal, SectionHeading } from '@/shared/ui'
import { Benefits } from '@/widgets/benefits'
import { Faq } from '@/widgets/faq'
import { LabTrust } from '@/widgets/lab-trust'

export default function AboutPage() {
  const { t } = useT()
  useDocumentMeta({ title: t('About us') })
  const timeline = [
    { year: '2021', title: t('The first farm'), text: t('A contract with a family farm in Tuscany. First Harlequin harvest: 40 kg.') },
    { year: '2022', title: t('The lab standard'), text: t('Every batch goes through HPLC analysis at Alpine Analytics AG. Reports are public.') },
    { year: '2024', title: t('Our own formulas'), text: t('Launch of the CBD + CBN oil line and CBD skincare together with a French laboratory.') },
    { year: '2026', title: t('3,200+ customers'), text: t('Subscriptions for your favourites and EU-wide delivery in 2–4 days from our Berlin warehouse.') },
  ]

  return (
    <>
      <section className="relative overflow-hidden bg-forest-950 py-24 text-forest-50 noise">
        <img src="/images/about.webp" alt="" decoding="async" className="absolute inset-0 size-full object-cover opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/40" />
        <div className="container-x relative max-w-3xl">
          <p className="eyebrow text-gold-400"><span className="h-px w-8 bg-gold-500" /> {t('About us')}</p>
          <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1] sm:text-6xl">
            {t('We make CBD')} <em className="text-gradient-gold italic">{t('clear')}</em> {t('and honest')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-forest-100">
            {t('Verdant started with a simple question: why is it so hard to find a CBD product you can trust? We visited farms across Italy and Switzerland, chose three whose standards convinced us, and built a shop around transparency: lab reports, honest dosing and support that answers within a business day.')}
          </p>
        </div>
      </section>

      <section className="container-x py-24">
        <SectionHeading eyebrow={t('Our story')} title={t('From the first harvest to your door')} />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {timeline.map((item, i) => (
            <Reveal key={item.year} delay={i * 0.08} className="border-glow rounded-3xl border border-white/10 glass-card p-7">
              <div className="font-display text-5xl font-semibold text-white/15">{item.year}</div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-forest-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-200">{item.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <Benefits />
      <LabTrust />

      <section className="container-x py-12">
        <Reveal className="border-glow rounded-[2.5rem] bg-white/10 leaf-pattern p-10 text-center sm:p-14">
          <h2 className="text-balance text-4xl font-semibold text-forest-50 sm:text-5xl">{t('Ready to try?')}</h2>
          <p className="mx-auto mt-3 max-w-md text-forest-200">{t('Start with the 5% oil or use the dose calculator on the home page.')}</p>
          <Link to={ROUTES.catalog} className="mt-8 inline-block">
            <Button size="lg" shine>{t('Browse the shop')} <ArrowRight className="size-4" /></Button>
          </Link>
        </Reveal>
      </section>

      <Faq />
    </>
  )
}
