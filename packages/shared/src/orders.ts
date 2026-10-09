import type { OrderStatus } from './types'

export const ORDER_STEPS: OrderStatus[] = ['processing', 'packed', 'shipped', 'delivered']

/** Demo fulfilment timeline: the order "moves" as minutes pass since it was placed. */
export function statusForAge(createdAt: string | Date, now = Date.now()): OrderStatus {
  const minutes = (now - new Date(createdAt).getTime()) / 60_000
  if (minutes < 1) return 'processing'
  if (minutes < 3) return 'packed'
  if (minutes < 10) return 'shipped'
  return 'delivered'
}

export const makeOrderId = () => 'VD-' + Math.floor(100000 + Math.random() * 900000)
