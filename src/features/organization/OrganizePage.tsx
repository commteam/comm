import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ChevronRight, ChevronLeft, Play, AlertCircle,
  ScanLine, CheckCircle2, Loader2, Eye
} from 'lucide-react'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Button } from '../../app/components/ui/Button'
import { Badge } from '../../app/components/ui/Badge'
import { Card } from '../../app/components/ui/Card'
import { ProgressBar } from '../../app/components/ui/ProgressBar'
import { RecommendationGroupCard } from './components/RecommendationGroupCard'
import { OrganizationPreviewPanel } from './components/OrganizationPreviewPanel'
import { SessionReportPanel } from './components/SessionReportPanel'
import type {
  OrgSessionV2,
  RecommendationGroup,
  OrganizationPreview,
  SessionReport,
} from '../../shared/types/intelligence'

type WizardStep = 'start' | 'scanning' | 'groups' | 'preview' | 'executing' | 'report'

const STEP_LABELS = ['Scan', 'Analyze', 'Review', 'Preview', 'Execute', 'Report']
const STEP_INDEX: Record<WizardStep, number> = {
  start: 0, scanning: 1, groups: 2, preview: 3, executing: 4, report: 5
}

const api = () => (window as any).electronAPI

async function ipc<T>(fn: () => Promise<{ success: boolean; data?: T; error?: string }>): Promise<T> {
  const res = await fn()
  if (!res.success) throw new Error(res.error)
  return res.data as T
}

