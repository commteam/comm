import { Activity, Filter, Search } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Input } from '../../app/components/ui/Input'
import { TimelineDot } from '../timeline/components/TimelineDot'
import { mockTimelineEntries } from '../../shared/mock'
import { formatDateTime } from '../../shared/utils'
import type { TimelineEntry } from '../../shared/types'

const FILTERS = ['All', 'Moved', 'Skipped', 'Rules', 'Sessions', 'Scans', 'Undone'] as const
type Filter = typeof FILTERS[number]

const filterMap: Record<Filter, string[]> = {
  All: [],
  Moved: ['file_moved'],
  Skipped: ['file_skipped', 'file_rejected'],
  Rules: ['rule_created'],
  Sessions: ['session_started', 'session_completed'],
  Scans: ['scan_completed'],
  Undone: ['undo_performed'],
}

export function ActivityPage() {
  const [filter, setFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')

  const filtered = mockTimelineEntries.filter(e => {
    const types = filterMap[filter]
    if (types.length > 0 && !types.includes(e.type)) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Activity"
        description="Complete history of all DeskPilot AI actions"
        icon={<Activity size={18} />}
      />

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                filter === f
                  ? 'bg-fluent-accent text-white shadow-fluent-2'
                  : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70 hover:bg-fluent-neutral-30 dark:hover:bg-fluent-neutral-110'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-36">
          <Input
            placeholder="Search activity…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={13} />}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-3">
        {filtered.length} event{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Activity list */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((entry, i) => (
            <ActivityRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}

function ActivityRow({ entry, index }: { entry: TimelineEntry; index: number }) {
  const typeColors: Record<string, string> = {
    file_moved: 'bg-green-50 dark:bg-green-950/20',
    file_skipped: 'bg-fluent-neutral-10 dark:bg-fluent-neutral-130',
    rule_created: 'bg-teal-50 dark:bg-teal-950/20',
    session_completed: 'bg-purple-50 dark:bg-purple-950/20',
    scan_completed: 'bg-amber-50 dark:bg-amber-950/20',
    undo_performed: 'bg-orange-50 dark:bg-orange-950/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-fluent transition-colors hover:shadow-fluent-2 ${typeColors[entry.type] ?? ''}`}
    >
      <TimelineDot type={entry.type} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{entry.title}</p>
        <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 truncate">{entry.description}</p>
      </div>
      <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 shrink-0 tabular-nums">
        {formatDateTime(new Date(entry.timestamp))}
      </span>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
      <Activity size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
      <p className="font-semibold mb-1">No activity found</p>
      <p className="text-sm">Try adjusting your filters or search.</p>
    </div>
  )
}
