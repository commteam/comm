import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '../../app/stores/settings.store'
import { useToast } from '../../hooks/useToast'
import { useElectron } from '../../hooks/useElectron'
import { APP_NAME, APP_TAGLINE, ROUTES } from '../../shared/constants'

type Step = 'welcome' | 'desktop-path' | 'scan' | 'complete'

const STEPS: Step[] = ['welcome', 'desktop-path', 'scan', 'complete']

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const { settings, updateSettings } = useSettingsStore()
  const toast = useToast()
  const electron = useElectron()
  const navigate = useNavigate()

  const stepIndex = STEPS.indexOf(step)

  async function handleSelectFolder() {
    const folder = await electron.selectFolder()
    if (folder) {
      await updateSettings({ general: { ...settings!.general, desktopPath: folder } })
      toast.success('Desktop path updated', folder)
    }
  }

  async function handleScan() {
    setIsScanning(true)
    try {
      const result = await electron.scanDesktop()
      if (result.success) {
        setScanComplete(true)
        toast.success('Scan complete', `Found ${result.data?.totalFiles ?? 0} files`)
      } else {
        toast.error('Scan failed', result.error)
      }
    } finally {
      setIsScanning(false)
    }
  }

  async function handleComplete() {
    await updateSettings({
      general: { ...settings!.general, onboardingCompleted: true, firstRunCompleted: true },
    })
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-fluent-neutral-10 dark:bg-fluent-neutral-140 p-8">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-12">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= stepIndex
                ? 'bg-fluent-accent w-8'
                : 'bg-fluent-neutral-50 dark:bg-fluent-neutral-110 w-4'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="max-w-lg w-full text-center"
        >
          {step === 'welcome' && (
            <WelcomeStep onNext={() => setStep('desktop-path')} />
          )}
          {step === 'desktop-path' && (
            <DesktopPathStep
              currentPath={settings?.general.desktopPath ?? ''}
              onSelectFolder={handleSelectFolder}
              onNext={() => setStep('scan')}
              onBack={() => setStep('welcome')}
            />
          )}
          {step === 'scan' && (
            <ScanStep
              isScanning={isScanning}
              scanComplete={scanComplete}
              onScan={handleScan}
              onNext={() => setStep('complete')}
              onBack={() => setStep('desktop-path')}
            />
          )}
          {step === 'complete' && (
            <CompleteStep onFinish={handleComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div>
      <div className="w-20 h-20 rounded-2xl bg-fluent-accent flex items-center justify-center mx-auto mb-8 shadow-fluent-16">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="14" height="14" rx="3" fill="white" />
          <rect x="22" y="4" width="14" height="14" rx="3" fill="white" opacity="0.7" />
          <rect x="4" y="22" width="14" height="14" rx="3" fill="white" opacity="0.7" />
          <rect x="22" y="22" width="14" height="14" rx="3" fill="white" opacity="0.4" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">
        {APP_NAME}
      </h1>
      <p className="text-fluent-neutral-90 dark:text-fluent-neutral-70 text-lg mb-2">
        {APP_TAGLINE}
      </p>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
        DeskPilot AI learns how you naturally organize your desktop and makes intelligent recommendations — always with your approval.
      </p>
      <button className="fluent-btn-primary px-8 py-3 text-base" onClick={onNext}>
        Get Started
      </button>
    </div>
  )
}

function DesktopPathStep({
  currentPath,
  onSelectFolder,
  onNext,
  onBack,
}: {
  currentPath: string
  onSelectFolder: () => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">
        Where is your desktop?
      </h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-8">
        DeskPilot AI will monitor this folder. You can change it anytime in Settings.
      </p>

      <div className="fluent-card p-4 mb-4 text-left">
        <p className="text-xs font-medium text-fluent-neutral-90 dark:text-fluent-neutral-70 mb-1">
          Current path
        </p>
        <p className="text-sm text-fluent-neutral-130 dark:text-fluent-neutral-20 font-mono break-all">
          {currentPath || 'Not selected'}
        </p>
      </div>

      <button className="fluent-btn-secondary w-full mb-8" onClick={onSelectFolder}>
        Choose a Different Folder
      </button>

      <div className="flex gap-3">
        <button className="fluent-btn-ghost flex-1" onClick={onBack}>Back</button>
        <button className="fluent-btn-primary flex-1" onClick={onNext} disabled={!currentPath}>
          Continue
        </button>
      </div>
    </div>
  )
}

function ScanStep({
  isScanning,
  scanComplete,
  onScan,
  onNext,
  onBack,
}: {
  isScanning: boolean
  scanComplete: boolean
  onScan: () => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">
        Scan your desktop
      </h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-8">
        DeskPilot AI will analyze your files and discover existing folders. Nothing will be moved yet.
      </p>

      {scanComplete ? (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-fluent p-4 mb-8">
          <p className="text-green-700 dark:text-green-400 font-semibold">Scan complete!</p>
          <p className="text-green-600 dark:text-green-500 text-sm mt-1">Your desktop has been analyzed.</p>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center mb-8">
          {isScanning && (
            <div className="flex items-center gap-3 text-fluent-neutral-90">
              <div className="w-5 h-5 border-2 border-fluent-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Scanning...</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button className="fluent-btn-ghost flex-1" onClick={onBack} disabled={isScanning}>
          Back
        </button>
        {!scanComplete ? (
          <button className="fluent-btn-primary flex-1" onClick={onScan} disabled={isScanning}>
            {isScanning ? 'Scanning...' : 'Scan Now'}
          </button>
        ) : (
          <button className="fluent-btn-primary flex-1" onClick={onNext}>
            Continue
          </button>
        )}
      </div>
    </div>
  )
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div>
      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-8 shadow-fluent-16">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18l8 8L30 10" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">
        You're all set!
      </h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
        DeskPilot AI is ready. Head to the dashboard to see your first organization recommendations.
      </p>
      <button className="fluent-btn-primary px-8 py-3 text-base" onClick={onFinish}>
        Open Dashboard
      </button>
    </div>
  )
}
