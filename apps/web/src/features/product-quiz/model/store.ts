import { create } from 'zustand'
import type { Effect, Product, ProductCategory } from '@/entities/product'

export type QuizGoal = Effect
export type QuizForm = ProductCategory | 'any'
export type QuizExperience = 'new' | 'some' | 'regular'

interface QuizState {
  open: boolean
  openQuiz: () => void
  closeQuiz: () => void
}

export const useQuiz = create<QuizState>((set) => ({
  open: false,
  openQuiz: () => set({ open: true }),
  closeQuiz: () => set({ open: false }),
}))

/** English copy doubles as translation keys. */
export const QUIZ_GOALS: { id: QuizGoal; label: string; hint: string }[] = [
  { id: 'sleep', label: 'Sleep better', hint: 'fall asleep faster, wake up fresh' },
  { id: 'relax', label: 'Unwind', hint: 'a calm evening after a hard day' },
  { id: 'focus', label: 'Focus', hint: 'a clear head without stimulants' },
  { id: 'recovery', label: 'Recover', hint: 'muscles and joints after training' },
  { id: 'balance', label: 'Stay balanced', hint: 'an even mood every day' },
  { id: 'energy', label: 'Feel energised', hint: 'a gentle lift without caffeine' },
]

export const QUIZ_FORMS: { id: QuizForm; label: string }[] = [
  { id: 'any', label: 'Any format' },
  { id: 'oils', label: 'Oil under the tongue' },
  { id: 'flowers', label: 'Flowers' },
  { id: 'edibles', label: 'Gummies' },
  { id: 'cosmetics', label: 'Cream or balm' },
  { id: 'tea', label: 'Tea' },
]

export const QUIZ_EXPERIENCE: { id: QuizExperience; label: string }[] = [
  { id: 'new', label: 'First time' },
  { id: 'some', label: 'Tried it a few times' },
  { id: 'regular', label: 'Use it regularly' },
]

export function recommend(products: Product[], goal: QuizGoal, form: QuizForm, exp: QuizExperience): Product[] {
  return products
    .map((p) => {
      let score = 0
      if (p.effects[0] === goal) score += 4
      else if (p.effects.includes(goal)) score += 2.5
      if (form !== 'any') score += p.category === form ? 3 : -1.5
      if (exp === 'new') {
        if (p.category === 'oils' && p.cbd <= 10) score += 1.5
        if (p.category === 'edibles' || p.category === 'tea') score += 1
        if (p.category === 'flowers' && p.cbd > 18) score -= 1
      }
      if (exp === 'regular') {
        if (p.cbd >= 15 && (p.category === 'flowers' || p.category === 'oils')) score += 1.5
      }
      score += p.rating * 0.3
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p)
}
