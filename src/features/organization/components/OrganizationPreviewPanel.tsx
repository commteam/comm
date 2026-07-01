import { motion } from 'framer-motion'
import { ArrowRight, Clock, FolderOpen, TrendingUp } from 'lucide-react'
import { Card } from '../../../app/components/ui/Card'
import { ProgressBar } from '../../../app/components/ui/ProgressBar'
import type { OrganizationPreview } from '../../../shared/types/intelligence'

interface Props {
  preview: OrganizationPreview
}

export function OrganizationPreviewPanel({ preview }: Props) {
  const estimatedSec = Math.round(preview.estimatedDurationMs / 1000)
  const healthDelta = preview.healthAfter - preview.healthBefore

  return (
    <div className="space-y-4">
      {/* Before / After health */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="md" className="text-center">
          <p className="text-xs text-fluent-neutral-80 mb-1">Desktop Health Before</p>
          <div className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2">
            {preview.healthBefore}
          </div>
          <ProgressBar value={preview.healthBefore} max={100} variant="accent" size="sm" />
        </Card>

        <Card padding="md" className="text-center">
          <p className="text-xs text-fluent-neutral-80 mb-1">Desktop Health After</p>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {preview.healthAfter}
          </div>
          <ProgressBar value={preview.healthAfter} max={100} variant="success" size="sm" />
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox
          icon={<ArrowRight size={14} />}
          label="Files to Move"
          value={String(preview.totalFiles)}
          color="blue"
        />
        <StatBox
          icon={<FolderOpen size={14} />}
          label="Folders Used"
          value={String(preview.foldersUsed)}
          color="purple"
        />
        <StatBox
          icon={<TrendingUp size={14} />}
          label="Health Gain"
          value={`+${healthDelta}`}
          color="green"
        />
        <StatBox
          icon={<Clock size={14} />}
          label="Est. Duration"
          value={estimatedSec < 60 ? `${estimatedSec}s` : `${Math.ceil(estimatedSec / 60)}m`}
          color="amber"
        />
      </div>

      {/* Group breakdown */}
      <Card padding="md">
        <p className="text-xs font-semibold text-fluent-neutral-80 uppercase tracking-wide mb-3">Files to Organize</p>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {preview.groups
            .filter(g => g.approved !== false && g.items.filter(i => i.approved !== false).length > 0)
            .map(group => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-1.5 border-b border-fluent-neutral-20 dark:border-fluent-neutral-110 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderOpen size={13} className="text-fluent-accent flex-shrink-0" />
                  <span className="text-sm text-fluent-neutral-120 dark:text-fluent-neutral-50 truncate">{group.targetFolderName}</span>
                </div>
                <span className="text-xs text-fluent-neutral-80 flex-shrink-0 ml-2">
                  {group.items.filter(i => i.approved !== false).length} file{group.items.filter(i => i.approved !== false).length !== 1 ? 's' : ''}
                </span>
              </motion.div>
            ))}
        </div>
      </Card>
    </div>
  )
}

function StatBox({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: 'blue' | 'purple' | 'green' | 'amber'
}) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
  }
  return (
    <div className={`rounded-fluent p-3 text-center ${colorMap[color]}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <p className="text-xs opacity-80 mt-0.5">{label}</p>
    </div>
  )
}
