import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronRight, Info } from 'lucide-react'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Button } from '../../app/components/ui/Button'
import { Badge } from '../../app/components/ui/Badge'
import { CategoryStep } from './components/CategoryStep'
import { LowConfidenceStep } from './components/LowConfidenceStep'
import { SimulationStep } from './components/SimulationStep'
import { mockRecommendations } from '../../shared/mock'

type WizardStep = 'overview' | 'pdf' | 'document' | 'image' | 'spreadsheet' | 'executable' | 'archive' | 'low-confidence' | 'simulation' | 'complete'

const CATEGORY_STEPS: { key: WizardStep; label: string; category: string }[] = [
  { key: 'pdf', label: 'PDFs', category: 'pdf' },
  { key: 'document', label: 'Documents', category: 'document' },
  { key: 'image', label: 'Images', category: 'image' },
  { key: 'spreadsheet', label: 'Spreadsheets', category: 'spreadsheet' },
  { key: 'executable', label: 'Applications', category: 'executable' },
  { key: 'archive', label: 'Archives', category: 'archive' },
]

const STEP_ORDER: WizardStep[] = ['overview', ...CATEGORY_STEPS.map(c => c.key), 'low-confidence', 'simulation', 'complete']

export function OrganizePage() {
  const [step, setStep] = useState<WizardStep>('overview')
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set())
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())

  const highConfidence = mockRecommendations.filter(r => !r.isLowConfidence)
  const lowConfidence = mockRecommendations.filter(r => r.isLowConfidence)

  const currentIndex = STEP_ORDER.indexOf(step)

  function next() {
    const nextStep = STEP_ORDER[currentIndex + 1]
    if (nextStep) setStep(nextStep)
  }
  function back() {
    const prevStep = STEP_ORDER[currentIndex - 1]
    if (prevStep) setStep(prevStep)
  }

  return (
    <PageWrapper maxWidth="lg">
      <PageHeader
        title="Organization Wizard"
        description="Review AI recommendations by category before anything moves"
        icon={<Sparkles size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">{approvedIds.size} approved</Badge>
            <Badge variant="muted">{skippedIds.size} skipped</Badge>
          </div>
        }
      />

      {/* Step progress */}
      {step !== 'overview' && step !== 'complete' && (
        <StepProgress current={currentIndex - 1} steps={[...CATEGORY_STEPS.map(c => c.label), 'Review', 'Preview']} />
      )}

      <AnimatePresence mode="wait">
        {step === 'overview' && (
          <OverviewStep
            key="overview"
            recommendations={highConfidence}
            lowConfidenceCount={lowConfidence.length}
            onStart={next}
          />
        )}

        {CATEGORY_STEPS.map(cs => cs.key === step && (
          <CategoryStep
            key={cs.key}
            category={cs.category}
            label={cs.label}
            recommendations={highConfidence.filter(r => r.category === cs.category)}
            approvedIds={approvedIds}
            skippedIds={skippedIds}
            onApprove={(id) => setApprovedIds(prev => new Set([...prev, id]))}
            onSkip={(id) => setSkippedIds(prev => new Set([...prev, id]))}
            onApproveAll={(ids) => setApprovedIds(prev => new Set([...prev, ...ids]))}
            onSkipAll={(ids) => setSkippedIds(prev => new Set([...prev, ...ids]))}
            onNext={next}
            onBack={back}
          />
        ))}

        {step === 'low-confidence' && (
          <LowConfidenceStep
            key="low-confidence"
            recommendations={lowConfidence}
            approvedIds={approvedIds}
            onApprove={(id, folderId) => {
              void folderId
              setApprovedIds(prev => new Set([...prev, id]))
            }}
            onSkip={(id) => setSkippedIds(prev => new Set([...prev, id]))}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 'simulation' && (
          <SimulationStep
            key="simulation"
            recommendations={mockRecommendations}
            approvedIds={approvedIds}
            onExecute={next}
            onBack={back}
          />
        )}

        {step === 'complete' && (
          <CompleteStep
            key="complete"
            approvedCount={approvedIds.size}
            skippedCount={skippedIds.size}
            onDone={() => setStep('overview')}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}

function StepProgress({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1 shrink-0">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            i < current
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : i === current
              ? 'bg-fluent-accent text-white shadow-fluent-4'
              : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-80 dark:text-fluent-neutral-80'
          }`}>
            {i < current ? '✓' : i + 1}
            <span>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={12} className="text-fluent-neutral-50 dark:text-fluent-neutral-100" />
          )}
        </div>
      ))}
    </div>
  )
}

function OverviewStep({ recommendations, lowConfidenceCount, onStart }: {
  recommendations: typeof mockRecommendations
  lowConfidenceCount: number
  onStart: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      {/* AI summary card */}
      <div className="rounded-fluent-lg bg-gradient-to-br from-fluent-accent to-blue-600 p-5 text-white mb-5 shadow-fluent-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} />
          <span className="font-semibold">AI Analysis Complete</span>
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4">
          DeskPilot AI has analyzed your desktop and found {recommendations.length + lowConfidenceCount} files that can be organized. Nothing has been moved yet.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Auto-applicable', value: recommendations.filter(r => r.isAutoApplicable).length, color: 'bg-white/20' },
            { label: 'Needs review', value: recommendations.filter(r => !r.isAutoApplicable).length, color: 'bg-white/15' },
            { label: 'Low confidence', value: lowConfidenceCount, color: 'bg-amber-500/30' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-fluent px-3 py-2`}>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-white/70 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-fluent bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 mb-5 text-sm text-blue-700 dark:text-blue-300">
        <Info size={15} className="shrink-0 mt-0.5" />
        <p>You will review files <strong>by category</strong>, one group at a time. Nothing moves until you confirm at the simulation step.</p>
      </div>

      <Button variant="primary" size="lg" onClick={onStart} iconRight={<ChevronRight size={16} />}>
        Start Review
      </Button>
    </motion.div>
  )
}

function CompleteStep({ approvedCount, skippedCount, onDone }: {
  approvedCount: number
  skippedCount: number
  onDone: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-fluent-16"
      >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18l8 8L30 10" />
        </svg>
      </motion.div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2">
        Organization Complete
      </h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-2">
        {approvedCount} file{approvedCount !== 1 ? 's' : ''} moved · {skippedCount} skipped
      </p>
      <p className="text-sm text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-8">
        DeskPilot AI has learned from your decisions and updated its rules.
      </p>
      <Button variant="primary" onClick={onDone}>
        Back to Overview
      </Button>
    </motion.div>
  )
}
