import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Gift, Send } from 'lucide-react'
import { toast } from 'sonner'
import { api, errorMessage } from '@/shared/api'
import { useT } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Button } from '@/shared/ui'

export function NewsletterForm({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error(t('Please check your e-mail address'))
      return
    }
    setLoading(true)
    try {
      await api.post('/newsletter', { email })
      setDone(true)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('WELCOME10')
      toast.success(t('Promo code copied'))
    } catch {
      toast('WELCOME10')
    }
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex flex-col items-start gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between', tone === 'dark' ? 'border-gold-500/40 bg-forest-900/60' : 'border-white/15 bg-white/10')}
          >
            <div className="flex items-center gap-3">
              <Gift className="size-6 text-gold-400" />
              <div>
                <div className="font-semibold text-forest-50">
                  {t('Your promo code')}: <span className="tracking-widest">WELCOME10</span>
                </div>
                <div className="text-xs text-forest-200">{t('10% off your first order')}</div>
              </div>
            </div>
            <Button variant="gold" size="sm" onClick={copy}>
              <Copy className="size-3.5" /> {t('Copy')}
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Your e-mail')}
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm text-forest-50 placeholder:text-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-300/30"
            />
            <Button type="submit" variant="gold" size="lg" loading={loading} shine className="sm:min-w-40">
              <Send className="size-4" /> {t('Get 10% off')}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
      {!done && <p className="mt-2 px-2 text-xs text-forest-400">{t('By subscribing you agree to receive marketing e-mails. Unsubscribe anytime.')}</p>}
    </div>
  )
}
