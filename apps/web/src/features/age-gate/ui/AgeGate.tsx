import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { LEGAL_AGE, STORE_NAME, THC_LIMIT_PERCENT } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { Button, HempLeaf, LeafField, Modal } from '@/shared/ui'
import { useAgeGate } from '../model/store'

export function AgeGate() {
  const { t } = useT()
  const verified = useAgeGate((s) => s.verified)
  const confirm = useAgeGate((s) => s.confirm)
  const [denied, setDenied] = useState(false)

  return (
    <Modal open={!verified} onClose={() => {}} dismissible={false} size="md" className="border-glow-dark bg-forest-950 text-forest-50">
      <div className="relative overflow-hidden px-8 py-10 text-center">
        <LeafField className="-z-10" />
        <div className="relative mx-auto mb-6 grid size-16 place-items-center rounded-full border border-gold-500/50 bg-forest-900">
          <HempLeaf className="size-8 text-gold-400" />
        </div>
        <p className="eyebrow justify-center text-gold-400">{STORE_NAME} · {t('Age verification')}</p>
        <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
          {t('Are you {age} or older?', { age: LEGAL_AGE }).split(String(LEGAL_AGE))[0]}
          <span className="text-gradient-gold">{LEGAL_AGE}</span>
          {t('Are you {age} or older?', { age: LEGAL_AGE }).split(String(LEGAL_AGE))[1]}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-forest-100">
          {t('We sell legal hemp products with less than {thc}% THC. Sales are restricted to adults.', { thc: THC_LIMIT_PERCENT })}
        </p>

        {denied ? (
          <p className="mt-8 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {t('Sorry, this shop is only available to customers aged {age} and over.', { age: LEGAL_AGE })}
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="gold" size="lg" shine onClick={confirm} className="sm:min-w-44">
              <ShieldCheck className="size-4" /> {t('Yes, I am {age}+', { age: LEGAL_AGE })}
            </Button>
            <Button variant="outline" size="lg" onClick={() => setDenied(true)} className="sm:min-w-44">
              {t('No')}
            </Button>
          </div>
        )}

        <p className="mt-6 text-xs text-forest-300">{t('By clicking “Yes” you confirm your age and accept our privacy policy.')}</p>
      </div>
    </Modal>
  )
}
