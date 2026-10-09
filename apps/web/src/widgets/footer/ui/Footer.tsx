import { Link } from 'react-router-dom'
import { Instagram, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { NewsletterForm } from '@/features/newsletter'
import { LEGAL_AGE, ROUTES, STORE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { HempLeaf, LeafField } from '@/shared/ui'

export function Footer() {
  const { t } = useT()
  const cols = [
    {
      title: 'Shop',
      links: [
        { label: 'CBD flowers', to: `${ROUTES.catalog}?category=flowers` },
        { label: 'Oils', to: `${ROUTES.catalog}?category=oils` },
        { label: 'Edibles', to: `${ROUTES.catalog}?category=edibles` },
        { label: 'Cosmetics', to: `${ROUTES.catalog}?category=cosmetics` },
        { label: 'Pre-rolls', to: `${ROUTES.catalog}?category=prerolls` },
      ],
    },
    {
      title: 'Customer care',
      links: [
        { label: 'Shipping & returns', to: ROUTES.legal('shipping') },
        { label: 'Withdraw from contract', to: ROUTES.withdrawal },
        { label: 'Lab reports', to: ROUTES.lab },
        { label: 'Loyalty programme', to: ROUTES.orders },
        { label: 'FAQ', to: `${ROUTES.home}#faq` },
        { label: 'About us', to: ROUTES.about },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & conditions', to: ROUTES.legal('terms') },
        { label: 'Privacy policy', to: ROUTES.legal('privacy') },
        { label: 'Cookie settings', to: ROUTES.legal('cookies') },
        { label: 'Imprint', to: ROUTES.legal('imprint') },
      ],
    },
  ]

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest-950 text-forest-200">
      <LeafField rays={false} />
      <div className="container-x relative py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to={ROUTES.home} className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full border border-gold-500/50 bg-forest-900">
                <HempLeaf className="size-5 text-gold-400" />
              </span>
              <span className="font-display text-3xl font-semibold text-forest-50">{STORE_NAME}</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-forest-200">{t('Premium organic hemp products. Grown in Italy and Switzerland, tested by independent labs, shipped across the EU with care.')}</p>
            <h4 className="mt-8 font-display text-2xl font-semibold text-forest-50">{t('10% off for subscribing')}</h4>
            <p className="mb-4 mt-1 text-sm text-forest-200">{t('New arrivals, dosing guides and private sales. No spam.')}</p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7 lg:pl-12">
            {cols.map((c) => (
              <div key={c.title}>
                <h5 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{t(c.title)}</h5>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="link-underline text-sm text-forest-200 transition hover:text-gold-300">
                        {t(l.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <h5 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">{t('Contact')}</h5>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 hover:text-gold-300">
                    <Phone className="size-4 text-forest-400" /> {SUPPORT_PHONE}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 hover:text-gold-300">
                    <Mail className="size-4 text-forest-400" /> {SUPPORT_EMAIL}
                  </a>
                </li>
                <li className="text-forest-400">{t('Mon–Fri 9:00–18:00 CET')}</li>
              </ul>
              <div className="mt-5 flex gap-2">
                {[Instagram, Send, MessageCircle].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social" className="grid size-10 place-items-center rounded-full border border-white/10 text-forest-200 transition hover:border-gold-500/50 hover:text-gold-300">
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="divider-gold my-10" />

        <div className="flex flex-col gap-4 text-xs text-forest-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {STORE_NAME} GmbH · {t('All prices include VAT. {age}+ only.', { age: LEGAL_AGE })}</p>
          <p className="max-w-xl leading-relaxed">
            {t('All products are made from industrial hemp with less than {thc}% THC. Not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare professional before use.', { thc: THC_LIMIT_PERCENT })}
          </p>
        </div>
      </div>
    </footer>
  )
}
