import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calculator } from 'lucide-react'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'

type Goal = 'balance' | 'sleep' | 'recovery' | 'focus'
type Experience = 'new' | 'some' | 'regular'

const GOALS: Record<Goal, { label: string; factor: number; product: string; slug: string }> = {
  balance: { label: 'Calm & balance', factor: 1, product: 'Daily Oil 5%', slug: 'daily-oil-5' },
  sleep: { label: 'Deep sleep', factor: 1.4, product: 'Night Oil CBD + CBN', slug: 'sleep-oil-cbn' },
  recovery: { label: 'Recovery', factor: 1.3, product: 'Full Spectrum Oil 10%', slug: 'full-spectrum-oil-10' },
  focus: { label: 'Focus & productivity', factor: 0.8, product: 'Focus CBD Gummies', slug: 'focus-gummies' },
}

const EXP: Record<Experience, { label: string; factor: number }> = {
  new: { label: 'First time', factor: 0.7 },
  some: { label: 'Tried it', factor: 1 },
  regular: { label: 'Regular user', factor: 1.4 },
}

export function DoseCalculator({ className }: { className?: string }) {
  const { t } = useT()
  const [weight, setWeight] = useState(70)
  const [goal, setGoal] = useState<Goal>('balance')
  const [exp, setExp] = useState<Experience>('new')

  const mg = useMemo(() => Math.round(weight * 0.25 * GOALS[goal].factor * EXP[exp].factor), [weight, goal, exp])
  const drops5 = Math.max(1, Math.round(mg / 1.7))
  const drops10 = Math.max(1, Math.round(mg / 3.4))

  return (
    <div className={cn('border-glow-dark rounded-3xl border border-gold-500/30 bg-forest-950 p-6 text-forest-50 shadow-glow sm:p-8', className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-forest-800 text-gold-400">
          <Calculator className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-semibold">{t('Dose calculator')}</h3>
          <p className="text-xs text-forest-200">{t('A starting point only, not medical advice.')}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-forest-200">
              <span>{t('Body weight')}</span>
              <span className="font-semibold text-gold-300">{weight} kg</span>
            </div>
            <input type="range" min={40} max={140} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-gold-500" aria-label={t('Body weight')} />
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.12em] text-forest-200">{t('Goal')}</div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(GOALS) as Goal[]).map((g) => (
                <button key={g} onClick={() => setGoal(g)} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-medium transition', goal === g ? 'border-gold-500 bg-gold-500/15 text-gold-200' : 'border-forest-700 text-forest-200 hover:border-forest-500')}>
                  {t(GOALS[g].label)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.12em] text-forest-200">{t('Experience with CBD')}</div>
            <div className="flex gap-2">
              {(Object.keys(EXP) as Experience[]).map((e) => (
                <button key={e} onClick={() => setExp(e)} className={cn('flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition', exp === e ? 'border-gold-500 bg-gold-500/15 text-gold-200' : 'border-forest-700 text-forest-200 hover:border-forest-500')}>
                  {t(EXP[e].label)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.div key={mg} initial={{ opacity: 0.4, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col justify-between rounded-2xl bg-forest-900/80 p-5 ring-1 ring-white/5">
          <div>
            <div className="text-xs uppercase tracking-[0.12em] text-forest-200">{t('Suggested daily dose')}</div>
            <div className="mt-2 font-display text-6xl font-semibold text-gradient-gold">
              {mg} <span className="text-3xl">mg</span>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm text-forest-100">
              <li>≈ {t('{count} drops of 5% oil', { count: drops5 })}</li>
              <li>≈ {t('{count} drops of 10% oil', { count: drops10 })}</li>
              <li>{t('Split into two servings: morning and evening')}</li>
            </ul>
          </div>
          <Link to={ROUTES.product(GOALS[goal].slug)} className="mt-5 inline-flex items-center justify-between rounded-xl border border-gold-500/40 px-4 py-3 text-sm font-semibold text-gold-200 transition hover:bg-gold-500 hover:text-forest-950">
            {t('Suggested')}: {GOALS[goal].product}
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
