import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { historyFor } from './price-history'

/** One-off for databases created before PriceHistory existed: gives every variant without history a seed history. Orders are untouched. */
const prisma = new PrismaClient()

async function main() {
  const variants = await prisma.variant.findMany({ where: { prices: { none: {} } } })
  for (const v of variants) {
    await prisma.priceHistory.createMany({ data: historyFor(v).map((h) => ({ ...h, variantId: v.id })) })
  }
  console.log(`Price history added to ${variants.length} variant(s).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
