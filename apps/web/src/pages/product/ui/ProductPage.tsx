import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import { ChevronRight, FileCheck2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { CATEGORY_LABELS, EFFECT_LABELS, getDefaultVariant, getMinPrice, getProductPhoto, ProductVisual, useProduct, useRecentlyViewed, useRelatedProducts } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { FREE_SHIPPING_THRESHOLD, ROUTES, SITE_URL } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cbdLabel, cn, formatPrice, formatVariantLabel, useDocumentMeta } from '@/shared/lib'
import { Accordion, SectionHeading, Skeleton } from '@/shared/ui'
import { BundleOffer } from '@/widgets/bundle-offer'
import { ProductGrid } from '@/widgets/product-grid'
import { ProductPurchasePanel } from '@/widgets/product-purchase'
import { ProductReviews } from '@/widgets/product-reviews'
import { RecentlyViewed } from '@/widgets/recently-viewed'
import { NotFoundPage } from '@/pages/not-found'

const ANGLES = [0, -8, 8, 180]

export default function ProductPage() {
  const { t } = useT()
  const { slug = '' } = useParams()
  const { data: product, isLoading } = useProduct(slug)
  const related = useRelatedProducts(product)
  const push = useRecentlyViewed((s) => s.push)
  const [angle, setAngle] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelInView = useInView(panelRef, { margin: '-80px 0px 0px 0px' })

  const jsonLd = useMemo(
    () =>
      product
        ? {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.shortDescription,
            ...(getProductPhoto(product.id) ? { image: `${SITE_URL}${getProductPhoto(product.id)}` } : {}),
            brand: { '@type': 'Brand', name: 'Verdant' },
            aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewsCount },
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              lowPrice: (getMinPrice(product) / 100).toFixed(2),
              highPrice: (Math.max(...product.variants.map((v) => v.price)) / 100).toFixed(2),
              offerCount: product.variants.length,
              availability: 'https://schema.org/InStock',
              url: `${SITE_URL}${ROUTES.product(product.slug)}`,
            },
          }
        : null,
    [product],
  )
  useDocumentMeta({ title: product?.name, description: product?.shortDescription, jsonLd })

  useEffect(() => {
    if (product) {
      push(product.id)
      window.scrollTo({ top: 0 })
    }
  }, [product, push])

  if (isLoading) return <ProductSkeleton />
  if (!product) return <NotFoundPage />

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success(t('Link copied'))
      }
    } catch {
      /* user cancelled */
    }
  }

  const defaultVariant = getDefaultVariant(product)
  const usage: Record<string, string> = {
    oils: t('Shake the bottle. Draw the required drops into the pipette, hold under the tongue for 60–90 seconds, then swallow. Start with 3–4 drops twice a day.'),
    flowers: t('Suitable for vaporising at 180–200 °C or for infusions. Store airtight in a cool, dark place.'),
    prerolls: t('Suitable for vaporising at 180–200 °C or for infusions. Store airtight in a cool, dark place.'),
    edibles: t('One serving a day, ideally with food. Onset after 45–90 minutes, lasting up to 6 hours.'),
    tea: t('Pour 200 ml of water at 90 °C over one pyramid and steep for 7 minutes. Add a splash of milk or coconut oil for better absorption.'),
    cosmetics: t('Apply a small amount to clean skin and massage gently. Use 1–3 times a day.'),
  }

  return (
    <div className="container-x py-8 lg:py-12">
      <nav className="flex items-center gap-1.5 text-xs text-forest-300" aria-label={t('Breadcrumbs')}>
        <Link to={ROUTES.home} className="hover:text-forest-50">{t('Home')}</Link>
        <ChevronRight className="size-3" />
        <Link to={ROUTES.catalog} className="hover:text-forest-50">{t('Shop')}</Link>
        <ChevronRight className="size-3" />
        <Link to={`${ROUTES.catalog}?category=${product.category}`} className="hover:text-forest-50">{t(CATEGORY_LABELS[product.category])}</Link>
        <ChevronRight className="size-3" />
        <span className="text-forest-50">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div className="border-glow relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-card ring-1 ring-white/10 sm:aspect-square">
              <AnimatePresence mode="wait">
                <motion.div key={angle} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="h-full w-full">
                  <ProductVisual product={product} variant="hero" angle={ANGLES[angle]} />
                </motion.div>
              </AnimatePresence>
              <button onClick={share} aria-label={t('Share')} className="absolute right-4 top-4 grid size-11 place-items-center rounded-full glass-card text-forest-200 shadow-soft backdrop-blur transition hover:bg-white/20">
                <Share2 className="size-4" />
              </button>
              <a href={product.labReportUrl} className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-forest-950/80 px-3.5 py-2 text-xs font-semibold text-forest-100 backdrop-blur transition hover:bg-forest-950">
                <FileCheck2 className="size-4 text-gold-400" /> {t('Batch lab report')}
              </a>
            </div>
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
              {ANGLES.map((a, i) => (
                <button key={a} onClick={() => setAngle(i)} aria-label={t('View {n}', { n: i + 1 })} className={cn('size-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition sm:size-20', angle === i ? 'ring-gold-500' : 'ring-transparent opacity-70 hover:opacity-100')}>
                  <ProductVisual product={product} variant="thumb" angle={a} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div ref={panelRef}>
            <ProductPurchasePanel product={product} />
          </div>

          <Accordion
            className="mt-10 border-t border-white/10"
            defaultOpen="desc"
            items={[
              { id: 'desc', title: t('Description'), content: <p>{product.description}</p> },
              {
                id: 'profile',
                title: t('Profile & terpenes'),
                content: (
                  <div className="space-y-3">
                    <Row label="CBD" value={cbdLabel(product.cbd, product.category)} />
                    <Row label="THC" value={`${product.thc}%`} />
                    <Row label={t('Origin')} value={product.origin} />
                    {product.terpenes.length > 0 && <Row label={t('Terpenes')} value={product.terpenes.join(', ')} />}
                    <Row label={t('Aroma')} value={product.aroma.join(', ')} />
                    <Row label={t('Effect')} value={product.effects.map((e) => t(EFFECT_LABELS[e].label)).join(', ')} />
                  </div>
                ),
              },
              { id: 'use', title: t('How to use'), content: usage[product.category] },
              {
                id: 'ship',
                title: t('Shipping & returns'),
                content: t('Same-day dispatch before 15:00 CET. DHL or DPD delivers in 2–4 days to DE, AT, NL, BE and LU and in 3–6 days elsewhere in the EU. Free from {amount}. 14-day right of withdrawal.', { amount: formatPrice(FREE_SHIPPING_THRESHOLD) }),
              },
            ]}
          />
        </div>
      </div>

      <div className="mt-20">
        <BundleOffer product={product} />
      </div>

      <div className="mt-24">
        <ProductReviews product={product} />
      </div>

      <section className="mt-24">
        <SectionHeading eyebrow={t('Recommended')} title={t('Customers also buy')} />
        <ProductGrid products={related.data} loading={related.isLoading} skeletons={4} className="mt-10" />
      </section>

      <RecentlyViewed excludeId={product.id} className="mt-24" />

      <AnimatePresence>
        {!panelInView && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed inset-x-0 bottom-[84px] z-40 border-t border-white/10 bg-forest-950/85 px-4 py-3 shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.6)] backdrop-blur lg:hidden">
            <div className="container-x flex items-center gap-3">
              <div className="size-12 shrink-0 overflow-hidden rounded-xl">
                <ProductVisual product={product} variant="thumb" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-forest-50">{product.name}</div>
                <div className="text-sm font-semibold tabular-nums text-forest-200">{formatPrice(defaultVariant.price)} · {formatVariantLabel(defaultVariant.label)}</div>
              </div>
              <AddToCartButton product={product} size="sm" label={t('Buy')} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-2 text-sm">
      <span className="text-forest-300">{label}</span>
      <span className="text-right font-medium text-forest-50">{value}</span>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-x py-12">
      <div className="grid gap-10 lg:grid-cols-12">
        <Skeleton className="aspect-square rounded-[2rem] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  )
}
