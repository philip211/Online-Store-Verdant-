import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { HttpError } from './lib/errors.js'
import { productRoutes } from './routes/products.js'
import { reviewRoutes } from './routes/reviews.js'
import { orderRoutes } from './routes/orders.js'
import { miscRoutes } from './routes/misc.js'
import { withdrawalRoutes } from './routes/withdrawals.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } },
    },
  })

  await app.register(cors, {
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
  await app.register(rateLimit, { max: 300, timeWindow: '1 minute' })

  // Accept POSTs that carry a JSON content-type but no body (e.g. "mark helpful").
  app.removeContentTypeParser('application/json')
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (!body || (typeof body === 'string' && body.trim() === '')) return done(null, undefined)
    try {
      done(null, JSON.parse(body as string))
    } catch (e) {
      done(e as Error, undefined)
    }
  })

  app.setErrorHandler((err: unknown, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'Invalid request', details: err.issues })
    }
    if (err instanceof HttpError) {
      return reply.code(err.statusCode).send({ error: err.message, details: err.details })
    }
    const e = err as { statusCode?: number; message?: string }
    const status = typeof e.statusCode === 'number' && e.statusCode >= 400 ? e.statusCode : 500
    if (status >= 500) app.log.error(err)
    return reply.code(status).send({ error: status >= 500 ? 'Internal server error' : (e.message ?? 'Error') })
  })

  app.setNotFoundHandler((_req, reply) => reply.code(404).send({ error: 'Route not found' }))

  await app.register(
    async (api) => {
      await api.register(productRoutes)
      await api.register(reviewRoutes)
      await api.register(orderRoutes)
      await api.register(miscRoutes)
      await api.register(withdrawalRoutes)
    },
    { prefix: '/api' },
  )

  return app
}
