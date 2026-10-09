import { FREE_SHIPPING_THRESHOLD, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { formatPrice } from '@/shared/lib'
import { Accordion, SectionHeading } from '@/shared/ui'

export function Faq() {
  const { t } = useT()
  const items = [
    { id: 'legal', title: t('Is CBD legal in the EU?'), content: t('Yes. All our products are made from EU-certified industrial hemp with less than {thc}% THC, so they have no psychoactive effect. Rules for hemp flowers differ between member states, which is why the checkout blocks flowers for a few countries. A lab report with the cannabinoid profile ships with every order.', { thc: THC_LIMIT_PERCENT }) },
    { id: 'effect', title: t('What will I feel?'), content: t('CBD does not get you high. Most customers describe a gentle release of tension, more clarity and better sleep quality. The effect depends on the dose, the product and your body.') },
    { id: 'dose', title: t('Which dose should I start with?'), content: t('Beginners do well with the 5% oil: 3–4 drops under the tongue morning and evening. Review after 5–7 days and increase if needed. The dose calculator on the home page gives you a starting point.') },
    { id: 'delivery', title: t('How does delivery work?'), content: t('Orders placed before 15:00 CET ship the same business day from our warehouse in Germany. DHL or DPD delivers in 2–4 days to zone 1 (DE, AT, NL, BE, LU) and 3–6 days elsewhere in the EU. Free standard shipping from {amount}.', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) }) },
    { id: 'vat', title: t('Are prices final?'), content: t('Yes. All prices include VAT. There are no customs duties within the EU. Shipping is shown separately at checkout and depends on your country and delivery option.') },
    { id: 'return', title: t('Can I return a product?'), content: t('You have a 14-day right of withdrawal under EU consumer law for unopened products. If something arrives damaged we replace it at our cost. Write to support and we answer within one business day.') },
  ]

  return (
    <section id="faq" className="container-x py-24">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title={t('Frequently asked questions')} description={t('Cannot find the answer? Write to us, we reply within one business day.')} />
        </div>
        <div className="lg:col-span-8">
          <Accordion items={items} defaultOpen="legal" />
        </div>
      </div>
    </section>
  )
}
