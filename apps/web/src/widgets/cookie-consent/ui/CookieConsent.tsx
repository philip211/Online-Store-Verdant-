import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, Settings2 } from 'lucide-react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

export interface ConsentState {
  decided: boolean
  analytics: boolean
  marketing: boolean
  decidedAt: number | null
  save: (c: { analytics: boolean; marketing: boolean }) => void
  reset: () => void
}

/** GDPR / ePrivacy consent. Nothing non-essential runs until the visitor decides. */
export const useConsent = create<ConsentState>()(
  persist(
    (set) => ({
      decided: false,
      analytics: false,
      marketing: false,
      decidedAt: null,
      save: (c) => set({ ...c, decided: true, decidedAt: Date.now() }),
      reset: () => set({ decided: false, analytics: false, marketing: false, decidedAt: null }),
    }),
    { name: 'verdant:consent' },
  ),
)

export function CookieConsent() {
  const { t } = useT()
  const decided = useConsent((s) => s.decided)
  const save = useConsent((s) => s.save)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  return (
    <AnimatePresence>
      {!decided && (
        <motion.div
          key="consent"
          role="dialog"
          aria-live="polite"
          aria-label={t('Cookie settings')}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="fixed inset-x-3 bottom-[92px] z-[70] mx-auto max-w-2xl lg:bottom-6 lg:left-6 lg:right-auto lg:mx-0"
        >
          <div className="border-glow-dark glass-card rounded-3xl p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/20 text-gold-300">
                <Cookie className="size-5" />
              </span>
              <div className="min-w-0 flex-1 text-sm text-forest-100">
                <div className="font-display text-xl font-semibold text-forest-50">{t('We value your privacy')}</div>
                <p className="mt-1 text-forest-200">
                  {t('We use essential cookies to run the shop and, with your consent, analytics and marketing cookies to improve it. You can change your choice anytime.')}{' '}
                  <Link to={ROUTES.legal('privacy')} className="link-underline text-forest-50">{t('Privacy policy')}</Link>
                </p>
              </div>
            </div>

            {custom && (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Toggle label={t('Essential')} note={t('Always on')} checked disabled />
                <Toggle label={t('Analytics')} note={t('Usage statistics')} checked={analytics} onChange={setAnalytics} />
                <Toggle label={t('Marketing')} note={t('Personalised offers')} checked={marketing} onChange={setMarketing} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => save({ analytics: true, marketing: true })}>{t('Accept all')}</Button>
              <Button size="sm" variant="outline" onClick={() => save({ analytics: false, marketing: false })}>{t('Essential only')}</Button>
              {custom ? (
                <Button size="sm" variant="ghost" onClick={() => save({ analytics, marketing })}>{t('Save selection')}</Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setCustom(true)}>
                  <Settings2 className="size-3.5" /> {t('Customise')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toggle({ label, note, checked, disabled, onChange }: { label: string; note: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5', disabled && 'cursor-default opacity-70')}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} className="size-4 rounded accent-forest-300" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-forest-50">{label}</span>
        <span className="block text-xs text-forest-300">{note}</span>
      </span>
    </label>
  )
}
