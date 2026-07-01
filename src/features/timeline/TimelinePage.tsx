import { Clock, FolderOpen, Undo2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Button } from '../../app/components/ui/Button'
import { Badge } from '../../app/components/ui/Badge'
import { TimelineDot } from './components/TimelineDot'
import { mockTimelineEntries } from '../../shared/mock'
import { formatRelativeTime } from '../../shared/utils'
import type { TimelineEntry } from '../../shared/types'

type GroupKey = 'Today' | 'Yesterday' | 'Last Week' | 'Older'

function getGroup(date: Date): GroupKey {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays < 1) return 'Today'
  if (diffDays < 2) return 'Yesterday'
  if (diffDays < 7) return 'Last Week'
  return 'Older'
}

const GROUP_ORDER: GroupKey[] = ['Today', 'Yesterday', 'Last Week', 'Older']

function groupEntries(entries: TimelineEntry[]) {
  const groups: Partial<Record<GroupKey, TimelineEntry[]>> = {}
  for (const entry of entries) {
    const key = getGroup(new Date(entry.timestamp))
    if (!groups[key]) groups[key] = []
    groups[key]!.push(entry)
  }
  return groups
}

const typeLabels: Record<string, { label: string; variant: 'success' | 'muted' | 'error' | 'info' | 'accent' | 'warning' }> = {
  file_moved: { label: 'Moved', variant: 'success' },
  file_skipped: { label: 'Skipped', variant: 'muted' },
  file_rejected: { label: 'Rejected', variant: 'error' },
  folder_created: { label: 'Folder', variant: 'info' },
  rule_created: { label: 'Rule', variant: 'accent' },
  session_started: { label: 'Session', variant: 'info' },
  session_completed: { label: 'Session', variant: 'success' },
  scan_completed: { label: 'Scan', variant: 'warning' },
  undo_performed: { label: 'Undo', variant: 'warning' },
  first_run: { label: 'Install', variant: 'accent' },
}

export function TimelinePage() {
  const grouped = groupEntries(mockTimelineEntries)

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Timeline"
        description="Everything DeskPilot AI has done, in chronological order"
        icon={<Clock size={18} />}
        actions={
          <Button variant="secondary" size="sm" icon={<Undo2 size={13} />}>
            Undo Last Session
          </Button>
        }
      />

      <div className="space-y-6">
        {GROUP_ORDER.map(group => {
          const entries = grouped[group]
          if (!entries || entries.length === 0) return null
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-bold text-fluent-neutral-80 dark:text-fluent-neutral-90 uppercase tracking-widest">{group}</h2>
                <div className="flex-1 h-px bg-fluent-neutral-30 dark:bg-fluent-neutral-120" />
              </div>

              <div className="relative pl-5">
                {/* Vertical line */}
                <div className="absolute left-1.5 top-0 bottom-0 w-px bg-fluent-neutral-30 dark:bg-fluent-neutral-120" />

                <div className="space-y-2">
                  {entries.map((entry, i) => (
                    <TimelineCard key={entry.id} entry={entry} index={i} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}

function TimelineCard({ entry, index }: { entry: TimelineEntry; index: number }) {
  const meta = typeLabels[entry.type] ?? { label: 'Event', variant: 'muted' as const }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="relative"
    >
      {/* Dot */}
      <div className="absolute -left-[17px] top-3.5">
        <TimelineDot type={entry.type} />
      </div>

      <Card hover padding="sm" className="flex items-start gap-3">
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2 mb-0.5">
            <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
            <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">
              {formatRelativeTime(new Date(entry.timestamp))}
            </span>
          </div>
          <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{entry.title}</p>
          {entry.description && (
            <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mt-0.5">{entry.description}</p>
          )}
          {entry.filePath && entry.targetPath && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">
              <span className="font-mono truncate max-w-[160px]">{entry.filePath.split('/').pop()}</span>
              <ArrowRight size={10} className="shrink-0" />
              <FolderOpen size={10} className="text-amber-500 shrink-0" />
              <span>{entry.targetPath.split('/')[0]}</span>
            </div>
          )}
        </div>
        {entry.type === 'file_moved' && (
          <Button variant="ghost" size="xs" icon={<Undo2 size={11} />} className="shrink-0 mt-0.5">
            Undo
          </Button>
        )}
      </Card>
    </motion.div>
  )
}
