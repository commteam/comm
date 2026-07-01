import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '../../../app/components/ui/Button'
import { formatRelativeTime } from '../../../shared/utils'

interface AIAssistantCardProps {
  filesFound: number
  autoOrganizable: number
  needsReview: number
  lastScan: Date
  onOrganize: () => void
  onReview: () => void
}

export function AIAssistantCard({
  filesFound,
  autoOrganizable,
  needsReview,
  lastScan,
  onOrganize,
  onReview,
}: AIAssistantCardProps) {
  return (
    <div className="h-full rounded-fluent-lg bg-gradient-to-br from-fluent-accent to-blue-600 dark:from-fluent-accent dark:to-blue-700 p-5 flex flex-col justify-between shadow-fluent-8 text-white">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles size={14} />
          </div>
          <span className="font-semibold text-sm tracking-tight">AI Assistant</span>
          <span className="ml-auto text-white/60 text-xs">{formatRelativeTime(lastScan)}</span>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-white/90 text-sm leading-relaxed">
            {filesFound === 0
              ? 'Your desktop looks clean. No new files to organize.'
              : `We found ${filesFound} new file${filesFound !== 1 ? 's' : ''} on your desktop.`
            }
          </p>
          {filesFound > 0 && (
            <div className="space-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={14} className="text-green-300 shrink-0" />
                <span className="text-white/90">
                  <strong>{autoOrganizable}</strong> can be organized automatically
                </span>
              </div>
              {needsReview > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle size={14} className="text-amber-300 shrink-0" />
                  <span className="text-white/90">
                    <strong>{needsReview}</strong> need{needsReview === 1 ? 's' : ''} your review
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {filesFound > 0 && (
          <>
            <Button
              variant="primary"
              size="sm"
              className="bg-white text-fluent-accent hover:bg-white/90 flex-1"
              onClick={onOrganize}
            >
              Organize Now
            </Button>
            {needsReview > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10 flex-1"
                onClick={onReview}
                iconRight={<ArrowRight size={13} />}
              >
                Review
              </Button>
            )}
          </>
        )}
        {filesFound === 0 && (
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={onOrganize}
          >
            Run Scan
          </Button>
        )}
      </div>
    </div>
  )
}
