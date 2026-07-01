import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, FolderOpen, File } from 'lucide-react'
import { Button } from '../../../app/components/ui/Button'
import { Badge } from '../../../app/components/ui/Badge'
import type { RecommendationGroup } from '../../../shared/types/intelligence'

interface Props {
  group: RecommendationGroup
  onApproveGroup: () => void
  onRejectGroup: () => void
  onApproveFile: (fileId: string) => void
  onRejectFile: (fileId: string) => void
  onToggleExpand: () => void
}

export const RecommendationGroupCard = memo(function RecommendationGroupCard({
  group, onApproveGroup, onRejectGroup, onApproveFile, onRejectFile, onToggleExpand
}: Props) {
  const approvedCount = group.items.filter(i => i.approved === true).length
  const rejectedCount = group.items.filter(i => i.approved === false).length
  const pendingCount = group.items.filter(i => i.approved === null).length

  const confidencePct = Math.round(group.confidence * 100)
  const confidenceColor = confidencePct >= 90 ? 'text-green-600 dark:text-green-400'
    : confidencePct >= 70 ? 'text-amber-600 dark:text-amber-400'
    : 'text-red-600 dark:text-red-400'

  const borderColor = group.approved === false
    ? 'border-red-200 dark:border-red-900/40'
    : group.approved === true
    ? 'border-green-200 dark:border-green-900/40'
    : 'border-fluent-neutral-30 dark:border-fluent-neutral-100'

  const bgColor = group.approved === false
    ? 'bg-red-50/50 dark:bg-red-950/10'
    : group.approved === true
    ? 'bg-green-50/50 dark:bg-green-950/10'
    : 'bg-white dark:bg-fluent-neutral-130'

  return (
    <div className={`rounded-fluent-lg border ${borderColor} ${bgColor} overflow-hidden transition-colors`}>
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggleExpand}
          className="flex-shrink-0 text-fluent-neutral-80 hover:text-fluent-neutral-120 dark:hover:text-fluent-neutral-30 transition-colors"
        >
          {group.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FolderOpen size={16} className="text-fluent-accent flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-fluent-neutral-140 dark:text-fluent-neutral-10 truncate">
                {group.label}
              </span>
              <span className="text-xs text-fluent-neutral-80 flex-shrink-0">
                {group.fileCount} file{group.fileCount !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-fluent-neutral-60 flex-shrink-0">→</span>
              <span className="text-xs font-medium text-fluent-neutral-100 dark:text-fluent-neutral-50 flex-shrink-0 truncate">
                {group.targetFolderName}
              </span>
            </div>
            <p className="text-xs text-fluent-neutral-80 truncate mt-0.5">{group.reason}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-bold ${confidenceColor}`}>{confidencePct}%</span>

          {pendingCount > 0 && (
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                onClick={onRejectGroup}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <XCircle size={13} /> Skip all
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={onApproveGroup}
              >
                <CheckCircle2 size={13} /> Approve all
              </Button>
            </div>
          )}

          {group.approved === true && (
            <Badge variant="success" size="sm">Approved</Badge>
          )}
          {group.approved === false && (
            <Badge variant="error" size="sm">Skipped</Badge>
          )}
        </div>
      </div>

      {/* Status bar */}
      {(approvedCount > 0 || rejectedCount > 0) && (
        <div className="px-4 pb-2 flex gap-2 text-xs">
          {approvedCount > 0 && <span className="text-green-600 dark:text-green-400">{approvedCount} approved</span>}
          {rejectedCount > 0 && <span className="text-red-600 dark:text-red-400">{rejectedCount} skipped</span>}
          {pendingCount > 0 && <span className="text-fluent-neutral-80">{pendingCount} pending</span>}
        </div>
      )}

      {/* Expanded file list */}
      <AnimatePresence>
        {group.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-fluent-neutral-20 dark:border-fluent-neutral-110 divide-y divide-fluent-neutral-20 dark:divide-fluent-neutral-110">
              {group.items.map(item => (
                <div key={item.fileId} className="flex items-center gap-3 px-4 py-2.5 hover:bg-fluent-neutral-10 dark:hover:bg-fluent-neutral-120 transition-colors">
                  <File size={13} className="text-fluent-neutral-80 flex-shrink-0" />
                  <span className="text-xs text-fluent-neutral-120 dark:text-fluent-neutral-50 truncate flex-1">
                    {item.filename}
                  </span>
                  <span className="text-xs text-fluent-neutral-60 flex-shrink-0">
                    {Math.round(item.confidence * 100)}%
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onRejectFile(item.fileId)}
                      className={`p-1 rounded transition-colors ${
                        item.approved === false
                          ? 'text-red-600 bg-red-50 dark:bg-red-950/30'
                          : 'text-fluent-neutral-80 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                      }`}
                    >
                      <XCircle size={12} />
                    </button>
                    <button
                      onClick={() => onApproveFile(item.fileId)}
                      className={`p-1 rounded transition-colors ${
                        item.approved === true
                          ? 'text-green-600 bg-green-50 dark:bg-green-950/30'
                          : 'text-fluent-neutral-80 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
