import type { TimelineEntryType } from '../../../shared/types'
import { cn } from '../../../shared/utils/cn'

const typeConfig: Record<TimelineEntryType, { color: string; bg: string }> = {
  file_moved: { color: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  file_skipped: { color: 'bg-fluent-neutral-70', bg: 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120' },
  file_rejected: { color: 'bg-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  folder_created: { color: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  rule_created: { color: 'bg-teal-500', bg: 'bg-teal-100 dark:bg-teal-900/30' },
  session_started: { color: 'bg-fluent-accent', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  session_completed: { color: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  scan_completed: { color: 'bg-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  undo_performed: { color: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  first_run: { color: 'bg-fluent-accent', bg: 'bg-blue-100 dark:bg-blue-900/30' },
}

interface TimelineDotProps {
  type: TimelineEntryType
  size?: 'sm' | 'md'
}

export function TimelineDot({ type, size = 'md' }: TimelineDotProps) {
  const cfg = typeConfig[type] ?? typeConfig.file_moved
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
  return (
    <div className={cn('rounded-full shrink-0', cfg.color, sizeClass)} />
  )
}
