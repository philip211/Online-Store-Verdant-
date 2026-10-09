import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn, useLockBodyScroll } from '@/shared/lib'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  dismissible?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

export function Modal({ open, onClose, children, className, dismissible = true, size = 'md' }: ModalProps) {
  useLockBodyScroll(open)
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, dismissible])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm"
            onClick={dismissible ? onClose : undefined}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'relative w-full max-h-[calc(100dvh-1rem)] overflow-y-auto overscroll-contain rounded-t-3xl bg-forest-950/90 backdrop-blur-xl shadow-2xl sm:max-h-[90vh] sm:rounded-3xl',
              sizes[size],
              className,
            )}
          >
            {dismissible && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full glass-card text-forest-200 transition hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
