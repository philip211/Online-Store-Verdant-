import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LifeBuoy, Search, TrendingUp } from 'lucide-react'
import { applyFilters, CATEGORY_LABELS, getMinPrice, ProductVisual, useCatalog } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, formatPrice, useDebounce } from '@/shared/lib'
import { Modal } from '@/shared/ui'
import { HELP_LINKS, matchHelp, suggestByTypo, type HelpLink } from '../model/help'

const POPULAR = ['Harlequin', 'oil 10%', 'sleep', 'gummies', 'balm']

export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT()
  const [q, setQ] = useState('')
  const debounced = useDebounce(q, 180)
  const navigate = useNavigate()
  const catalog = useCatalog()
  const results = useMemo(() => (debounced ? applyFilters(catalog, { search: debounced }).slice(0, 6) : []), [catalog, debounced])
  const help = useMemo(() => (debounced ? matchHelp(debounced) : []), [debounced])
  const typo = useMemo(() => (debounced && results.length === 0 ? suggestByTypo(catalog, debounced) : []), [catalog, debounced, results.length])

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const helpItem = (h: HelpLink) => {
    const cls = 'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm text-forest-100 transition hover:bg-white/10'
    const body = (
      <>
        <LifeBuoy className="size-4 shrink-0 text-gold-400" />
        <span className="flex-1">{t(h.label)}</span>
        <ArrowRight className="size-4 text-forest-400" />
      </>
    )
    return (
      <li key={h.to}>
        {h.external ? (
          <a href={h.to} className={cls}>{body}</a>
        ) : (
          <button onClick={() => go(h.to)} className={cls}>{body}</button>
        )}
      </li>
    )
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="flex items-center gap-3 border-b border-white/10 py-4 pl-6 pr-16">
        <Search className="size-5 text-forest-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim()) go(`${ROUTES.catalog}?q=${encodeURIComponent(q.trim())}`)
          }}
          placeholder={t('Search: strain, effect, aroma…')}
          className="h-10 flex-1 bg-transparent text-lg text-forest-50 placeholder:text-forest-400 focus:outline-none"
        />
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-4">
        {!debounced && (
          <div>
            <p className="eyebrow mb-3 px-2">
              <TrendingUp className="size-3.5" /> {t('Popular searches')}
            </p>
            <div className="flex flex-wrap gap-2 px-2">
              {POPULAR.map((p) => (
                <button key={p} onClick={() => setQ(t(p))} className="rounded-full border border-white/15 glass-card px-3 py-1.5 text-sm text-forest-100 transition hover:border-forest-300/60">
                  {t(p)}
                </button>
              ))}
            </div>
            <p className="eyebrow mb-2 mt-6 px-2">
              <LifeBuoy className="size-3.5" /> {t('Help')}
            </p>
            <ul>{HELP_LINKS.map(helpItem)}</ul>
          </div>
        )}

        {help.length > 0 && <ul className="mb-3 border-b border-white/10 pb-3">{help.map(helpItem)}</ul>}

        {debounced && results.length === 0 && help.length === 0 && typo.length === 0 && (
          <p className="px-2 py-8 text-center text-forest-300">{t('Nothing found for “{query}”', { query: debounced })}</p>
        )}

        {typo.length > 0 && (
          <div className="px-2 py-2">
            <p className="text-sm text-forest-300">{t('Nothing found for “{query}”', { query: debounced })}. {t('Did you mean:')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {typo.map((p) => (
                <button key={p.id} onClick={() => go(ROUTES.product(p.slug))} className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-forest-50 transition hover:border-forest-300/60">
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <ul className="space-y-1">
            {results.map((p) => (
              <li key={p.id}>
                <button onClick={() => go(ROUTES.product(p.slug))} className="group flex w-full items-center gap-4 rounded-2xl p-2 text-left transition hover:bg-white/10">
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl">
                    <ProductVisual product={p} variant="thumb" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-forest-50">{p.name}</div>
                    <div className="text-xs text-forest-300">
                      {t(CATEGORY_LABELS[p.category])} · CBD {cbdLabel(p.cbd, p.category)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums text-forest-100">{t('from')} {formatPrice(getMinPrice(p))}</div>
                  <ArrowRight className="size-4 text-forest-400 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </button>
              </li>
            ))}
            <li className="pt-2">
              <button onClick={() => go(`${ROUTES.catalog}?q=${encodeURIComponent(debounced)}`)} className="w-full rounded-xl py-2 text-center text-sm font-semibold text-forest-300 hover:underline">
                {t('Show all results')}
              </button>
            </li>
          </ul>
        )}
      </div>
    </Modal>
  )
}
