import { Suspense, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useCatalogQuery } from '@/entities/product'
import { AgeGate } from '@/features/age-gate'
import { ProductQuiz } from '@/features/product-quiz'
import { useLocale } from '@/shared/i18n'
import { AmbientBackground, PageTransition, ScrollTopButton, Skeleton, TopProgress, useSpotlight } from '@/shared/ui'
import { CartDrawer } from '@/widgets/cart-drawer'
import { CompareBar } from '@/widgets/compare-bar'
import { CookieConsent } from '@/widgets/cookie-consent'
import { Footer } from '@/widgets/footer'
import { Header } from '@/widgets/header'
import { MobileTabBar } from '@/widgets/mobile-tab-bar'
import { QuickViewModal } from '@/widgets/quick-view'

/** Anchor links scroll to their target; scrolling to top on route change is done by PageTransition while the veil covers the screen. */
function ScrollToHash() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [pathname, hash])
  return null
}

function PageFallback() {
  return (
    <div className="container-x space-y-6 py-12">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5]" />
        ))}
      </div>
    </div>
  )
}

export function RootLayout() {
  const locale = useLocale()
  useCatalogQuery()
  useSpotlight()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Re-mount the tree on language change so every formatted price and date re-renders.
  return (
    <div key={locale} className="flex min-h-screen flex-col">
      <AmbientBackground />
      <TopProgress />
      <ScrollToHash />
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <Suspense fallback={<PageFallback />}>
          <PageTransition />
        </Suspense>
      </main>
      <Footer />

      <ScrollTopButton />
      <CartDrawer />
      <QuickViewModal />
      <AgeGate />
      <ProductQuiz />
      <CompareBar />
      <MobileTabBar />
      <CookieConsent />
      <Toaster
        position="top-center"
        richColors={false}
        closeButton
        toastOptions={{
          className: '!rounded-2xl !border-white/15 !bg-forest-900/95 !text-forest-50 !shadow-card !backdrop-blur-xl',
          descriptionClassName: '!text-forest-300',
        }}
      />
    </div>
  )
}
