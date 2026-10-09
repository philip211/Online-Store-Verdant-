const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)

/**
 * Seed price history. A variant with an oldPrice in the seed data was at that price for the previous two
 * months and was reduced a week ago; every other variant has held its price for three months.
 */
export const historyFor = (v: { price: number; oldPrice?: number | null }) =>
  v.oldPrice && v.oldPrice > v.price
    ? [
        { price: v.oldPrice, startedAt: daysAgo(60) },
        { price: v.price, startedAt: daysAgo(7) },
      ]
    : [{ price: v.price, startedAt: daysAgo(90) }]
