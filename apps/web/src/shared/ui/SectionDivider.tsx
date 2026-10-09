import { motion } from 'framer-motion'
import { cn } from '@/shared/lib'
import { HempLeaf } from './HempLeaf'

/** Hairline gold divider with a leaf glyph that draws itself in when scrolled into view. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn('container-x flex items-center gap-4', className)} aria-hidden>
      <motion.span
        className="h-px flex-1 origin-right bg-gradient-to-l from-gold-500/70 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.span
        initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
        whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 160, damping: 14 }}
        className="grid size-9 place-items-center rounded-full border border-gold-500/40 bg-forest-950/80 text-gold-400"
      >
        <HempLeaf className="size-4" />
      </motion.span>
      <motion.span
        className="h-px flex-1 origin-left bg-gradient-to-r from-gold-500/70 to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
