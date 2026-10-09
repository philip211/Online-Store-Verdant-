import type { FastifyInstance } from 'fastify'
import {
  BUNDLE_DISCOUNT,
  canShipTo,
  computeTotals,
  createOrderSchema,
  deliveryPriceFor,
  grandTotalFor,
  isValidPromo,
  makeOrderId,
  pointsFor,
  restrictedCategoriesFor,
  VAT_RATE,
  type ProductCategory,
} from '@verdant/shared'
import { prisma } from '../lib/prisma.js'
import { badRequest, notFound } from '../lib/errors.js'
import { localeFrom } from '../lib/locale.js'
import { orderInclude, priceReference, toOrder } from '../lib/serialize.js'

export async function orderRoutes(app: FastifyInstance) {
  app.post('/orders', async (req, reply) => {
    const input = createOrderSchema.parse(req.body)
    const country = input.customer.country.toUpperCase()
    if (!canShipTo(country)) throw badRequest('We do not ship to this country yet', { field: 'country' })
    const promoCode = input.promoCode ? input.promoCode.toUpperCase() : null
    if (promoCode && !isValidPromo(promoCode)) throw badRequest('This promo code is invalid or has expired', { field: 'promoCode' })

    const variantIds = input.items.map((i) => i.variantId)
    const variants = await prisma.variant.findMany({ where: { id: { in: variantIds } }, include: { product: true, prices: true } })

    // Country-level product restrictions (raw flower cannot be sold at a distance everywhere in the EU).
    const restricted = restrictedCategoriesFor(country)
    const blocked = variants.filter((v) => restricted.includes(v.product.category as ProductCategory))
    if (blocked.length) {
      throw badRequest('Some products in your cart cannot be shipped to the selected country', {
        field: 'country',
        products: blocked.map((v) => ({ id: v.productId, name: v.product.name })),
      })
    }

    // Re-price every line from the database: the client never dictates prices.
    const lines = input.items.map((line) => {
      const v = variants.find((x) => x.id === line.variantId && x.productId === line.productId)
      if (!v) throw badRequest(`Product ${line.productId} / ${line.variantId} is unavailable`)
      if (v.stock < line.qty) throw badRequest(`“${v.product.name} ${v.label}”: only ${v.stock} left in stock`, { variantId: v.id, stock: v.stock })
      const price = line.bundle ? Math.round(v.price * (1 - BUNDLE_DISCOUNT)) : v.price
      const oldPrice = line.bundle ? v.price : priceReference(v.price, v.prices).oldPrice
      return { ...line, variant: v, price, oldPrice }
    })

    const totals = computeTotals(lines, promoCode)
    const deliveryPrice = deliveryPriceFor(input.delivery, country, totals)
    const grandTotal = grandTotalFor(totals, deliveryPrice)
    const vatAmount = Math.round(grandTotal - grandTotal / (1 + VAT_RATE))

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          id: makeOrderId(),
          locale: input.locale ?? localeFrom(req),
          name: input.customer.name,
          email: input.customer.email.toLowerCase(),
          phone: input.customer.phone,
          country,
          city: input.customer.city,
          postalCode: input.customer.postalCode,
          address: input.customer.address,
          comment: input.customer.comment ?? null,
          delivery: input.delivery,
          payment: input.payment,
          promoCode,
          totals: JSON.stringify(totals),
          deliveryPrice,
          grandTotal,
          vatAmount,
          pointsEarned: pointsFor(grandTotal),
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              name: l.variant.product.name,
              variantLabel: l.variant.label,
              price: l.price,
              oldPrice: l.oldPrice ?? null,
              qty: l.qty,
              subscription: l.subscription,
              bundle: l.bundle,
            })),
          },
        },
        include: orderInclude,
      })
      for (const l of lines) {
        await tx.variant.update({ where: { id: l.variantId }, data: { stock: { decrement: l.qty } } })
        await tx.product.update({ where: { id: l.productId }, data: { soldToday: { increment: l.qty } } })
      }
      return created
    })

    reply.code(201)
    return toOrder(order)
  })

  app.get<{ Querystring: { email?: string } }>('/orders', async (req) => {
    const email = req.query.email?.trim().toLowerCase()
    if (!email) throw badRequest('E-mail is required')
    const rows = await prisma.order.findMany({ where: { email }, orderBy: { createdAt: 'desc' }, include: orderInclude, take: 50 })
    return rows.map(toOrder)
  })

  app.get<{ Params: { id: string } }>('/orders/:id', async (req) => {
    const row = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude })
    if (!row) throw notFound('Order not found')
    return toOrder(row)
  })
}
