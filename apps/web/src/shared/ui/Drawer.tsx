import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn, useLockBodyScroll } from '@/shared/lib'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  side?: 'left' | 'right'
  className?: string
}

export function Drawer({ open, onClose, title, children, footer, side = 'right', className }: DrawerProps) {
  useLockBodyScroll(open)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const offscreen = side === 'right' ? '100%' : '-100%'

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]">
          <motion.div
            className="absolute inset-0 bg-forest-950/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal
            initial={{ x: offscreen }}
            animate={{ x: 0 }}
            exit={{ x: offscreen }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={cn(
              'absolute top-0 flex h-full w-full max-w-md flex-col bg-forest-950/90 backdrop-blur-xl shadow-2xl',
              side === 'right' ? 'right-0' : 'left-0',
              className,
            )}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="font-display text-2xl font-semibold text-forest-50">{title}</div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-full text-forest-300 transition hover:bg-white/10"
              >
                <X className="size-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <footer className="border-t border-white/10 px-5 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
