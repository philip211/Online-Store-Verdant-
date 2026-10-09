import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ROUTES } from '@/shared/config'
import { RootLayout } from '../layouts/RootLayout'

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const CatalogPage = lazy(() => import('@/pages/catalog').then((m) => ({ default: m.CatalogPage })))
const ProductPage = lazy(() => import('@/pages/product').then((m) => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('@/pages/cart').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/checkout').then((m) => ({ default: m.CheckoutPage })))
const OrderSuccessPage = lazy(() => import('@/pages/order-success').then((m) => ({ default: m.OrderSuccessPage })))
const WishlistPage = lazy(() => import('@/pages/wishlist').then((m) => ({ default: m.WishlistPage })))
const AboutPage = lazy(() => import('@/pages/about').then((m) => ({ default: m.AboutPage })))
const LabResultsPage = lazy(() => import('@/pages/lab').then((m) => ({ default: m.LabResultsPage })))
const ComparePage = lazy(() => import('@/pages/compare').then((m) => ({ default: m.ComparePage })))
const OrdersPage = lazy(() => import('@/pages/orders').then((m) => ({ default: m.OrdersPage })))
const OrderPage = lazy(() => import('@/pages/order').then((m) => ({ default: m.OrderPage })))
const WithdrawalPage = lazy(() => import('@/pages/withdrawal').then((m) => ({ default: m.WithdrawalPage })))
const LegalPage = lazy(() => import('@/pages/legal').then((m) => ({ default: m.LegalPage })))
const NotFoundPage = lazy(() => import('@/pages/not-found'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.catalog, element: <CatalogPage /> },
      { path: '/product/:slug', element: <ProductPage /> },
      { path: ROUTES.cart, element: <CartPage /> },
      { path: ROUTES.checkout, element: <CheckoutPage /> },
      { path: ROUTES.orderSuccess, element: <OrderSuccessPage /> },
      { path: ROUTES.wishlist, element: <WishlistPage /> },
      { path: ROUTES.compare, element: <ComparePage /> },
      { path: ROUTES.orders, element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderPage /> },
      { path: ROUTES.about, element: <AboutPage /> },
      { path: ROUTES.lab, element: <LabResultsPage /> },
      { path: '/legal/:page', element: <LegalPage /> },
      { path: ROUTES.withdrawal, element: <WithdrawalPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
