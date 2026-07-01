import { Download, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { formatFileSize, formatRelativeTime } from '../../shared/utils'
import type { DownloadsAnalysis, DownloadFile } from '../../shared/types/intelligence'

const api = () => (window as any).electronAPI

export function DownloadsPage() {
  const [analysis, setAnalysis] = useState<DownloadsAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api().analyzeDownloads()
      if (res.success) setAnalysis(res.data)
      else setError(res.error)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const allFiles: DownloadFile[] = analysis
    ? [...analysis.oldInstallers, ...analysis.duplicates, ...analysis.tempFiles, ...analysis.compressed, ...analysis.unusedInstallers]
    : []

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Downloads"
        description="Analyze and clean up your Downloads folder"
        icon={<Download size={18} />}
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />} onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-fluent bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && !analysis && (
        <div className="text-center py-12 text-fluent-neutral-70 dark:text-fluent-neutral-90">
          <Download size={28} className="mx-auto mb-3 opacity-30 animate-pulse" strokeWidth={1.5} />
          <p className="text-sm">Analyzing downloads…</p>
        </div>
      )}

      {analysis && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <SummaryBox label="Total Files" value={String(analysis.totalFiles)} />
            <SummaryBox label="Total Size" value={formatFileSize(analysis.totalSize)} />
            <SummaryBox label="Cleanable" value={String(allFiles.length)} color="text-red-600 dark:text-red-400" />
          </div>

          {allFiles.length === 0 ? (
            <EmptyDownloads />
          ) : (
            <div className="space-y-2">
              {allFiles.map((file, i) => (
                <motion.div key={file.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <DownloadRow file={file} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !analysis && !error && <EmptyDownloads />}
    </PageWrapper>
  )
}

function SummaryBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card padding="sm" className="text-center">
      <p className={`text-xl font-bold mb-0.5 ${color ?? 'text-fluent-neutral-140 dark:text-fluent-neutral-10'}`}>{value}</p>
      <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">{label}</p>
    </Card>
  )
}

const CATEGORY_LABELS: Record<string, string> = {
  installer: 'Installer',
  duplicate: 'Duplicate',
  temp: 'Temp',
  compressed: 'Archive',
  unknown: 'Other',
}

function DownloadRow({ file }: { file: DownloadFile }) {
  return (
    <Card padding="sm" className="flex items-center gap-3">
      <Download size={16} className="text-fluent-neutral-60 dark:text-fluent-neutral-90 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{file.filename}</p>
        <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">
          {formatFileSize(file.size)} · {formatRelativeTime(new Date(file.lastModified))} · {file.reason}
        </p>
      </div>
      <Badge variant={file.category === 'duplicate' ? 'error' : 'warning'} size="sm">
        {CATEGORY_LABELS[file.category] ?? file.category}
      </Badge>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="xs">Skip</Button>
      </div>
    </Card>
  )
}

function EmptyDownloads() {
  return (
    <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
      <Download size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
      <p className="font-semibold mb-1">Downloads folder is clean</p>
      <p className="text-sm">No cleanable files found.</p>
    </div>
  )
}
