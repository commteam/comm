import { cn } from '../../../shared/utils/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-fluent bg-fluent-neutral-30 dark:bg-fluent-neutral-120 animate-pulse',
        className,
      )}
    />
  )
}
