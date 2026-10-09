import type { FastifyInstance } from 'fastify'
import { createWithdrawalSchema, STORE_NAME, SUPPORT_EMAIL, WITHDRAWAL_WINDOW_DAYS } from '@verdant/shared'
import { prisma } from '../lib/prisma.js'
import { badRequest, notFound } from '../lib/errors.js'
import { sendMail } from '../lib/mailer.js'
import { orderInclude, toOrder, toWithdrawal } from '../lib/serialize.js'

const makeWithdrawalId = () => 'WD-' + Math.floor(100000 + Math.random() * 900000)

export async function withdrawalRoutes(app: FastifyInstance) {
  /** EU withdrawal button, step 2: the customer confirmed the declaration; record it and confirm on a durable medium. */
  app.post('/withdrawals', async (req, reply) => {
    const input = createWithdrawalSchema.parse(req.body)
    const email = input.email.toLowerCase()
    const row = await prisma.order.findUnique({ where: { id: input.orderId }, include: orderInclude })
    // Same answer for "no such order" and "wrong e-mail" so order numbers cannot be probed.
    if (!row || row.email !== email) throw notFound('We could not find an order with this number and e-mail address')

    const deadline = row.createdAt.getTime() + WITHDRAWAL_WINDOW_DAYS * 86_400_000
    if (Date.now() > deadline) {
      throw badRequest(`The withdrawal period for this order has ended. Please contact ${SUPPORT_EMAIL} and we will look at it individually.`)
    }

    const order = toOrder(row)
    const keys = new Set(order.items.map((i) => i.key))
    const unknown = input.items.filter((k) => !keys.has(k))
    if (unknown.length) throw badRequest('Some selected items are not part of this order', { items: unknown })

    const created = await prisma.withdrawal.create({
      data: { id: makeWithdrawalId(), orderId: row.id, email, items: JSON.stringify(input.items), reason: input.reason ?? null },
    })

    const lines = input.items.length ? order.items.filter((i) => input.items.includes(i.key)) : order.items
    const emailSent = await sendMail(req.log, {
      to: email,
      subject: `${STORE_NAME}: withdrawal ${created.id} received for order ${row.id}`,
      text: [
        `We received your withdrawal from order ${row.id} on ${created.createdAt.toISOString()}.`,
        `Reference: ${created.id}`,
        `Items: ${lines.map((i) => `${i.name} ${i.variantLabel} × ${i.qty}`).join('; ')}`,
        `We will send a prepaid return label and refund within 14 days of receiving the goods.`,
      ].join('\n'),
    })

    reply.code(201)
    return { ...toWithdrawal(created), emailSent }
  })
}
