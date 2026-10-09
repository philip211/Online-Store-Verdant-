import type { FastifyRequest } from 'fastify'
import { LOCALES, type Locale } from '@verdant/shared'

/** Locale from `?lang=` first, then the Accept-Language header, defaulting to English. */
export function localeFrom(req: FastifyRequest): Locale {
  const q = (req.query as Record<string, unknown> | undefined)?.lang
  if (typeof q === 'string' && (LOCALES as string[]).includes(q)) return q as Locale
  const header = req.headers['accept-language'] ?? ''
  for (const part of header.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase()
    if ((LOCALES as string[]).includes(code)) return code as Locale
  }
  return 'en'
}
