import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

export function Marquee({ children, className, speed = 38 }: { children: ReactNode; className?: string; speed?: number }) {
  return (
    <div className={cn('overflow-hidden mask-fade-x', className)}>
      <div className="flex w-max animate-marquee gap-10" style={{ animationDuration: speed + 's' }}>
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
