export interface Review {
  id: string
  productId: string
  author: string
  city: string
  rating: number
  title: string
  text: string
  date: string
  verified: boolean
  helpful: number
  effect?: string
}
