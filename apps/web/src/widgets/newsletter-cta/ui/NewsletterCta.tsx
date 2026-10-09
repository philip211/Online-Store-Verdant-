import { Gift } from 'lucide-react'
import { NewsletterForm } from '@/features/newsletter'
import { useT } from '@/shared/i18n'
import { HempLeaf, Reveal } from '@/shared/ui'

export function NewsletterCta() {
  const { t } = useT()
  return (
    <section className="container-x py-12">
      <Reveal className="border-glow relative overflow-hidden rounded-[2.5rem] bg-white/10 leaf-pattern p-8 sm:p-14">
        <HempLeaf className="pointer-events-none absolute -right-10 -top-10 size-64 text-forest-300/[0.08]" />
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-forest-950">
              <Gift className="size-3.5" /> {t('Subscriber gift')}
            </span>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-tight text-forest-50 sm:text-5xl">{t('10% off your first order plus our dosing guide')}</h2>
            <p className="mt-3 max-w-md text-forest-200">{t('Every two weeks: new strains, lab results and private sales for subscribers.')}</p>
          </div>
          <NewsletterForm tone="light" />
        </div>
      </Reveal>
    </section>
  )
}
