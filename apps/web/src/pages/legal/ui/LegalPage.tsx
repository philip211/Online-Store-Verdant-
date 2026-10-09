import { Link, useParams } from 'react-router-dom'
import { Cookie, FileText, Mail, MapPin, Scale, Shield, Truck } from 'lucide-react'
import { FREE_SHIPPING_THRESHOLD, LEGAL_AGE, ROUTES, STORE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice, useDocumentMeta } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { useConsent } from '@/widgets/cookie-consent'
import { NotFoundPage } from '@/pages/not-found'

type Page = 'privacy' | 'terms' | 'imprint' | 'shipping' | 'cookies'
const PAGES: Page[] = ['privacy', 'terms', 'imprint', 'shipping', 'cookies']

export default function LegalPage() {
  const { t } = useT()
  const { page } = useParams<{ page: Page }>()
  const resetConsent = useConsent((s) => s.reset)
  const consent = useConsent()
  const valid = page && PAGES.includes(page)
  useDocumentMeta({ title: valid ? t(TITLES[page]) : t('Legal') })
  if (!valid) return <NotFoundPage />

  const sections: Record<Page, { icon: typeof Shield; blocks: { h: string; p: string[] }[] }> = {
    privacy: {
      icon: Shield,
      blocks: [
        { h: t('Controller'), p: [t('{store} GmbH, Invalidenstraße 1, 10115 Berlin, Germany. E-mail: {email}. You can reach our data protection officer at the same address.', { store: STORE_NAME, email: SUPPORT_EMAIL })] },
        { h: t('What we process and why'), p: [t('Order data (name, address, e-mail, phone, items) to fulfil the contract (Art. 6(1)(b) GDPR). Payment data is processed by our payment providers; we never store card numbers.'), t('Age verification is stored locally in your browser only. Reviews are published with the name and city you provide.'), t('With your consent (Art. 6(1)(a) GDPR) we use analytics and marketing cookies; you can withdraw consent anytime in the cookie settings.')] },
        { h: t('Retention'), p: [t('Order and invoice data is kept for 10 years as required by German tax law (§ 147 AO). Newsletter data is deleted when you unsubscribe.')] },
        { h: t('Your rights'), p: [t('Access, rectification, erasure, restriction, portability and objection (Art. 15–21 GDPR). You may lodge a complaint with a supervisory authority, e.g. the Berlin Commissioner for Data Protection.')] },
        { h: t('Transfers'), p: [t('Data stays within the EU/EEA. Where a processor is located outside the EEA, we rely on Standard Contractual Clauses.')] },
      ],
    },
    terms: {
      icon: Scale,
      blocks: [
        { h: t('Scope'), p: [t('These terms apply to all orders placed at verdant.eu by consumers aged {age} or older residing in the EU.', { age: LEGAL_AGE })] },
        { h: t('Products'), p: [t('All products are made from EU-certified industrial hemp with a THC content below {thc}%. They are not medicinal products and are not intended to diagnose, treat, cure or prevent any disease. Hemp flowers and pre-rolls are sold as aromatic products and cannot be shipped to every member state.', { thc: THC_LIMIT_PERCENT })] },
        { h: t('Prices and payment'), p: [t('All prices include the statutory VAT. Shipping costs are shown at checkout before you confirm. We accept cards, PayPal, Apple Pay, Google Pay, SEPA direct debit and Klarna.')] },
        { h: t('Contract'), p: [t('Your order is an offer. The contract is concluded when we send the shipping confirmation. We may refuse orders that cannot be lawfully shipped to the selected country.')] },
        { h: t('Right of withdrawal'), p: [t('You have the right to withdraw from this contract within 14 days without giving any reason, starting from the day you receive the goods. Sealed products that were unsealed after delivery are excluded for hygiene reasons. Send your withdrawal to {email}; we refund within 14 days of receiving the goods.', { email: SUPPORT_EMAIL }), t('You can also withdraw online with the “Withdraw from contract” button in the footer or on your order page; you receive a confirmation with date and time immediately.')] },
        { h: t('Warranty and liability'), p: [t('Statutory warranty rights apply. Liability for slight negligence is limited to foreseeable, contract-typical damage. German law applies without prejudice to mandatory consumer protection in your country of residence. The EU online dispute resolution platform is available at ec.europa.eu/consumers/odr.')] },
      ],
    },
    imprint: {
      icon: FileText,
      blocks: [
        { h: t('Information pursuant to § 5 TMG'), p: [`${STORE_NAME} GmbH`, 'Invalidenstraße 1, 10115 Berlin, Germany', `${t('Managing director')}: Elena Berger`, `${t('Commercial register')}: Amtsgericht Charlottenburg HRB 000000 B`, `${t('VAT ID')}: DE000000000`] },
        { h: t('Contact'), p: [SUPPORT_PHONE, SUPPORT_EMAIL] },
        { h: t('Responsible for content'), p: [t('Elena Berger, address as above (§ 18(2) MStV).')] },
        { h: t('Dispute resolution'), p: [t('We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.')] },
      ],
    },
    shipping: {
      icon: Truck,
      blocks: [
        { h: t('Delivery areas'), p: [t('We ship to all EU member states. Zone 1 (Germany, Austria, Netherlands, Belgium, Luxembourg): standard {z1} · 2–4 business days. Zone 2 (rest of the EU): standard {z2} · 3–6 business days. Express and pickup-point options are shown at checkout.', { z1: formatPrice(490), z2: formatPrice(790) }), t('Standard shipping is free from {amount}.', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) })] },
        { h: t('Dispatch'), p: [t('Orders placed before 15:00 CET on business days ship the same day from Berlin. You receive a tracking link by e-mail.')] },
        { h: t('Country restrictions'), p: [t('Hemp flowers and pre-rolls cannot be sent to Ireland, Sweden, Finland, Lithuania and Slovakia. Oils, edibles, cosmetics and teas ship everywhere in the EU.')] },
        { h: t('Returns'), p: [t('14-day right of withdrawal for unopened products. Contact {email} for a prepaid return label. Damaged deliveries are replaced free of charge.', { email: SUPPORT_EMAIL }), t('You can also withdraw online with the “Withdraw from contract” button in the footer or on your order page; you receive a confirmation with date and time immediately.')] },
      ],
    },
    cookies: {
      icon: Cookie,
      blocks: [
        { h: t('Essential cookies'), p: [t('Keep your cart, language, age confirmation and cookie choice. Cannot be disabled.')] },
        { h: t('Analytics'), p: [t('Anonymous usage statistics that help us improve the shop. Only with your consent.')] },
        { h: t('Marketing'), p: [t('Personalised offers and retargeting. Only with your consent.')] },
      ],
    },
  }

  const { icon: Icon, blocks } = sections[page]
  return (
    <div className="container-x py-12 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label={t('Legal')}>
          {PAGES.map((p) => (
            <Link key={p} to={ROUTES.legal(p)} className={p === page ? 'shrink-0 rounded-full bg-forest-300 px-4 py-2 text-xs font-bold text-forest-950' : 'shrink-0 rounded-full glass-card px-4 py-2 text-xs font-semibold text-forest-200'}>
              {t(TITLES[p])}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-forest-300/15 text-gold-300"><Icon className="size-5" /></span>
          <h1 className="text-4xl font-semibold text-forest-50 sm:text-5xl">{t(TITLES[page])}</h1>
        </div>
        <p className="mt-3 text-sm text-forest-400">{t('Last updated')}: 17.09.2026</p>

        <div className="mt-10 space-y-8">
          {blocks.map((b) => (
            <section key={b.h} className="border-glow rounded-3xl border border-white/10 glass-card p-6">
              <h2 className="font-display text-2xl font-semibold text-forest-50">{b.h}</h2>
              {b.p.map((para, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-forest-100">{para}</p>
              ))}
            </section>
          ))}

          {page === 'cookies' && (
            <section className="rounded-3xl border border-white/10 glass-card p-6">
              <h2 className="font-display text-2xl font-semibold text-forest-50">{t('Your current choice')}</h2>
              <p className="mt-2 text-sm text-forest-100">
                {t('Analytics')}: <strong>{consent.analytics ? t('allowed') : t('blocked')}</strong> · {t('Marketing')}: <strong>{consent.marketing ? t('allowed') : t('blocked')}</strong>
              </p>
              <Button className="mt-4" variant="outline" onClick={resetConsent}>{t('Change cookie settings')}</Button>
            </section>
          )}

          <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-forest-300">
            <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" /> Berlin, Germany</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-forest-50"><Mail className="size-4" /> {SUPPORT_EMAIL}</a>
          </p>
        </div>
      </div>
    </div>
  )
}

const TITLES: Record<Page, string> = {
  privacy: 'Privacy policy',
  terms: 'Terms & conditions',
  imprint: 'Imprint',
  shipping: 'Shipping & returns',
  cookies: 'Cookie settings',
}
