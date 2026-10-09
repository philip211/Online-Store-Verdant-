/**
 * Stock product photos (CC0, provenance in public/images/CREDITS.md). Products without an entry fall back to the
 * procedural artwork in ProductVisual. Replace with real packshots of the actual products before launch.
 */
const PHOTO_IDS = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14'])

export const getProductPhoto = (productId: string): string | undefined =>
  PHOTO_IDS.has(productId) ? `/images/products/${productId}.webp` : undefined
