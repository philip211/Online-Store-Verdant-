import { cn } from '@/shared/lib'

export const Skeleton = ({ className }: { className?: string }) => <div className={cn('skeleton', className)} />

export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
