import { Download, FolderOpen, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { formatFileSize, formatRelativeTime } from '../../shared/utils'

const mockDownloads = [
  { id: 'd1', name: 'node_setup_v20.exe', size: 28_000_000, downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), targetFolder: 'Installers', confidence: 0.96 },
  { id: 'd2', name: 'archive_backup_2023.zip', size: 450_000_000, downloadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), targetFolder: 'Archives', confidence: 0.87 },
  { id: 'd3', name: 'Proposal_Template.docx', size: 48_000, downloadedAt: new Date(Date.now() - 1000 * 60 * 30), targetFolder: 'Documents', confidence: 0.79 },
]

export function DownloadsPage() {
  if (mockDownloads.length === 0) {
    return (
      <PageWrapper maxWidth="md">
        <PageHeader title="Downloads" description="Recently downloaded files that can be organized" icon={<Download size={18} />} />
        <EmptyDownloads />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Downloads"
        description="Recently downloaded files — organize them before they pile up"
        icon={<Download size={18} />}
      />
      <div className="space-y-2">
        {mockDownloads.map((dl, i) => (
          <motion.div key={dl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card padding="sm" className="flex items-center gap-3">
              <Download size={16} className="text-fluent-neutral-60 dark:text-fluent-neutral-90 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{dl.name}</p>
                <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">
                  {formatFileSize(dl.size)} · {formatRelativeTime(dl.downloadedAt)}
                </p>
              </div>
              <ArrowRight size={13} className="text-fluent-neutral-50 shrink-0" />
              <div className="flex items-center gap-1.5 shrink-0">
                <FolderOpen size={13} className="text-amber-500" />
                <span className="text-sm font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50">{dl.targetFolder}</span>
                <Badge variant={dl.confidence >= 0.9 ? 'success' : 'warning'} size="sm">
                  {Math.round(dl.confidence * 100)}%
                </Badge>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="success" size="xs">Move</Button>
                <Button variant="ghost" size="xs">Skip</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  )
}

function EmptyDownloads() {
  return (
    <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
      <Download size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
      <p className="font-semibold mb-1">No new downloads</p>
      <p className="text-sm">Download something and it will appear here for quick organization.</p>
    </div>
  )
}
