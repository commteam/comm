import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine, FileText, Image, Video, Archive, Terminal, File, FolderOpen, CheckCircle2,
} from 'lucide-react'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Button } from '../../app/components/ui/Button'
import { ProgressBar } from '../../app/components/ui/ProgressBar'
import { AnimatedCounter } from '../../app/components/ui/AnimatedCounter'
import { Badge } from '../../app/components/ui/Badge'

type ScanStatus = 'idle' | 'scanning' | 'complete'

interface CategoryResult {
  label: string
  count: number
  icon: React.ElementType
  color: string
  bgColor: string
}

const CATEGORIES: Omit<CategoryResult, 'count'>[] = [
  { label: 'Documents', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { label: 'Images', icon: Image, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { label: 'Videos', icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { label: 'Archives', icon: Archive, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  { label: 'Applications', icon: Terminal, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  { label: 'Other', icon: File, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/30' },
]

const TARGET_COUNTS = [8, 5, 0, 2, 1, 3]

export function ScanPage() {
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [counts, setCounts] = useState(CATEGORIES.map(() => 0))
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (status !== 'scanning') return
    const interval = setInterval(() => {
      setElapsed(startTime ? Math.floor((Date.now() - startTime) / 1000) : 0)
    }, 100)
    return () => clearInterval(interval)
  }, [status, startTime])

  async function startScan() {
    setStatus('scanning')
    setProgress(0)
    setCounts(CATEGORIES.map(() => 0))
    setStartTime(Date.now())
    setElapsed(0)

    // Simulate scan progress
    const steps = 60
    for (let i = 1; i <= steps; i++) {
      await sleep(40)
      const pct = (i / steps) * 100
      setProgress(pct)
      // Reveal counts progressively
      const newCounts = TARGET_COUNTS.map(target => Math.floor((i / steps) * target))
      setCounts(newCounts)
    }
    setStatus('complete')
    setProgress(100)
    setCounts(TARGET_COUNTS)
  }

  const totalFiles = counts.reduce((a, b) => a + b, 0)
  const estimatedRemaining = progress > 0 && progress < 100
    ? Math.ceil(((100 - progress) / progress) * elapsed)
    : 0

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Desktop Scan"
        description="Analyze your desktop to find files that can be organized"
        icon={<ScanLine size={18} />}
        actions={
          status === 'idle' || status === 'complete'
            ? <Button variant="primary" onClick={startScan} icon={<ScanLine size={14} />}>
                {status === 'complete' ? 'Scan Again' : 'Start Scan'}
              </Button>
            : null
        }
      />

      {/* Scanner animation */}
      <Card padding="lg" className="mb-5">
        <div className="flex flex-col items-center py-4">
          <ScannerVisual status={status} progress={progress} />

          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center mt-5">
                <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 text-sm">
                  Ready to scan your desktop
                </p>
                <p className="text-fluent-neutral-70 dark:text-fluent-neutral-90 text-xs mt-1">
                  Scanning is fast and safe — no files are moved
                </p>
              </motion.div>
            )}

            {status === 'scanning' && (
              <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-sm mt-5">
                <ProgressBar value={progress} animated={false} size="md" className="mb-3" />
                <div className="flex justify-between text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">
                  <span>Scanning… {Math.round(progress)}%</span>
                  {estimatedRemaining > 0 && <span>~{estimatedRemaining}s remaining</span>}
                </div>
              </motion.div>
            )}

            {status === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-5">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <p className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">
                    Scan complete
                  </p>
                </div>
                <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mt-1">
                  Found <strong>{totalFiles}</strong> files in {elapsed}s
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Category results */}
      {(status === 'scanning' || status === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon
            return (
              <Card key={cat.label} padding="sm" className={`${cat.bgColor} border-0`}>
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className={cat.color} strokeWidth={1.75} />
                  <div>
                    <div className={`text-lg font-bold ${cat.color}`}>
                      <AnimatedCounter value={counts[i]} duration={800} />
                    </div>
                    <div className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">{cat.label}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </motion.div>
      )}

      {/* Folder preview */}
      {status === 'complete' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">
                Existing Folders Found
              </h3>
              <Badge variant="success">7 folders</Badge>
            </div>
            {['Projects', 'Documents', 'Finance', 'Screenshots', 'Installers', 'Archives', 'Important'].map(folder => (
              <div key={folder} className="flex items-center gap-2.5 py-2 border-b border-fluent-neutral-30 dark:border-fluent-neutral-120 last:border-0">
                <FolderOpen size={14} className="text-amber-500 shrink-0" />
                <span className="text-sm text-fluent-neutral-120 dark:text-fluent-neutral-30 flex-1">{folder}</span>
                <Badge variant="muted" size="sm">profiled</Badge>
              </div>
            ))}
          </Card>
        </motion.div>
      )}
    </PageWrapper>
  )
}

function ScannerVisual({ status, progress }: { status: ScanStatus; progress: number }) {
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      {/* Background ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r="60" fill="none" strokeWidth="3" className="stroke-fluent-neutral-30 dark:stroke-fluent-neutral-120" />
        {status !== 'idle' && (
          <motion.circle
            cx="72" cy="72" r="60"
            fill="none" strokeWidth="3"
            stroke="#0078D4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 60}
            initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progress / 100) }}
            transition={{ duration: 0.3 }}
          />
        )}
      </svg>

      {/* Center icon */}
      <div className="relative flex items-center justify-center">
        {status === 'complete' ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.5} />
          </motion.div>
        ) : (
          <motion.div
            animate={status === 'scanning' ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <ScanLine
              size={40}
              className={status === 'idle' ? 'text-fluent-neutral-60 dark:text-fluent-neutral-100' : 'text-fluent-accent'}
              strokeWidth={1.5}
            />
          </motion.div>
        )}
      </div>

      {/* Scanning beam */}
      {status === 'scanning' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,120,212,0.15) 100%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
