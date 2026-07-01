import { useState, useEffect } from 'react'
import { Shield, CheckCircle2, XCircle, RefreshCw, Lock, Eye, Wifi, Cloud, Cpu, Database, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Button } from '../../app/components/ui/Button'
import { AnimatedCounter } from '../../app/components/ui/AnimatedCounter'
import type { PrivacyAuditStats } from '../../../electron/main/services/privacy-audit.service'

const api = () => (window as any).electronAPI

const NEVER_ITEMS = [
  { icon: FileText, label: 'Document contents read', key: 'contentsRead' as const },
  { icon: Cloud, label: 'Cloud uploads', key: 'cloudUploads' as const },
  { icon: Wifi, label: 'Internet requests', key: 'internetRequests' as const },
  { icon: Cpu, label: 'External AI requests', key: 'externalAiRequests' as const },
  { icon: Eye, label: 'Documents opened', key: 'documentsOpened' as const },
]

const POSITIVE_ITEMS = [
  { icon: Database, label: 'Metadata scans completed', key: 'metadataScans' as const },
  { icon: Shield, label: 'Organization sessions', key: 'organizationSessions' as const },
  { icon: CheckCircle2, label: 'Files organized', key: 'filesOrganized' as const },
  { icon: Lock, label: 'Rules learned locally', key: 'rulesLearned' as const },
]

export function PrivacyAuditPage() {
  const [stats, setStats] = useState<PrivacyAuditStats | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await api().getPrivacyAudit()
      if (res.success) setStats(res.data)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Privacy Audit"
        description="A transparent record of how DeskPilot AI has handled your data"
        icon={<Shield size={18} />}
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />} onClick={load} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {/* Guarantee banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3 px-4 py-3.5 rounded-fluent-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40"
      >
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">Your files have never been opened or uploaded by DeskPilot AI.</p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">All processing happens locally on your computer. Nothing leaves your device.</p>
        </div>
      </motion.div>

      {/* Zero-count never section */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <XCircle size={15} className="text-red-500" />
          <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 uppercase tracking-wide">DeskPilot AI Never</h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {NEVER_ITEMS.map(item => {
            const Icon = item.icon
            const count = stats ? stats[item.key] : 0
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-fluent bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20"
              >
                <Icon size={14} className="text-red-400 dark:text-red-500 shrink-0" />
                <span className="flex-1 text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50">{item.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {loading ? '—' : <AnimatedCounter value={count} />}
                  </span>
                  {count === 0 && (
                    <CheckCircle2 size={14} className="text-green-500" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* Positive activity section */}
      <Card padding="md" className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={15} className="text-green-500" />
          <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 uppercase tracking-wide">Privacy-Safe Activity</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {POSITIVE_ITEMS.map(item => {
            const Icon = item.icon
            const count = stats ? stats[item.key] : 0
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-1.5 px-3 py-4 rounded-fluent bg-green-50/60 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20 text-center"
              >
                <Icon size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-2xl font-bold text-green-700 dark:text-green-400 tabular-nums">
                  {loading ? '—' : <AnimatedCounter value={count} />}
                </span>
                <span className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 leading-tight">{item.label}</span>
              </motion.div>
            )
          })}
        </div>
      </Card>

      {/* Policy summary */}
      <Card padding="md">
        <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">What DeskPilot AI uses</h2>
        <div className="space-y-2">
          {[
            'File name and extension',
            'Folder location and path',
            'File size',
            'Created and modified dates',
            'User-approved organization history',
            'File hash (for duplicate detection only)',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50">
              <CheckCircle2 size={13} className="text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-fluent-neutral-20 dark:border-fluent-neutral-120">
          <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 leading-relaxed">
            DeskPilot AI never reads the contents of your documents, images, videos, or any other files.
            All recommendations are based exclusively on metadata. Processing is entirely local —
            no internet connection is required and nothing is ever sent to external services.
          </p>
        </div>
      </Card>
    </PageWrapper>
  )
}
