import { z } from 'zod'
import { COUNTRY_CODES } from './constants'
import { EFFECTS, LOCALES, PRODUCT_BADGES, PRODUCT_CATEGORIES, SORT_OPTIONS } from './types'

const csv = <T extends string>(values: readonly T[]) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v == null ? [] : Array.isArray(v) ? v : v.split(',')))
    .transform((arr) => arr.filter((x): x is T => (values as readonly string[]).includes(x)))

export const localeSchema = z.enum(LOCALES).catch('en')

export const productQuerySchema = z.object({
  category: z.enum([...PRODUCT_CATEGORIES, 'all']).optional(),
  effect: csv(EFFECTS),
  badge: csv(PRODUCT_BADGES),
  min: z.coerce.number().nonnegative().optional(),
  max: z.coerce.number().nonnegative().optional(),
  cbd: z.coerce.number().nonnegative().optional(),
  q: z.string().trim().max(80).optional(),
  sort: z.enum(SORT_OPTIONS).optional(),
  stock: z.enum(['0', '1']).optional(),
  lang: localeSchema.optional(),
})
export type ProductQuery = z.infer<typeof productQuerySchema>

export const checkoutCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z.string().regex(/^\+?[\d\s()-]{8,20}$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid e-mail'),
  country: z.enum(COUNTRY_CODES as [string, ...string[]], { message: 'Please choose a country we ship to' }),
  city: z.string().trim().min(2, 'Please enter your city').max(80),
  postalCode: z.string().trim().min(3, 'Please enter your postal code').max(12),
  address: z.string().trim().min(5, 'Please enter your street and house number').max(200),
  comment: z.string().max(300).optional(),
})

export const checkoutFormSchema = checkoutCustomerSchema.extend({
  delivery: z.enum(['standard', 'express', 'pickup']),
  payment: z.enum(['card', 'paypal', 'wallet', 'sepa', 'klarna']),
  agree: z.literal(true, { message: 'You need to accept the terms' }),
  age: z.literal(true, { message: 'Please confirm you are 18 or older' }),
})
export type CheckoutForm = z.infer<typeof checkoutFormSchema>

export const orderLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(99),
  subscription: z.boolean().default(false),
  bundle: z.boolean().default(false),
})

export const createOrderSchema = z.object({
  customer: checkoutCustomerSchema,
  delivery: z.enum(['standard', 'express', 'pickup']),
  payment: z.enum(['card', 'paypal', 'wallet', 'sepa', 'klarna']),
  promoCode: z.string().trim().toUpperCase().max(32).nullable().optional(),
  items: z.array(orderLineSchema).min(1, 'Your cart is empty').max(50),
  locale: localeSchema.optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  author: z.string().trim().min(2, 'Please enter your name').max(60),
  city: z.string().trim().min(2, 'Please enter your city').max(60),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3, 'The title is too short').max(80),
  text: z.string().trim().min(20, 'Please tell us a bit more (at least 20 characters)').max(1000),
})
export type CreateReviewInput = z.infer<typeof createReviewSchema>

export const subscribeSchema = z.object({ email: z.string().email('Please check your e-mail address') })

/** Second step of the EU withdrawal button flow: the customer confirms the declaration. */
export const createWithdrawalSchema = z.object({
  orderId: z.string().trim().toUpperCase().regex(/^VD-\d{6}$/, 'Order numbers look like VD-123456'),
  email: z.string().trim().email('Please check your e-mail address'),
  items: z.array(z.string()).max(50).default([]),
  reason: z.string().trim().max(500).optional(),
})
export type CreateWithdrawalInput = z.input<typeof createWithdrawalSchema>
