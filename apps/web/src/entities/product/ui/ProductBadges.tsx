import { Flame, Leaf, Sprout, Tag, Timer } from 'lucide-react'
import { useT } from '@/shared/i18n'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib'
import { BADGE_LABELS, type ProductBadge } from '../model/types'

const config: Record<ProductBadge, { tone: 'forest' | 'gold' | 'cream' | 'danger' | 'dark' | 'outline'; icon: typeof Flame }> = {
  hit: { tone: 'gold', icon: Flame },
  new: { tone: 'forest', icon: Sprout },
  sale: { tone: 'outline', icon: Tag },
  limited: { tone: 'dark', icon: Timer },
  organic: { tone: 'cream', icon: Leaf },
}

export function ProductBadges({ badges, className, max = 2 }: { badges: ProductBadge[]; className?: string; max?: number }) {
  const { t } = useT()
  if (!badges.length) return null
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {badges.slice(0, max).map((b, i) => {
        const Icon = config[b].icon
        return (
          <Badge key={b} tone={config[b].tone} className={cn('whitespace-nowrap px-2.5 text-xs tracking-[0.1em]', i > 0 && 'hidden sm:inline-flex')}>
            <Icon className="size-3" />
            {t(BADGE_LABELS[b])}
          </Badge>
        )
      })}
    </div>
  )
}
