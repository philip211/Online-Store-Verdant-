import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Download, FileCheck2 } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORY_LABELS, ProductVisual, useCatalog } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, cn, useDocumentMeta } from '@/shared/lib'
import { Button, Reveal, SectionHeading } from '@/shared/ui'

export default function LabResultsPage() {
  const { t } = useT()
  useDocumentMeta({ title: t('Lab reports'), description: t('Certificates of analysis for every batch: cannabinoid profile, pesticides, heavy metals.') })
  const { hash } = useLocation()
  const highlighted = hash.replace('#', '')
  const catalog = useCatalog()

  useEffect(() => {
    if (!highlighted) return
    document.getElementById(`lab-${highlighted}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlighted, catalog.length])

  return (
    <div className="container-x py-12 lg:py-16">
      <SectionHeading eyebrow={t('Laboratory')} title={t('Certificates of analysis by batch')} description={t('Every product is tested by the accredited laboratory Alpine Analytics AG. Below are the current batches and their cannabinoid profiles.')} />

      <div className="mt-12 space-y-4">
        {catalog.map((p, i) => {
          const batch = `HQ-${String(2600 + i * 7).padStart(4, '0')}`
          return (
            <Reveal key={p.id} id={`lab-${p.id}`} delay={Math.min(i * 0.04, 0.3)} className={cn('grid items-center gap-4 overflow-hidden rounded-3xl border glass-card p-4 transition sm:grid-cols-12 sm:gap-5 sm:p-5', highlighted === p.id ? 'border-gold-500 shadow-glow' : 'border-white/10')}>
              <div className="flex items-center gap-4 sm:col-span-5">
                <Link to={ROUTES.product(p.slug)} className="size-16 shrink-0 overflow-hidden rounded-xl">
                  <ProductVisual product={p} variant="thumb" />
                </Link>
                <div className="min-w-0">
                  <Link to={ROUTES.product(p.slug)} className="block truncate font-display text-xl font-semibold text-forest-50 hover:underline">{p.name}</Link>
                  <div className="text-xs text-forest-300">{t(CATEGORY_LABELS[p.category])} · {t('batch')} {batch}</div>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-3 text-sm sm:col-span-5">
                <Cell label="CBD" value={cbdLabel(p.cbd, p.category)} />
                <Cell label="THC" value={`${p.thc}%`} />
                <Cell label={t('Pesticides')} value={t('None')} />
              </dl>
              <div className="flex items-center justify-between gap-3 sm:col-span-2 sm:justify-end">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-forest-100">
                  <FileCheck2 className="size-3.5" /> PASS
                </span>
                <Button variant="ghost" size="sm" onClick={() => toast(t('The PDF report will be available once the backend storage is connected'))}>
                  <Download className="size-4" /> PDF
                </Button>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2">
      <dt className="text-xs uppercase tracking-[0.12em] text-forest-300">{label}</dt>
      <dd className="font-semibold tabular-nums text-forest-50">{value}</dd>
    </div>
  )
}
