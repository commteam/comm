import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useElectron } from '../../hooks/useElectron'
import { formatRelativeTime } from '../../shared/utils'
import type { TimelineEntry } from '../../shared/types'

export function TimelinePage() {
  const electron = useElectron()

  const { data: entries, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const res = await electron.getTimelineEntries(100)
      return (res.data ?? []) as TimelineEntry[]
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Timeline
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Everything DeskPilot AI has done, in order.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-fluent-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!entries || entries.length === 0) && (
        <div className="fluent-card p-12 text-center text-fluent-neutral-80 dark:text-fluent-neutral-80">
          <p className="text-sm font-medium mb-1">No activity yet</p>
          <p className="text-xs">Events will appear here as you use DeskPilot AI.</p>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-2 top-2 bottom-2 w-px bg-fluent-neutral-50 dark:bg-fluent-neutral-110" />

          <div className="space-y-4">
            {entries.map(entry => (
              <TimelineItem key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const dotColors: Record<string, string> = {
    file_moved: 'bg-green-500',
    file_skipped: 'bg-fluent-neutral-70',
    file_rejected: 'bg-red-400',
    folder_created: 'bg-blue-500',
    session_started: 'bg-fluent-accent',
    session_completed: 'bg-purple-500',
    scan_completed: 'bg-yellow-500',
    undo_performed: 'bg-orange-500',
    first_run: 'bg-fluent-accent',
    rule_created: 'bg-teal-500',
  }

  return (
    <div className="relative flex gap-4">
      <div className={`absolute -left-4 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-fluent-neutral-140 ${dotColors[entry.type] ?? 'bg-fluent-neutral-70'}`} />
      <div className="fluent-card flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20">
              {entry.title}
            </p>
            <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5">
              {entry.description}
            </p>
          </div>
          <span className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-90 shrink-0 mt-0.5">
            {formatRelativeTime(new Date(entry.timestamp))}
          </span>
        </div>
      </div>
    </div>
  )
}
