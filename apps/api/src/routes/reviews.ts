import type { FastifyInstance } from 'fastify'
import { createReviewSchema } from '@verdant/shared'
import { prisma } from '../lib/prisma.js'
import { notFound } from '../lib/errors.js'
import { toReview } from '../lib/serialize.js'

export async function reviewRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { productId?: string; limit?: string } }>('/reviews', async (req) => {
    const { productId } = req.query
    const limit = Math.min(50, Number(req.query.limit) || 50)
    const rows = await prisma.review.findMany({
      where: productId ? { productId } : undefined,
      orderBy: productId ? [{ helpful: 'desc' }, { date: 'desc' }] : [{ helpful: 'desc' }],
      take: limit,
    })
    return rows.map(toReview)
  })

  app.post('/reviews', async (req, reply) => {
    const input = createReviewSchema.parse(req.body)
    const product = await prisma.product.findUnique({ where: { id: input.productId } })
    if (!product) throw notFound('Product not found')

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({ data: { ...input, verified: false } })
      const agg = await tx.review.aggregate({ where: { productId: input.productId }, _avg: { rating: true }, _count: true })
      // Blend the seeded catalogue rating with real reviews so one review does not swing the score.
      const seededCount = Math.max(0, product.reviewsCount - (agg._count - 1))
      const seededSum = product.rating * seededCount
      const realSum = (agg._avg.rating ?? 0) * agg._count
      const rating = (seededSum + realSum) / (seededCount + agg._count)
      await tx.product.update({ where: { id: input.productId }, data: { rating, reviewsCount: { increment: 1 } } })
      return created
    })
    reply.code(201)
    return toReview(review)
  })

  app.post<{ Params: { id: string } }>('/reviews/:id/helpful', async (req) => {
    const row = await prisma.review.update({ where: { id: req.params.id }, data: { helpful: { increment: 1 } } }).catch(() => null)
    if (!row) throw notFound('Review not found')
    return toReview(row)
  })
}
