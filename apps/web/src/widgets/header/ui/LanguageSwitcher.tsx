import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Globe } from 'lucide-react'
import { LOCALES } from '@verdant/shared'
import { LOCALE_META, useLocaleStore } from '@/shared/i18n'
import { cn } from '@/shared/lib'

export function LanguageSwitcher({ className, compact }: { className?: string; compact?: boolean }) {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  if (compact) {
    return (
      <div className={cn('flex gap-1', className)} role="group" aria-label="Language">
        {LOCALES.map((l) => (
          <button
            key={l}
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={cn('rounded-full px-3 py-1.5 text-xs font-bold transition', locale === l ? 'bg-forest-300 text-forest-950' : 'glass-card text-forest-200')}
          >
            {LOCALE_META[l].short}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold text-forest-200 transition hover:border-gold-500/40 hover:text-forest-50 sm:h-11"
      >
        <Globe className="size-4" />
        {LOCALE_META[locale].short}
        <span className="text-forest-400">· €</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="glass-card absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl p-1 shadow-2xl"
          >
            {LOCALES.map((l) => (
              <li key={l}>
                <button
                  role="option"
                  aria-selected={locale === l}
                  onClick={() => {
                    setLocale(l)
                    setOpen(false)
                  }}
                  className={cn('flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10', locale === l ? 'text-forest-50' : 'text-forest-200')}
                >
                  <span className="text-base">{LOCALE_META[l].flag}</span>
                  <span className="flex-1">{LOCALE_META[l].label}</span>
                  {locale === l && <Check className="size-4 text-forest-300" />}
                </button>
              </li>
            ))}
            <li className="border-t border-white/10 px-3 py-2 text-xs text-forest-400">EUR · prices incl. VAT</li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
