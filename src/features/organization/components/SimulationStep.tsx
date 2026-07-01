import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Play, FolderOpen, ArrowRight } from 'lucide-react'
import { Button } from '../../../app/components/ui/Button'
import { Card } from '../../../app/components/ui/Card'
import type { MockRecommendation } from '../../../shared/mock/files'

interface SimulationStepProps {
  recommendations: MockRecommendation[]
  approvedIds: Set<string>
  onExecute: () => void
  onBack: () => void
}

export function SimulationStep({ recommendations, approvedIds, onExecute, onBack }: SimulationStepProps) {
  const [executing, setExecuting] = useState(false)
  const approved = recommendations.filter(r => approvedIds.has(r.fileId))

  // Group approved files by target folder
  const byFolder = approved.reduce<Record<string, MockRecommendation[]>>((acc, rec) => {
    const key = rec.targetFolder
    if (!acc[key]) acc[key] = []
    acc[key].push(rec)
    return acc
  }, {})

  async function handleExecute() {
    setExecuting(true)
    await new Promise(r => setTimeout(r, 1500))
    setExecuting(false)
    onExecute()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      {/* Before / After */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Before */}
        <Card padding="md" className="border-fluent-neutral-50 dark:border-fluent-neutral-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs font-bold text-fluent-neutral-100 dark:text-fluent-neutral-70 uppercase tracking-wider">Before</span>
          </div>
          <p className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-0.5">
            {recommendations.length}
          </p>
          <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-4">files on Desktop</p>
          <div className="space-y-1">
            {recommendations.slice(0, 5).map(r => (
              <div key={r.fileId} className="flex items-center gap-1.5 text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">
                <div className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" />
                <span className="truncate">{r.fileName}</span>
              </div>
            ))}
            {recommendations.length > 5 && (
              <p className="text-xs text-fluent-neutral-60 dark:text-fluent-neutral-100">+{recommendations.length - 5} more</p>
            )}
          </div>
        </Card>

        {/* After */}
        <Card padding="md" className="border-green-200 dark:border-green-800 bg-green-50/40 dark:bg-green-950/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">After</span>
          </div>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-0.5">
            {recommendations.length - approved.length}
          </p>
          <p className="text-xs text-green-600 dark:text-green-500 mb-4">files remain on Desktop</p>
          <div className="space-y-1.5">
            {Object.entries(byFolder).map(([folder, files]) => (
              <div key={folder} className="flex items-center gap-1.5 text-xs">
                <FolderOpen size={11} className="text-amber-500 shrink-0" />
                <span className="text-green-700 dark:text-green-400 font-medium">{folder}</span>
                <span className="text-green-500 dark:text-green-600 ml-auto">{files.length} files</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary table */}
      <Card padding="md" className="mb-5">
        <h3 className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">What will happen</h3>
        {approved.length === 0 ? (
          <p className="text-sm text-fluent-neutral-70 dark:text-fluent-neutral-90">No files were approved. Go back to approve files first.</p>
        ) : (
          <div className="space-y-2">
            {approved.map(rec => (
              <div key={rec.fileId} className="flex items-center gap-2 py-1.5 text-sm border-b border-fluent-neutral-20 dark:border-fluent-neutral-120 last:border-0">
                <span className="text-fluent-neutral-100 dark:text-fluent-neutral-70 flex-1 truncate min-w-0">{rec.fileName}</span>
                <ArrowRight size={12} className="shrink-0 text-fluent-neutral-60" />
                <div className="flex items-center gap-1 shrink-0">
                  <FolderOpen size={12} className="text-amber-500" />
                  <span className="text-fluent-neutral-130 dark:text-fluent-neutral-20 font-medium">{rec.targetFolder}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Safety notice */}
      <div className="p-3 rounded-fluent bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 mb-5">
        All moves can be undone instantly from the Timeline page.
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" icon={<ChevronLeft size={14} />} onClick={onBack}>Back</Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleExecute}
          loading={executing}
          disabled={approved.length === 0}
          icon={<Play size={14} />}
          fullWidth
        >
          {executing ? 'Organizing…' : `Move ${approved.length} file${approved.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </motion.div>
  )
}
