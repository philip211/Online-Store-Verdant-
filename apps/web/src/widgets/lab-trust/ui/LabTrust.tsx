import { Link } from 'react-router-dom'
import { ArrowRight, FileCheck2, Microscope, QrCode } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { Button, Reveal, SectionHeading } from '@/shared/ui'

export function LabTrust() {
  const { t } = useT()
  const rows = [
    { name: 'CBD', value: '18.4%' },
    { name: 'THC', value: '0.18%' },
    { name: 'CBG', value: '0.6%' },
    { name: t('Pesticides'), value: t('not detected') },
    { name: t('Heavy metals'), value: t('not detected') },
    { name: t('Microbiology'), value: t('within limits') },
  ]
  return (
    <section className="container-x py-24">
      <div className="grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={t('Transparency')} title={t('A certificate of analysis for every batch')} description={t('Samples go to an independent accredited laboratory. The COA (Certificate of Analysis) is available via the QR code on the pack and on this site.')} />
          <ul className="mt-8 space-y-4 text-sm text-forest-100">
            {[
              { icon: Microscope, text: t('HPLC chromatography for an exact cannabinoid profile') },
              { icon: FileCheck2, text: t('Screened for pesticides, heavy metals and mycotoxins') },
              { icon: QrCode, text: t('A QR code on every pack links to the batch report') },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-forest-200">
                  <Icon className="size-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
          <Link to={ROUTES.lab} className="mt-8 inline-block">
            <Button variant="primary">
              {t('View lab reports')} <ArrowRight className="nudge size-4" />
            </Button>
          </Link>
        </div>

        <Reveal delay={0.15} className="lg:col-span-7">
          <img
            src="/images/lab.webp"
            alt={t('Pipetting a sample in an analytical laboratory')}
            loading="lazy"
            decoding="async"
            width={1000}
            height={668}
            className="aspect-[3/2] w-full rounded-3xl object-cover ring-1 ring-white/10"
          />
          <div className="relative mx-auto -mt-24 max-w-xl rounded-3xl border border-white/15 bg-forest-950/90 p-6 shadow-card backdrop-blur sm:-mt-32 sm:p-8">
            <div className="absolute -right-3 -top-3 rounded-full bg-forest-300 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-forest-950 shadow-soft">{t('Batch')} HQ-2609</div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-forest-300">Certificate of Analysis</div>
                <div className="font-display text-2xl font-semibold text-forest-50">Harlequin Premium</div>
              </div>
              <div className="grid size-14 place-items-center rounded-xl bg-forest-950 text-gold-400">
                <QrCode className="size-8" />
              </div>
            </div>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-white/10 last:border-0">
                    <td className="py-2.5 text-forest-300">{r.name}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-forest-50">{r.value}</td>
                    <td className="w-16 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-forest-100">PASS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between text-xs text-forest-400">
              <span>{t('Tested')}: 02.09.2026</span>
              <span>{t('Lab')}: Alpine Analytics AG</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
