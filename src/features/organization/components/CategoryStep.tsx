import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, Square, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  FolderOpen, SkipForward, CheckCheck,
} from 'lucide-react'
import { Button } from '../../../app/components/ui/Button'
import { Badge } from '../../../app/components/ui/Badge'
import { Card } from '../../../app/components/ui/Card'
import { ConfidenceBar } from './ConfidenceBar'
import { ReasonChips } from './ReasonChips'
import type { MockRecommendation } from '../../../shared/mock/files'
import { formatFileSize, formatRelativeTime } from '../../../shared/utils'
import { cn } from '../../../shared/utils/cn'

interface CategoryStepProps {
  category: string
  label: string
  recommendations: MockRecommendation[]
  approvedIds: Set<string>
  skippedIds: Set<string>
  onApprove: (id: string) => void
  onSkip: (id: string) => void
  onApproveAll: (ids: string[]) => void
  onSkipAll: (ids: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function CategoryStep({
  label, recommendations, approvedIds, skippedIds,
  onApprove, onSkip, onApproveAll, onSkipAll, onNext, onBack,
}: CategoryStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (recommendations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
        <Card padding="lg" className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-fluent-neutral-20 dark:bg-fluent-neutral-120 flex items-center justify-center mx-auto mb-4 text-fluent-neutral-60 dark:text-fluent-neutral-90">
            <FolderOpen size={22} strokeWidth={1.5} />
          </div>
          <p className="font-semibold text-fluent-neutral-100 dark:text-fluent-neutral-70 mb-1">No {label} to organize</p>
          <p className="text-sm text-fluent-neutral-70 dark:text-fluent-neutral-90">No files in this category were found on your desktop.</p>
        </Card>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={onBack} icon={<ChevronLeft size={14} />}>Back</Button>
          <Button variant="primary" onClick={onNext} iconRight={<ChevronRight size={14} />}>Next</Button>
        </div>
      </motion.div>
    )
  }

  const allIds = recommendations.map(r => r.fileId)
  const allApproved = allIds.every(id => approvedIds.has(id))
  const allSkipped = allIds.every(id => skippedIds.has(id))
  const reviewed = allIds.filter(id => approvedIds.has(id) || skippedIds.has(id)).length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">{label}</h2>
          <Badge variant="default">{recommendations.length} file{recommendations.length !== 1 ? 's' : ''}</Badge>
          {reviewed > 0 && <Badge variant="success">{reviewed} reviewed</Badge>}
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="success"
            size="sm"
            icon={<CheckCheck size={13} />}
            onClick={() => onApproveAll(allIds)}
            disabled={allApproved}
          >
            Approve All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<SkipForward size={13} />}
            onClick={() => onSkipAll(allIds)}
            disabled={allSkipped}
          >
            Skip Category
          </Button>
        </div>
      </div>

      {/* File cards */}
      <div className="space-y-2 mb-4">
        {recommendations.map(rec => (
          <FileCard
            key={rec.fileId}
            rec={rec}
            isApproved={approvedIds.has(rec.fileId)}
            isSkipped={skippedIds.has(rec.fileId)}
            isExpanded={expandedId === rec.fileId}
            onToggleExpand={() => setExpandedId(expandedId === rec.fileId ? null : rec.fileId)}
            onApprove={() => onApprove(rec.fileId)}
            onSkip={() => onSkip(rec.fileId)}
          />
        ))}
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onBack} icon={<ChevronLeft size={14} />}>Back</Button>
        <Button variant="primary" onClick={onNext} iconRight={<ChevronRight size={14} />} fullWidth>
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

interface FileCardProps {
  rec: MockRecommendation
  isApproved: boolean
  isSkipped: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onApprove: () => void
  onSkip: () => void
}

function FileCard({ rec, isApproved, isSkipped, isExpanded, onToggleExpand, onApprove, onSkip }: FileCardProps) {
  const statusBorder = isApproved
    ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
    : isSkipped
    ? 'border-l-fluent-neutral-60 opacity-60'
    : 'border-l-transparent'

  return (
    <motion.div
      layout
      className={cn(
        'rounded-fluent-lg border border-fluent-neutral-40/60 dark:border-fluent-neutral-120/60',
        'bg-white dark:bg-fluent-neutral-130 border-l-4 overflow-hidden shadow-fluent-2',
        statusBorder,
      )}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Status indicator */}
        <button
          onClick={isApproved ? onSkip : onApprove}
          className="shrink-0 mt-0.5"
        >
          {isApproved
            ? <CheckSquare size={18} className="text-green-500" />
            : <Square size={18} className="text-fluent-neutral-50 dark:text-fluent-neutral-90 hover:text-fluent-accent" />
          }
        </button>

        {/* File info */}
        <div className="flex-1 min-w-0" onClick={onToggleExpand}>
          <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">
            {rec.fileName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FolderOpen size={11} className="text-amber-500 shrink-0" />
            <span className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 truncate">→ {rec.targetFolder}</span>
          </div>
        </div>

        {/* Confidence */}
        <ConfidenceBar value={rec.confidence} />

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className="p-1 text-fluent-neutral-70 hover:text-fluent-neutral-130 transition-colors"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-fluent-neutral-30 dark:border-fluent-neutral-120"
          >
            <div className="px-4 py-3 space-y-3">
              {/* File meta */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-0.5">Size</p>
                  <p className="font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50">{formatFileSize(rec.fileSize)}</p>
                </div>
                <div>
                  <p className="text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-0.5">Modified</p>
                  <p className="font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50">{formatRelativeTime(rec.modifiedAt)}</p>
                </div>
                <div>
                  <p className="text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-0.5">Destination</p>
                  <p className="font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50 truncate">{rec.targetFolder}</p>
                </div>
              </div>

              {/* Reasons */}
              <div>
                <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-1.5">Why this folder?</p>
                <ReasonChips reasons={rec.reasons} />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant={isApproved ? 'success' : 'primary'}
                  size="sm"
                  icon={<CheckSquare size={13} />}
                  onClick={onApprove}
                >
                  {isApproved ? 'Approved' : 'Approve'}
                </Button>
                <Button
                  variant={isSkipped ? 'ghost' : 'outline'}
                  size="sm"
                  icon={<SkipForward size={13} />}
                  onClick={onSkip}
                >
                  {isSkipped ? 'Skipped' : 'Skip'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
