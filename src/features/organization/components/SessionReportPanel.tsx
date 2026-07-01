import { motion } from 'framer-motion'
import { CheckCircle2, SkipForward, AlertTriangle, TrendingUp, Clock, Download } from 'lucide-react'
import { Card } from '../../../app/components/ui/Card'
import { Button } from '../../../app/components/ui/Button'
import type { SessionReport } from '../../../shared/types/intelligence'

interface Props {
  report: SessionReport
  snapshotId?: string
  onUndo?: () => void
  onDone: () => void
}

export function SessionReportPanel({ report, snapshotId, onUndo, onDone }: Props) {
  const healthDelta = report.healthAfter - report.healthBefore
  const success = report.filesOrganized > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center pb-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
          success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
        }`}>
          <CheckCircle2 size={28} className={success ? 'text-green-600' : 'text-amber-600'} />
        </div>
        <h2 className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Organization Complete
        </h2>
        <p className="text-fluent-neutral-80 text-sm mt-1">
          Session finished {new Date(report.createdAt).toLocaleTimeString()}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <ReportStat
          icon={<CheckCircle2 size={18} className="text-green-600" />}
          label="Files Organized"
          value={report.filesOrganized}
          color="green"
        />
        <ReportStat
          icon={<SkipForward size={18} className="text-amber-600" />}
          label="Files Skipped"
          value={report.filesSkipped}
          color="amber"
        />
        <ReportStat
          icon={<AlertTriangle size={18} className="text-red-500" />}
          label="Failed"
          value={report.filesFailed}
          color={report.filesFailed > 0 ? 'red' : 'neutral'}
        />
      </div>

      {/* Health improvement */}
      <Card padding="md" className="bg-gradient-to-r from-fluent-accent/5 to-blue-500/5 border-fluent-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-fluent-neutral-80 mb-1">Desktop Health</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                {report.healthBefore}
              </span>
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {report.healthAfter}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-fluent-neutral-80 mb-1">Improvement</p>
            <span className={`text-xl font-bold ${healthDelta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
              {healthDelta >= 0 ? '+' : ''}{healthDelta}
            </span>
          </div>
        </div>
      </Card>

      {/* Time saved */}
      <div className="flex items-center gap-2 text-sm text-fluent-neutral-80 bg-fluent-neutral-10 dark:bg-fluent-neutral-120 rounded-fluent px-4 py-2.5">
        <Clock size={14} />
        <span>Estimated time saved: <strong className="text-fluent-neutral-140 dark:text-fluent-neutral-10">{report.timeSavedMinutes} minutes</strong></span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {snapshotId && onUndo && (
          <Button variant="ghost" onClick={onUndo} size="sm">
            Undo Organization
          </Button>
        )}
        <Button variant="ghost" size="sm">
          <Download size={14} /> Export Report
        </Button>
        <Button variant="primary" onClick={onDone} className="ml-auto">
          Done
        </Button>
      </div>
    </motion.div>
  )
}

function ReportStat({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'green' | 'amber' | 'red' | 'neutral'
}) {
  const bg = {
    green: 'bg-green-50 dark:bg-green-950/20',
    amber: 'bg-amber-50 dark:bg-amber-950/20',
    red: 'bg-red-50 dark:bg-red-950/20',
    neutral: 'bg-fluent-neutral-10 dark:bg-fluent-neutral-120',
  }[color]

  return (
    <div className={`rounded-fluent p-3 text-center ${bg}`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">{value}</div>
      <p className="text-xs text-fluent-neutral-80 mt-0.5">{label}</p>
    </div>
  )
}
