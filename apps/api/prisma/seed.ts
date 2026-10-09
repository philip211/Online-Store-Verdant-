import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { SEED_PRODUCTS, SEED_REVIEWS } from '@verdant/shared'
import { historyFor } from './price-history'

const prisma = new PrismaClient()

async function main() {
  await prisma.withdrawal.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.variant.deleteMany()
  await prisma.product.deleteMany()

  for (const p of SEED_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        strain: p.strain ?? null,
        category: p.category,
        shortDescription: p.shortDescription,
        description: p.description,
        cbd: p.cbd,
        thc: p.thc,
        effects: JSON.stringify(p.effects),
        terpenes: JSON.stringify(p.terpenes),
        aroma: JSON.stringify(p.aroma),
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        badges: JSON.stringify(p.badges),
        hue: p.hue,
        soldToday: p.soldToday,
        labReportUrl: p.labReportUrl,
        origin: p.origin,
        i18n: JSON.stringify(p.i18n ?? {}),
        createdAt: new Date(p.createdAt),
        variants: {
          create: p.variants.map((v, i) => ({
            id: v.id,
            label: v.label,
            price: v.price,
            oldPrice: v.oldPrice ?? null,
            stock: v.stock,
            sort: i,
            prices: { create: historyFor(v) },
          })),
        },
      },
    })
  }

  for (const r of SEED_REVIEWS) {
    await prisma.review.create({
      data: {
        id: r.id,
        productId: r.productId,
        author: r.author,
        city: r.city,
        rating: r.rating,
        title: r.title,
        text: r.text,
        date: new Date(r.date),
        verified: r.verified,
        helpful: r.helpful,
        effect: r.effect ?? null,
      },
    })
  }

  console.log(`Seeded ${SEED_PRODUCTS.length} products and ${SEED_REVIEWS.length} reviews`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
