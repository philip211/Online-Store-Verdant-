import { useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LOCALES, type Locale } from '@verdant/shared'

export type { Locale }

type Dictionary = Record<string, string>

/**
 * English strings are the keys; other languages map them 1:1. Missing entries fall back to English.
 * Dictionaries are code-split and loaded on demand (each is ~50 KB of source), so an English visitor
 * never downloads them and a German/French visitor downloads only their own.
 */
const loaded: Partial<Record<Locale, Dictionary>> = { en: {} }
const loaders: Record<Exclude<Locale, 'en'>, () => Promise<Dictionary>> = {
  de: () => import('./locales/de').then((m) => m.de),
  fr: () => import('./locales/fr').then((m) => m.fr),
}

/** Resolves once the dictionary for `locale` is in memory. Safe to call repeatedly. */
export async function ensureDictionary(locale: Locale): Promise<void> {
  if (loaded[locale]) return
  loaded[locale] = await loaders[locale as Exclude<Locale, 'en'>]()
}

export const LOCALE_META: Record<Locale, { label: string; short: string; intl: string; flag: string }> = {
  en: { label: 'English', short: 'EN', intl: 'en-IE', flag: '🇪🇺' },
  de: { label: 'Deutsch', short: 'DE', intl: 'de-DE', flag: '🇩🇪' },
  fr: { label: 'Français', short: 'FR', intl: 'fr-FR', flag: '🇫🇷' },
}

const detect = (): Locale => {
  if (typeof navigator === 'undefined') return 'en'
  const code = navigator.language.slice(0, 2).toLowerCase()
  return (LOCALES as string[]).includes(code) ? (code as Locale) : 'en'
}

interface LocaleState {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: detect(),
      // switch only after the dictionary is in memory, so the UI never flashes English keys
      setLocale: (locale) => {
        void ensureDictionary(locale).then(() => set({ locale }))
      },
    }),
    { name: 'verdant:locale' },
  ),
)

export const getLocale = () => useLocaleStore.getState().locale
export const getIntlLocale = () => LOCALE_META[getLocale()].intl

type Vars = Record<string, string | number>

export function translate(locale: Locale, key: string, vars?: Vars): string {
  let out = loaded[locale]?.[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  }
  return out
}

/** Pick singular/plural English key by count, then translate. */
export function translatePlural(locale: Locale, count: number, one: string, other: string, vars?: Vars) {
  return translate(locale, count === 1 ? one : other, { count, ...vars })
}

export function useLocale() {
  return useLocaleStore((s) => s.locale)
}

export function useT() {
  const locale = useLocale()
  const t = useCallback((key: string, vars?: Vars) => translate(locale, key, vars), [locale])
  const tn = useCallback((count: number, one: string, other: string, vars?: Vars) => translatePlural(locale, count, one, other, vars), [locale])
  return { t, tn, locale, intl: LOCALE_META[locale].intl }
}

/** Non-hook translator for code outside components (toasts, stores). */
export const t = (key: string, vars?: Vars) => translate(getLocale(), key, vars)
