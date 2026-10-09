import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateReview } from '@/entities/review'
import type { Product } from '@/entities/product'
import { errorMessage } from '@/shared/api'
import { useT } from '@/shared/i18n'
import { Button, Input, Modal, Stars, Textarea } from '@/shared/ui'

const schema = z.object({
  author: z.string().min(2, 'Please enter your name'),
  city: z.string().min(2, 'Please enter your city'),
  title: z.string().min(3, 'The title is too short').max(80),
  text: z.string().min(20, 'Please tell us a bit more (at least 20 characters)').max(1000),
})
type Form = z.infer<typeof schema>

export function WriteReviewModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { t } = useT()
  const createReview = useCreateReview()
  const [rating, setRating] = useState(5)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) })
  const err = (m?: string) => (m ? t(m) : undefined)
  const RATING_WORDS = ['', 'Poor', 'Fair', 'Okay', 'Good', 'Excellent']

  const submit = async (data: Form) => {
    try {
      await createReview.mutateAsync({ ...data, rating, productId: product.id })
      toast.success(t('Thanks for your review!'), { description: t('It is live now and will help other customers.') })
      reset()
      setRating(5)
      onClose()
    } catch (e) {
      toast.error(t('Could not submit the review'), { description: errorMessage(e) })
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <form onSubmit={handleSubmit(submit)} className="space-y-5 p-6 sm:p-8">
        <div>
          <p className="eyebrow">
            <PenLine className="size-3.5" /> {t('Product review')}
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-forest-50">{product.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-forest-200">{t('Your rating')}</span>
          <Stars value={rating} size={26} interactive onChange={setRating} />
          <span className="text-sm text-forest-300">{t(RATING_WORDS[rating])}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('Name')} placeholder={t('How should we sign it?')} {...register('author')} error={err(errors.author?.message)} />
          <Input label={t('City')} placeholder="Berlin" {...register('city')} error={err(errors.city?.message)} />
        </div>
        <Input label={t('Title')} placeholder={t('The gist in a few words')} {...register('title')} error={err(errors.title?.message)} />
        <Textarea label={t('Review')} placeholder={t('What you liked, the effect, who it suits')} {...register('text')} error={err(errors.text?.message)} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>{t('Cancel')}</Button>
          <Button type="submit" loading={createReview.isPending} shine>{t('Publish')}</Button>
        </div>
      </form>
    </Modal>
  )
}
