import { useState } from 'react'
import { Check, Ticket, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/entities/cart'
import { PROMO_CODES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { Button } from '@/shared/ui'

export function PromoCodeForm() {
  const { t } = useT()
  const promoCode = useCartStore((s) => s.promoCode)
  const applyPromo = useCartStore((s) => s.applyPromo)
  const clearPromo = useCartStore((s) => s.clearPromo)
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!value.trim()) return
    const res = applyPromo(value)
    if (res.ok) {
      toast.success(t('Promo code applied'), { description: res.message })
      setValue('')
      setError(null)
    } else setError(res.message)
  }

  if (promoCode) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-forest-300/40 bg-forest-300/10 px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Check className="size-4 text-forest-300" />
          <span className="font-semibold text-forest-50">{promoCode}</span>
          <span className="text-forest-200">· {t(PROMO_CODES[promoCode]?.label ?? '')}</span>
        </div>
        <button onClick={clearPromo} aria-label={t('Remove promo code')} className="text-forest-300 hover:text-forest-50">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest-400" />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={t('Promo code')}
            className="h-11 w-full rounded-full border border-white/15 glass-card pl-11 pr-4 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-forest-400 focus:border-forest-300 focus:outline-none"
          />
        </div>
        <Button type="button" variant="outline" disabled={!value.trim()} onClick={submit}>
          {t('Apply')}
        </Button>
      </div>
      {error && <p className="px-2 text-xs text-rose-300">{error}</p>}
      <p className="px-2 text-xs text-forest-300">{t('Try WELCOME10 for 10% off your first order')}</p>
    </div>
  )
}
