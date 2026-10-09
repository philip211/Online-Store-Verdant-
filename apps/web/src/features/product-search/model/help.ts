import { normalize, type Product } from '@verdant/shared'
import { ROUTES, SUPPORT_EMAIL } from '@/shared/config'

/** Non-product answers: shoppers type "returns" or "where is my order" into search far more often than sites expect. */
export interface HelpLink {
  label: string
  to: string
  external?: boolean
  keywords: string[]
}

export const HELP_LINKS: HelpLink[] = [
  { label: 'Shipping & returns', to: ROUTES.legal('shipping'), keywords: ['return', 'refund', 'withdraw', 'shipping', 'delivery', 'dhl', 'ruckgabe', 'rucksend', 'widerruf', 'versand', 'lieferung', 'retour', 'rembourse', 'retractation', 'livraison', 'expedition'] },
  { label: 'My orders', to: ROUTES.orders, keywords: ['order', 'status', 'track', 'where is', 'bestellung', 'sendungs', 'commande', 'suivi'] },
  { label: 'Lab results', to: ROUTES.lab, keywords: ['lab', 'coa', 'certificate', 'test', 'thc', 'labor', 'zertifikat', 'analyse', 'certificat', 'laboratoire'] },
  { label: 'Privacy policy', to: ROUTES.legal('privacy'), keywords: ['privacy', 'data', 'gdpr', 'cookie', 'datenschutz', 'dsgvo', 'donnees', 'confidentialite', 'rgpd'] },
  { label: 'Contact us', to: `mailto:${SUPPORT_EMAIL}`, external: true, keywords: ['contact', 'help', 'support', 'email', 'phone', 'kontakt', 'hilfe', 'aide', 'telephone'] },
]

export function matchHelp(query: string): HelpLink[] {
  const q = normalize(query)
  if (q.length < 3) return []
  return HELP_LINKS.filter((h) => h.keywords.some((k) => k.includes(q) || q.includes(k)))
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

/** Typo tolerance for the "nothing found" case: products whose name or a word in it is within 1–2 edits of the query. */
export function suggestByTypo(catalog: Product[], query: string, limit = 3): Product[] {
  const q = normalize(query)
  if (q.length < 4) return []
  const max = q.length >= 7 ? 2 : 1
  return catalog
    .map((p) => {
      const name = normalize(p.name)
      const words = [name, ...name.split(/\s+/), ...(p.strain ? [normalize(p.strain)] : [])]
      return { p, d: Math.min(...words.map((w) => distance(q, w))) }
    })
    .filter((x) => x.d <= max)
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.p)
}
