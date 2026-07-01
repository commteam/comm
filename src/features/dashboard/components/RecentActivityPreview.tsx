import { ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '../../../app/components/ui/Card'
import { Button } from '../../../app/components/ui/Button'
import { formatRelativeTime } from '../../../shared/utils'
import { TimelineDot } from '../../timeline/components/TimelineDot'
import type { TimelineEntry } from '../../../shared/types'

interface RecentActivityPreviewProps {
  onViewAll: () => void
}

const api = () => (window as any).electronAPI

export function RecentActivityPreview({ onViewAll }: RecentActivityPreviewProps) {
  const [entries, setEntries] = useState<TimelineEntry[]>([])

  useEffect(() => {
    api().getTimelineEntries(5)
      .then((res: { success: boolean; data: TimelineEntry[] }) => {
        if (res.success) setEntries(res.data)
      })
      .catch(() => { })
  }, [])

  if (entries.length === 0) return null

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="xs" onClick={onViewAll} iconRight={<ChevronRight size={12} />}>
          View all
        </Button>
      </CardHeader>
      <div className="space-y-2">
        {entries.map(entry => (
          <div key={entry.id} className="flex items-center gap-3 py-1.5 px-2 rounded-fluent hover:bg-fluent-neutral-10 dark:hover:bg-fluent-neutral-120 transition-colors">
            <TimelineDot type={entry.type} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{entry.title}</p>
              <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 truncate">{entry.description}</p>
            </div>
            <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 shrink-0">
              {formatRelativeTime(new Date(entry.timestamp))}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
