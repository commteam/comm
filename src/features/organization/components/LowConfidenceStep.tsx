import { useState } from 'react'
import { AlertTriangle, ChevronRight, ChevronLeft, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../../app/components/ui/Button'
import { Badge } from '../../../app/components/ui/Badge'
import { Card } from '../../../app/components/ui/Card'
import type { MockRecommendation } from '../../../shared/mock/files'
import { mockFolderProfiles } from '../../../shared/mock'

interface LowConfidenceStepProps {
  recommendations: MockRecommendation[]
  approvedIds: Set<string>
  onApprove: (id: string, folderId: string) => void
  onSkip: (id: string) => void
  onNext: () => void
  onBack: () => void
}

export function LowConfidenceStep({ recommendations, approvedIds, onApprove, onSkip, onNext, onBack }: LowConfidenceStepProps) {
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [remember, setRemember] = useState<Record<string, boolean>>({})

  if (recommendations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg" className="text-center py-12 mb-4">
          <p className="text-fluent-neutral-80 font-semibold mb-1">No uncertain files</p>
          <p className="text-sm text-fluent-neutral-70">All recommendations had high confidence.</p>
        </Card>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={onBack}>Back</Button>
          <Button variant="primary" iconRight={<ChevronRight size={14} />} onClick={onNext} fullWidth>Continue</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <div className="flex items-center gap-2 p-3 rounded-fluent bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-4 text-sm text-amber-700 dark:text-amber-300">
        <AlertTriangle size={14} className="shrink-0" />
        <p>These files have low confidence scores. DeskPilot AI isn't sure where they go. You decide.</p>
      </div>

      <div className="space-y-3 mb-4">
        {recommendations.map(rec => (
          <Card key={rec.fileId} padding="md" className="border-l-4 border-l-amber-400">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-semibold text-sm text-fluent-neutral-130 dark:text-fluent-neutral-20">{rec.fileName}</p>
                <Badge variant="warning" size="sm" className="mt-1">
                  {Math.round(rec.confidence * 100)}% confidence
                </Badge>
              </div>
              {approvedIds.has(rec.fileId) && <Badge variant="success">Approved</Badge>}
            </div>

            <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-2">Where should this file go?</p>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {mockFolderProfiles.slice(0, 4).map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelections(s => ({ ...s, [rec.fileId]: folder.id }))}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-fluent text-xs font-medium text-left transition-all ${
                    selections[rec.fileId] === folder.id
                      ? 'bg-fluent-accent text-white'
                      : 'bg-fluent-neutral-10 dark:bg-fluent-neutral-120 text-fluent-neutral-110 dark:text-fluent-neutral-50 hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-110 border border-fluent-neutral-40 dark:border-fluent-neutral-110'
                  }`}
                >
                  <FolderOpen size={12} />
                  {folder.name}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs text-fluent-neutral-80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember[rec.fileId] ?? false}
                onChange={e => setRemember(r => ({ ...r, [rec.fileId]: e.target.checked }))}
                className="w-3 h-3 accent-fluent-accent"
              />
              Remember this decision for similar files
            </label>

            <div className="flex gap-2 mt-3">
              <Button
                variant="primary"
                size="sm"
                disabled={!selections[rec.fileId]}
                onClick={() => selections[rec.fileId] && onApprove(rec.fileId, selections[rec.fileId])}
              >
                Confirm
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onSkip(rec.fileId)}>Skip</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={onBack}>Back</Button>
        <Button variant="primary" iconRight={<ChevronRight size={14} />} onClick={onNext} fullWidth>Continue to Preview</Button>
      </div>
    </motion.div>
  )
}
