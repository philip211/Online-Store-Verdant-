import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import { Reveal } from './Reveal'

interface Props {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
  action?: ReactNode
}

export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'light', className, action }: Props) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <span className={cn('eyebrow mb-3', tone === 'dark' && 'text-gold-400')}>
            <span className="h-px w-6 bg-current" />
            {eyebrow}
          </span>
        )}
        <h2
          className={cn(
            'text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl',
            tone === 'dark' ? 'text-forest-50' : 'text-forest-50',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn('mt-4 text-base leading-relaxed', tone === 'dark' ? 'text-forest-100' : 'text-forest-200')}>
            {description}
          </p>
        )}
      </div>
      {action}
    </Reveal>
  )
}
