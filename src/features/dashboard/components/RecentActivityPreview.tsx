import { ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../../../app/components/ui/Card'
import { Button } from '../../../app/components/ui/Button'
import { mockTimelineEntries } from '../../../shared/mock'
import { formatRelativeTime } from '../../../shared/utils'
import { TimelineDot } from '../../timeline/components/TimelineDot'

interface RecentActivityPreviewProps {
  onViewAll: () => void
}

export function RecentActivityPreview({ onViewAll }: RecentActivityPreviewProps) {
  const recent = mockTimelineEntries.slice(0, 5)

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="xs" onClick={onViewAll} iconRight={<ChevronRight size={12} />}>
          View all
        </Button>
      </CardHeader>
      <div className="space-y-2">
        {recent.map(entry => (
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
