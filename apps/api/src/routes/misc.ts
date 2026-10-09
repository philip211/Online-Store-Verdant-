import type { FastifyInstance } from 'fastify'
import { canShipTo, deliveryDaysFor, DELIVERY_OPTIONS, PROMO_CODES, restrictedCategoriesFor, SHIPPING_COUNTRIES, subscribeSchema, zoneFor } from '@verdant/shared'
import { prisma } from '../lib/prisma.js'
import { badRequest, notFound } from '../lib/errors.js'
import { localeFrom } from '../lib/locale.js'

export async function miscRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true, time: new Date().toISOString() }))

  app.get<{ Params: { code: string } }>('/promo/:code', async (req) => {
    const code = req.params.code.trim().toUpperCase()
    const promo = PROMO_CODES[code]
    if (!promo) throw notFound('This promo code is invalid or has expired')
    return { code, ...promo }
  })

  /** Shipping matrix for the checkout: zone, options with prices and transit days, restricted categories. */
  app.get<{ Params: { country: string } }>('/shipping/:country', async (req) => {
    const country = req.params.country.toUpperCase()
    if (!canShipTo(country)) throw badRequest('We do not ship to this country yet')
    const zone = zoneFor(country)!
    return {
      country,
      zone,
      options: DELIVERY_OPTIONS.map((d) => ({ id: d.id, carrier: d.carrier, price: d.price[zone], days: deliveryDaysFor(d.id, country) })),
      restrictedCategories: restrictedCategoriesFor(country),
    }
  })

  app.get('/shipping', async () => ({ countries: SHIPPING_COUNTRIES }))

  app.post('/newsletter', async (req, reply) => {
    const { email } = subscribeSchema.parse(req.body)
    const normalized = email.trim().toLowerCase()
    const existing = await prisma.subscriber.findUnique({ where: { email: normalized } })
    if (!existing) await prisma.subscriber.create({ data: { email: normalized, locale: localeFrom(req), consent: true } })
    reply.code(existing ? 200 : 201)
    return { ok: true, promoCode: 'WELCOME10', alreadySubscribed: !!existing }
  })
}
