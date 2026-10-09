import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateReviewInput, Review } from '@verdant/shared'
import { api } from '@/shared/api'
import { productKeys } from '@/entities/product'

export const reviewKeys = {
  all: ['reviews'] as const,
  byProduct: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  top: () => [...reviewKeys.all, 'top'] as const,
}

export const useProductReviews = (productId?: string) =>
  useQuery({
    queryKey: reviewKeys.byProduct(productId ?? ''),
    queryFn: ({ signal }) => api.get<Review[]>('/reviews', { productId }, signal),
    enabled: !!productId,
  })

export const useTopReviews = () =>
  useQuery({ queryKey: reviewKeys.top(), queryFn: ({ signal }) => api.get<Review[]>('/reviews', { limit: 6 }, signal) })

export const useCreateReview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<Review>('/reviews', input),
    onSuccess: (review) => {
      qc.invalidateQueries({ queryKey: reviewKeys.byProduct(review.productId) })
      qc.invalidateQueries({ queryKey: reviewKeys.top() })
      // rating and review count changed on the product
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export const useVoteHelpful = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post<Review>(`/reviews/${id}/helpful`),
    onSuccess: (review) => qc.invalidateQueries({ queryKey: reviewKeys.byProduct(review.productId) }),
  })
}
