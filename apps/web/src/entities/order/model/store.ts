import { useMutation, useQuery } from '@tanstack/react-query'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { statusForAge, WITHDRAWAL_WINDOW_DAYS, type CreateOrderInput, type CreateWithdrawalInput, type Order, type OrderStatus, type WithdrawalReceipt } from '@verdant/shared'
import { api } from '@/shared/api'

export type { Order, OrderStatus, WithdrawalReceipt }
export { ORDER_STEPS } from '@verdant/shared'

export const getOrderStatus = (order: Order, now = Date.now()): OrderStatus => statusForAge(order.createdAt, now)

/** Whether the EU withdrawal button is still offered for this order (mirrors the API check). */
export const canWithdraw = (order: Pick<Order, 'createdAt'>, now = Date.now()) =>
  now <= new Date(order.createdAt).getTime() + WITHDRAWAL_WINDOW_DAYS * 86_400_000

/** Withdrawal of the whole order: an empty item list in a receipt means everything was withdrawn. */
export const isFullyWithdrawn = (order: Order) => !!order.withdrawals?.some((w) => w.items.length === 0)

export const useCreateWithdrawal = () =>
  useMutation({ mutationFn: (input: CreateWithdrawalInput) => api.post<WithdrawalReceipt>('/withdrawals', input) })

/**
 * Orders are created on the server; this store only remembers the orders placed from this browser
 * (the demo has no accounts), so the "My orders" page works without a login.
 */
interface OrderState {
  orders: Order[]
  addOrder: (order: Order) => void
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),
    }),
    { name: 'verdant:orders' },
  ),
)

export const usePointsBalance = () => useOrderStore((s) => s.orders.reduce((n, o) => n + o.pointsEarned, 0))

export const useCreateOrder = () => useMutation({ mutationFn: (input: CreateOrderInput) => api.post<Order>('/orders', input) })

export const useOrder = (id?: string) => {
  const cached = useOrderStore((s) => s.orders.find((o) => o.id === id))
  return useQuery({
    queryKey: ['orders', id],
    queryFn: ({ signal }) => api.get<Order>(`/orders/${id}`, undefined, signal),
    enabled: !!id,
    initialData: cached,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
