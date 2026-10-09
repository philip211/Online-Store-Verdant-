import type { FastifyInstance } from 'fastify'
import { applyFilters, productQuerySchema, relatedProducts, type Locale, type ProductFilters } from '@verdant/shared'
import { prisma } from '../lib/prisma.js'
import { notFound } from '../lib/errors.js'
import { localeFrom } from '../lib/locale.js'
import { productInclude, toProduct } from '../lib/serialize.js'

const loadAll = async (locale: Locale) => (await prisma.product.findMany({ include: productInclude })).map((r) => toProduct(r, locale))

export async function productRoutes(app: FastifyInstance) {
  app.get('/products', async (req) => {
    const q = productQuerySchema.parse(req.query)
    const locale = localeFrom(req)
    const filters: ProductFilters = {
      category: q.category as ProductFilters['category'],
      effects: q.effect,
      badges: q.badge,
      minPrice: q.min,
      maxPrice: q.max,
      minCbd: q.cbd,
      search: q.q || undefined,
      sort: q.sort as ProductFilters['sort'],
      inStock: q.stock === '1',
    }
    const items = applyFilters(await loadAll(locale), filters)
    return { items, total: items.length, locale }
  })

  app.get('/products/featured', async (req) => applyFilters(await loadAll(localeFrom(req)), { badges: ['hit'] }).slice(0, 4))

  app.get('/products/new', async (req) => applyFilters(await loadAll(localeFrom(req)), { sort: 'new' }).slice(0, 4))

  app.get<{ Querystring: { ids?: string } }>('/products/by-ids', async (req) => {
    const ids = (req.query.ids ?? '').split(',').filter(Boolean).slice(0, 50)
    if (!ids.length) return []
    const locale = localeFrom(req)
    const rows = await prisma.product.findMany({ where: { id: { in: ids } }, include: productInclude })
    return rows.map((r) => toProduct(r, locale))
  })

  app.get<{ Params: { slug: string } }>('/products/:slug', async (req) => {
    const row = await prisma.product.findUnique({ where: { slug: req.params.slug }, include: productInclude })
    if (!row) throw notFound('Product not found')
    return toProduct(row, localeFrom(req))
  })

  app.get<{ Params: { id: string } }>('/products/:id/related', async (req) => {
    const all = await loadAll(localeFrom(req))
    const product = all.find((p) => p.id === req.params.id)
    if (!product) throw notFound('Product not found')
    return relatedProducts(all, product)
  })
}