export function OrganizePage() {
  const [step, setStep] = useState<WizardStep>('start')
  const [session, setSession] = useState<OrgSessionV2 | null>(null)
  const [groups, setGroups] = useState<RecommendationGroup[]>([])
  const [preview, setPreview] = useState<OrganizationPreview | null>(null)
  const [report, setReport] = useState<SessionReport | null>(null)
  const [snapshotId, setSnapshotId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [execProgress, setExecProgress] = useState({ done: 0, total: 0, filename: '' })
  const [scanProgress, setScanProgress] = useState({ progress: 0, message: '' })

  const groupsApprovedTotal = groups
    .filter(g => g.approved !== false)
    .reduce((s, g) => s + g.items.filter(i => i.approved !== false).length, 0)

  async function handleStart() {
    setError(null)
    setStep('scanning')
    setScanProgress({ progress: 0, message: 'Starting scan...' })
    try {
      const settings = await ipc<any>(() => api().getSettings())
      const desktopPath = settings?.general?.desktopPath ?? ''
      const unsub = api().onScanProgressIntelligence?.((data: { progress: number; message: string }) => {
        setScanProgress(data)
      })
      const sess = await ipc<OrgSessionV2>(() => api().startOrgSession({}))
      setSession(sess)
      await ipc(() => api().intelligenceScan({ desktopPath, mode: 'incremental' }))
      unsub?.()
      setScanProgress({ progress: 100, message: 'Generating recommendations...' })
      const grps = await ipc<RecommendationGroup[]>(() =>
        api().generateOrgGroups({ sessionId: sess.id })
      )
      setGroups(grps.map(g => ({ ...g, expanded: false, approved: null })))
      setStep('groups')
    } catch (e) {
      setError(String(e))
      setStep('start')
    }
  }

  function approveGroup(groupId: string) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, approved: true, items: g.items.map(i => ({ ...i, approved: true })) } : g
    ))
  }
  function rejectGroup(groupId: string) {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, approved: false, items: g.items.map(i => ({ ...i, approved: false })) } : g
    ))
  }
  function approveFile(groupId: string, fileId: string) {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const items = g.items.map(i => i.fileId === fileId ? { ...i, approved: true } : i)
      const allApproved = items.every(i => i.approved === true)
      const allRejected = items.every(i => i.approved === false)
      return { ...g, items, approved: allApproved ? true : allRejected ? false : null }
    }))
  }
  function rejectFile(groupId: string, fileId: string) {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g
      const items = g.items.map(i => i.fileId === fileId ? { ...i, approved: false } : i)
      const allApproved = items.every(i => i.approved === true)
      const allRejected = items.every(i => i.approved === false)
      return { ...g, items, approved: allApproved ? true : allRejected ? false : null }
    }))
  }
  function toggleExpand(groupId: string) {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g))
  }

  async function handleGeneratePreview() {
    if (!session) return
    setError(null)
    try {
      const prev = await ipc<OrganizationPreview>(() =>
        api().generateOrgPreview({ sessionId: session.id, groups })
      )
      setPreview(prev)
      setStep('preview')
    } catch (e) { setError(String(e)) }
  }

  async function handleExecute() {
    if (!session) return
    setError(null)
    setExecProgress({ done: 0, total: groupsApprovedTotal, filename: '' })
    setStep('executing')
    const unsub = api().onOrgExecuteProgress?.((data: { done: number; total: number; filename: string }) => {
      setExecProgress(data)
    })
    try {
      const approvedGroups = groups.filter(g => g.approved !== false)
      const result = await ipc<{ executed: number; failed: number; snapshotId: string; reportId: string }>(
        () => api().executeOrg({ sessionId: session.id, approvedGroups })
      )
      unsub?.()
      setSnapshotId(result.snapshotId)
      const rpt = await ipc<SessionReport>(() => api().getOrgReport({ sessionId: session.id }))
      setReport(rpt)
      setStep('report')
    } catch (e) {
      unsub?.()
      setError(String(e))
      setStep('preview')
    }
  }

  async function handleUndo() {
    if (!snapshotId) return
    try {
      await ipc(() => api().undoOrgSnapshot({ snapshotId }))
      handleReset()
    } catch (e) { setError(String(e)) }
  }

  function handleReset() {
    setStep('start')
    setGroups([])
    setPreview(null)
    setReport(null)
    setSession(null)
    setError(null)
  }

  const currentStepIndex = STEP_INDEX[step]

  return (
    <PageWrapper maxWidth="lg">
      <PageHeader
        title="Organization Wizard"
        description="Review AI recommendations — nothing moves without your approval"
        icon={<Sparkles size={18} />}
        actions={
          step !== 'start' && step !== 'report' ? (
            <div className="flex items-center gap-2">
              <Badge variant="info">{groupsApprovedTotal} approved</Badge>
              <Badge variant="muted">{groups.flatMap(g => g.items.filter(i => i.approved === false)).length} skipped</Badge>
            </div>
          ) : undefined
        }
      />

      {step !== 'start' && (
        <div className="mb-6">
          <div className="flex gap-1 mb-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                i < currentStepIndex ? 'bg-fluent-accent' :
                i === currentStepIndex ? 'bg-fluent-accent/50' :
                'bg-fluent-neutral-30 dark:bg-fluent-neutral-100'
              }`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-fluent-neutral-80">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={i <= currentStepIndex ? 'text-fluent-accent font-medium' : ''}>{label}</span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-fluent bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'start' && (
          <motion.div key="start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card padding="lg" className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-fluent-accent/10 flex items-center justify-center mx-auto">
                <Sparkles size={32} className="text-fluent-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2">
                  Ready to Organize
                </h2>
                <p className="text-fluent-neutral-80 text-sm max-w-md mx-auto">
                  DeskPilot AI will scan your desktop, group files by destination, and show you a preview before anything moves.
                </p>
              </div>
              <div className="grid grid-cols-4 gap-3 text-left">
                {[
                  { icon: ScanLine, label: 'Scan Desktop', desc: 'Incremental — fast' },
                  { icon: Eye, label: 'Review Groups', desc: 'Approve or skip' },
                  { icon: Eye, label: 'Preview', desc: 'See before/after' },
                  { icon: CheckCircle2, label: 'Execute', desc: 'One file at a time' },
                ].map(item => (
                  <div key={item.label} className="rounded-fluent p-3 bg-fluent-neutral-10 dark:bg-fluent-neutral-120 border border-fluent-neutral-30 dark:border-fluent-neutral-110">
                    <item.icon size={16} className="text-fluent-accent mb-1.5" />
                    <p className="text-xs font-semibold text-fluent-neutral-120 dark:text-fluent-neutral-50">{item.label}</p>
                    <p className="text-xs text-fluent-neutral-80">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Button variant="primary" size="lg" onClick={handleStart}>
                <Play size={16} /> Start Organization
              </Button>
            </Card>
          </motion.div>
        )}

        {step === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card padding="lg" className="text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-fluent-accent/10 flex items-center justify-center mx-auto">
                <Loader2 size={28} className="text-fluent-accent animate-spin" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-1">Scanning Desktop</h2>
                <p className="text-sm text-fluent-neutral-80">{scanProgress.message || 'Analyzing files...'}</p>
              </div>
              <ProgressBar value={scanProgress.progress} max={100} variant="accent" size="md" />
              <p className="text-xs text-fluent-neutral-80">{scanProgress.progress}% complete</p>
            </Card>
          </motion.div>
        )}

        {step === 'groups' && (
          <motion.div key="groups" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                  {groups.length} Recommendation Group{groups.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-xs text-fluent-neutral-80 mt-0.5">Review each group. Approve files you want to organize.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setGroups(prev => prev.map(g => ({ ...g, approved: false, items: g.items.map(i => ({ ...i, approved: false })) })))}>
                  Skip All
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setGroups(prev => prev.map(g => ({ ...g, approved: true, items: g.items.map(i => ({ ...i, approved: true })) })))}>
                  Approve All
                </Button>
              </div>
            </div>

            {groups.length === 0 ? (
              <Card padding="lg" className="text-center">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-1">Your desktop is organized!</h3>
                <p className="text-sm text-fluent-neutral-80">No files need organization right now.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {groups.map(group => (
                  <RecommendationGroupCard
                    key={group.id}
                    group={group}
                    onApproveGroup={() => approveGroup(group.id)}
                    onRejectGroup={() => rejectGroup(group.id)}
                    onApproveFile={fileId => approveFile(group.id, fileId)}
                    onRejectFile={fileId => rejectFile(group.id, fileId)}
                    onToggleExpand={() => toggleExpand(group.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={handleReset}><ChevronLeft size={14} /> Cancel</Button>
              <Button variant="primary" onClick={handleGeneratePreview} disabled={groupsApprovedTotal === 0}>
                Preview {groupsApprovedTotal} File{groupsApprovedTotal !== 1 ? 's' : ''} <ChevronRight size={14} />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'preview' && preview && (
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">Organization Preview</h2>
              <p className="text-xs text-fluent-neutral-80 mt-0.5">Review the plan below. Nothing moves until you confirm.</p>
            </div>
            <OrganizationPreviewPanel preview={preview} />
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep('groups')}><ChevronLeft size={14} /> Back</Button>
              <Button variant="primary" onClick={handleExecute}>
                <Play size={14} /> Confirm & Organize {preview.totalFiles} File{preview.totalFiles !== 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'executing' && (
          <motion.div key="executing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <Card padding="lg" className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-fluent-accent/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 size={22} className="text-fluent-accent animate-spin" />
                </div>
                <div>
                  <h2 className="font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">Organizing Files</h2>
                  <p className="text-xs text-fluent-neutral-80">Moving one file at a time, verifying each step</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-fluent-neutral-80 mb-2">
                  <span className="truncate max-w-[70%]">{execProgress.filename || 'Processing...'}</span>
                  <span>{execProgress.done} / {execProgress.total}</span>
                </div>
                <ProgressBar value={execProgress.done} max={execProgress.total || 1} variant="accent" size="md" />
              </div>
              <p className="text-xs text-fluent-neutral-80 text-center">Please do not close the application during organization.</p>
            </Card>
          </motion.div>
        )}

        {step === 'report' && report && (
          <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <SessionReportPanel
              report={report}
              snapshotId={snapshotId}
              onUndo={snapshotId ? handleUndo : undefined}
              onDone={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
