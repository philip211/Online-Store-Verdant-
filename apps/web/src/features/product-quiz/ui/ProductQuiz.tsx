import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react'
import { CATEGORY_LABELS, EffectIcon, getMinPrice, ProductVisual, useCatalog } from '@/entities/product'
import { ROUTES } from '@/shared/config'
import { useT } from '@/shared/i18n'
import { cn, formatPrice } from '@/shared/lib'
import { Button, Modal, Stars } from '@/shared/ui'
import { QUIZ_EXPERIENCE, QUIZ_FORMS, QUIZ_GOALS, recommend, useQuiz, type QuizExperience, type QuizForm, type QuizGoal } from '../model/store'

const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } }

export function ProductQuiz() {
  const { t } = useT()
  const open = useQuiz((s) => s.open)
  const close = useQuiz((s) => s.closeQuiz)
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<QuizGoal | null>(null)
  const [form, setForm] = useState<QuizForm>('any')
  const [exp, setExp] = useState<QuizExperience | null>(null)
  const catalog = useCatalog()
  const results = useMemo(() => (goal && exp ? recommend(catalog, goal, form, exp) : []), [catalog, goal, form, exp])

  const reset = () => {
    setStep(0)
    setGoal(null)
    setForm('any')
    setExp(null)
  }
  const handleClose = () => {
    close()
    setTimeout(reset, 300)
  }

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between pr-10">
          <p className="eyebrow">
            <Compass className="size-3.5" /> {t('30-second match')}
          </p>
          <span className="text-xs font-semibold text-forest-300">{t('Step {step} of 3', { step: Math.min(step + 1, 3) })}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-forest-300" animate={{ width: `${((step + 1) / 4) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" {...slide} className="mt-6">
              <h3 className="font-display text-3xl font-semibold text-forest-50">{t('What is your main goal?')}</h3>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {QUIZ_GOALS.map((g) => (
                  <Option key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>
                    <EffectIcon effect={g.id} className="text-xl" />
                    <span>
                      <span className="block font-semibold">{t(g.label)}</span>
                      <span className="block text-xs text-forest-300">{t(g.hint)}</span>
                    </span>
                  </Option>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" {...slide} className="mt-6">
              <h3 className="font-display text-3xl font-semibold text-forest-50">{t('Which format do you prefer?')}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {QUIZ_FORMS.map((f) => (
                  <Chip key={f.id} active={form === f.id} onClick={() => setForm(f.id)}>{t(f.label)}</Chip>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" {...slide} className="mt-6">
              <h3 className="font-display text-3xl font-semibold text-forest-50">{t('How familiar are you with CBD?')}</h3>
              <div className="mt-5 grid gap-2">
                {QUIZ_EXPERIENCE.map((e) => (
                  <Option key={e.id} active={exp === e.id} onClick={() => setExp(e.id)}>
                    <span className="font-semibold">{t(e.label)}</span>
                  </Option>
                ))}
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" {...slide} className="mt-6">
              <h3 className="font-display text-3xl font-semibold text-forest-50">{t('Your best matches')}</h3>
              <p className="mt-1 text-sm text-forest-300">{t('Top three picks by goal, format and experience.')}</p>
              <ul className="mt-5 space-y-3">
                {results.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn('flex items-center gap-4 rounded-2xl border p-3', i === 0 ? 'border-gold-500 bg-gold-300/20' : 'border-white/15 glass-card')}
                  >
                    <Link to={ROUTES.product(p.slug)} onClick={handleClose} className="size-20 shrink-0 overflow-hidden rounded-xl">
                      <ProductVisual product={p} variant="thumb" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      {i === 0 && <span className="text-xs font-bold uppercase tracking-[0.12em] text-gold-400">{t('Best match')}</span>}
                      <Link to={ROUTES.product(p.slug)} onClick={handleClose} className="block font-display text-lg font-semibold leading-tight text-forest-50 hover:underline sm:truncate sm:text-xl">{p.name}</Link>
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-forest-300">
                        <span className="whitespace-nowrap">{t(CATEGORY_LABELS[p.category])}</span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap"><Stars value={p.rating} size={11} /> {p.rating}</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums sm:hidden">{t('from')} {formatPrice(getMinPrice(p))}</div>
                    </div>
                    <div className="hidden text-right sm:block">
                      <div className="font-semibold tabular-nums">{t('from')} {formatPrice(getMinPrice(p))}</div>
                      <Link to={ROUTES.product(p.slug)} onClick={handleClose} className="text-xs font-semibold text-forest-300 hover:underline">{t('Details')}</Link>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="size-4" /> {t('Back')}</Button>
          ) : <span />}
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && !goal) || (step === 2 && !exp)} shine>
              {step === 2 ? t('Show my matches') : t('Next')} <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button variant="outline" onClick={reset}>{t('Start over')}</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('flex items-center gap-3 rounded-2xl border p-4 text-left transition-all', active ? 'border-forest-300 bg-forest-300/15 shadow-soft' : 'border-white/15 glass-card hover:border-forest-300/60')}>
      {children}
    </button>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('rounded-full border px-4 py-2 text-sm font-medium transition', active ? 'border-forest-300 bg-forest-300 text-forest-950' : 'border-white/15 glass-card text-forest-100 hover:border-forest-300/60')}>
      {children}
    </button>
  )
}
