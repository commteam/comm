import { cn } from '../../../shared/utils/cn'

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.9 ? 'text-green-600 dark:text-green-400'
    : value >= 0.7 ? 'text-blue-600 dark:text-blue-400'
    : value >= 0.5 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-500'

  const barColor = value >= 0.9 ? 'bg-green-500'
    : value >= 0.7 ? 'bg-blue-500'
    : value >= 0.5 ? 'bg-amber-500'
    : 'bg-red-400'

  return (
    <div className="flex flex-col items-end gap-0.5 shrink-0 w-14">
      <span className={cn('text-xs font-bold tabular-nums', color)}>{pct}%</span>
      <div className="w-full h-1.5 bg-fluent-neutral-30 dark:bg-fluent-neutral-110 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', barColor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
