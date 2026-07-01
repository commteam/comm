import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, FolderOpen, Check, ChevronRight, ScanLine, Sparkles,
  Shield, Edit2, XCircle, CheckCircle2, Lock, Wifi, Cloud, Eye, FileText, Cpu,
} from 'lucide-react'
import { useSettingsStore } from '../../app/stores/settings.store'
import { useToast } from '../../hooks/useToast'
import { useElectron } from '../../hooks/useElectron'
import { APP_NAME, APP_TAGLINE, ROUTES } from '../../shared/constants'
import { Button } from '../../app/components/ui/Button'
import { Card } from '../../app/components/ui/Card'
import { cn } from '../../shared/utils/cn'

type Step = 'welcome' | 'privacy' | 'desktop-path' | 'folder-discovery' | 'ai-learning' | 'scan' | 'complete'

const STEPS: Step[] = ['welcome', 'privacy', 'desktop-path', 'folder-discovery', 'ai-learning', 'scan', 'complete']

const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome',
  privacy: 'Privacy',
  'desktop-path': 'Desktop Path',
  'folder-discovery': 'Folders',
  'ai-learning': 'AI Learning',
  scan: 'First Scan',
  complete: 'Ready',
}

const MOCK_DISCOVERED_FOLDERS = [
  { id: 'f1', name: 'Documents', path: 'C:/Users/You/Desktop/Documents', fileCount: 24, confirmed: true },
  { id: 'f2', name: 'Screenshots', path: 'C:/Users/You/Desktop/Screenshots', fileCount: 87, confirmed: true },
  { id: 'f3', name: 'Projects', path: 'C:/Users/You/Desktop/Projects', fileCount: 12, confirmed: true },
  { id: 'f4', name: 'Downloads_Old', path: 'C:/Users/You/Desktop/Downloads_Old', fileCount: 6, confirmed: null },
  { id: 'f5', name: 'Random Stuff', path: 'C:/Users/You/Desktop/Random Stuff', fileCount: 31, confirmed: null },
]

export function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [folders, setFolders] = useState(MOCK_DISCOVERED_FOLDERS)
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
      await new Promise(r => setTimeout(r, 2000))
      setScanComplete(true)
      toast.success('Scan complete', 'Found 47 files on your desktop')
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

  function setFolderStatus(id: string, confirmed: boolean | null) {
    setFolders(fs => fs.map(f => f.id === id ? { ...f, confirmed } : f))
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-fluent-neutral-10 dark:bg-fluent-neutral-140 p-8">
      {/* Step progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => {
          const isDone = i < stepIndex
          const isActive = i === stepIndex
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all',
                isDone ? 'bg-green-500 text-white' : isActive ? 'bg-fluent-accent text-white' : 'bg-fluent-neutral-40 dark:bg-fluent-neutral-110 text-fluent-neutral-80',
              )}>
                {isDone ? <Check size={11} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('w-8 h-0.5 rounded-full transition-all', isDone ? 'bg-green-500' : 'bg-fluent-neutral-40 dark:bg-fluent-neutral-110')} />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-10">{STEP_LABELS[step]}</p>

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
            <WelcomeStep onNext={() => setStep('privacy')} />
          )}
          {step === 'privacy' && (
            <PrivacyStep onNext={() => setStep('desktop-path')} />
          )}
          {step === 'desktop-path' && (
            <DesktopPathStep
              currentPath={settings?.general.desktopPath ?? ''}
              onSelectFolder={handleSelectFolder}
              onNext={() => setStep('folder-discovery')}
              onBack={() => setStep('privacy')}
            />
          )}
          {step === 'folder-discovery' && (
            <FolderDiscoveryStep
              folders={folders}
              onFolderStatus={setFolderStatus}
              onNext={() => setStep('ai-learning')}
              onBack={() => setStep('desktop-path')}
            />
          )}
          {step === 'ai-learning' && (
            <AILearningStep
              onNext={() => setStep('scan')}
              onBack={() => setStep('folder-discovery')}
            />
          )}
          {step === 'scan' && (
            <ScanStep
              isScanning={isScanning}
              scanComplete={scanComplete}
              onScan={handleScan}
              onNext={() => setStep('complete')}
              onBack={() => setStep('ai-learning')}
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
      <div className="w-20 h-20 rounded-fluent-xl bg-fluent-accent flex items-center justify-center mx-auto mb-8 shadow-fluent-16">
        <Brain size={36} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">{APP_NAME}</h1>
      <p className="text-fluent-neutral-90 dark:text-fluent-neutral-70 text-lg mb-2">{APP_TAGLINE}</p>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
        DeskPilot AI learns how you naturally organize your desktop and makes intelligent recommendations — always with your approval. Nothing moves without you saying so.
      </p>
      <Button variant="primary" size="lg" onClick={onNext} icon={<ChevronRight size={16} />}>
        Get Started
      </Button>
    </div>
  )
}

function PrivacyStep({ onNext }: { onNext: () => void }) {
  const [acknowledged, setAcknowledged] = useState(false)

  const neverItems = [
    { icon: FileText, label: 'Reads document contents' },
    { icon: Eye, label: 'Opens your files' },
    { icon: Cloud, label: 'Uploads files to the cloud' },
    { icon: Wifi, label: 'Sends data to external services' },
    { icon: Cpu, label: 'Uses cloud AI providers' },
    { icon: Shield, label: 'Collects telemetry' },
  ]

  const onlyItems = [
    'File name and extension',
    'Folder location',
    'File size',
    'Created and modified dates',
    'User-approved organization history',
  ]

  return (
    <div className="text-left">
      <div className="flex items-center gap-3 mb-5 justify-center">
        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Lock size={18} className="text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">Privacy & Security</h2>
          <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">Please read before continuing</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Never column */}
        <Card padding="sm" className="border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
          <div className="flex items-center gap-1.5 mb-3">
            <XCircle size={13} className="text-red-500" />
            <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">DeskPilot AI NEVER</p>
          </div>
          <div className="space-y-2">
            {neverItems.map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-2 text-xs text-fluent-neutral-110 dark:text-fluent-neutral-50">
                  <Icon size={11} className="text-red-400 shrink-0" />
                  {item.label}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Only column */}
        <Card padding="sm" className="border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 size={13} className="text-green-500" />
            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">ONLY uses</p>
          </div>
          <div className="space-y-2">
            {onlyItems.map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-fluent-neutral-110 dark:text-fluent-neutral-50">
                <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="sm" className="mb-4 bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30">
        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
          <strong>Everything runs locally on your computer.</strong> DeskPilot AI works completely offline and never requires an internet connection. No data ever leaves your device.
        </p>
      </Card>

      {/* Mandatory acknowledgment checkbox */}
      <label className="flex items-start gap-3 mb-5 cursor-pointer group">
        <div
          onClick={() => setAcknowledged(a => !a)}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
            acknowledged
              ? 'bg-fluent-accent border-fluent-accent'
              : 'border-fluent-neutral-60 dark:border-fluent-neutral-90 hover:border-fluent-accent',
          )}
        >
          {acknowledged && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50 leading-relaxed">
          I understand that DeskPilot AI only uses file metadata and never reads or uploads my files. All processing stays on my computer.
        </span>
      </label>

      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={onNext}
        disabled={!acknowledged}
        icon={<ChevronRight size={15} />}
      >
        I understand — Continue
      </Button>
    </div>
  )
}

function DesktopPathStep({ currentPath, onSelectFolder, onNext, onBack }: {
  currentPath: string; onSelectFolder: () => void; onNext: () => void; onBack: () => void
}) {
  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2 text-center">Where is your desktop?</h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-6 text-center">
        DeskPilot AI will monitor this folder. You can change it anytime in Settings.
      </p>
      <Card padding="md" className="mb-3">
        <p className="text-xs font-semibold text-fluent-neutral-90 dark:text-fluent-neutral-70 mb-1 uppercase tracking-wide">Current path</p>
        <p className="text-sm text-fluent-neutral-130 dark:text-fluent-neutral-20 font-mono break-all">
          {currentPath || 'C:/Users/You/Desktop'}
        </p>
      </Card>
      <Button variant="outline" size="sm" icon={<FolderOpen size={13} />} className="w-full mb-8" onClick={onSelectFolder}>
        Choose a Different Folder
      </Button>
      <div className="flex gap-3">
        <Button variant="ghost" size="md" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

function FolderDiscoveryStep({ folders, onFolderStatus, onNext, onBack }: {
  folders: typeof MOCK_DISCOVERED_FOLDERS
  onFolderStatus: (id: string, confirmed: boolean | null) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2 text-center">Folders discovered</h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-5 text-center">
        DeskPilot AI found these folders on your desktop. Confirm which ones it should learn from.
      </p>
      <div className="space-y-2 mb-6">
        {folders.map(folder => (
          <Card key={folder.id} padding="sm" className={cn(
            'flex items-center gap-3 transition-all',
            folder.confirmed === false && 'opacity-40',
          )}>
            <FolderOpen size={16} className={folder.confirmed === false ? 'text-fluent-neutral-60' : 'text-amber-500'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">{folder.name}</p>
              <p className="text-[10px] text-fluent-neutral-70 dark:text-fluent-neutral-90 truncate">{folder.fileCount} files</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onFolderStatus(folder.id, true)}
                className={cn('px-2 py-1 rounded text-xs font-semibold transition-all', folder.confirmed === true ? 'bg-green-500 text-white' : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-80 hover:bg-green-100 hover:text-green-700')}
              >
                <Check size={11} className="inline mr-1" />Correct
              </button>
              <button
                onClick={() => onFolderStatus(folder.id, null)}
                className={cn('px-2 py-1 rounded text-xs font-semibold transition-all', 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-80 hover:bg-blue-100 hover:text-blue-700')}
              >
                <Edit2 size={11} className="inline mr-1" />Rename
              </button>
              <button
                onClick={() => onFolderStatus(folder.id, false)}
                className={cn('px-2 py-1 rounded text-xs font-semibold transition-all', folder.confirmed === false ? 'bg-fluent-neutral-60 text-white' : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-80 hover:bg-red-50 hover:text-red-600')}
              >
                Skip
              </button>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-4 text-center">
        {folders.filter(f => f.confirmed === true).length} of {folders.length} folders confirmed
      </p>
      <div className="flex gap-3">
        <Button variant="ghost" size="md" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onNext}>Continue</Button>
      </div>
    </div>
  )
}

function AILearningStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const features = [
    { icon: Brain, title: 'Learns from every decision', desc: 'When you approve or skip a recommendation, DeskPilot AI updates its confidence model instantly.' },
    { icon: Shield, title: 'Never asks the same question twice', desc: 'Once confidence is high enough (≥ 90%), DeskPilot AI stops asking about that file type and folder pairing.' },
    { icon: Sparkles, title: 'Improves after every session', desc: 'The more you use DeskPilot AI, the smarter and faster it gets at predicting where files belong.' },
    { icon: ScanLine, title: 'All processing is local', desc: 'No files or personal data ever leave your machine. Everything runs privately on your device.' },
  ]

  return (
    <div className="text-left">
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2 text-center">How AI learning works</h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-5 text-center">
        DeskPilot AI builds a personal model of your organization style — no account, no cloud, no guessing.
      </p>
      <div className="space-y-3 mb-6">
        {features.map(f => {
          const Icon = f.icon
          return (
            <Card key={f.title} padding="sm" className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent/15 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-fluent-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">{f.title}</p>
                <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </Card>
          )
        })}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" size="md" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="primary" size="md" className="flex-1" onClick={onNext}>Got it — continue</Button>
      </div>
    </div>
  )
}

function ScanStep({ isScanning, scanComplete, onScan, onNext, onBack }: {
  isScanning: boolean; scanComplete: boolean; onScan: () => void; onNext: () => void; onBack: () => void
}) {
  return (
    <div>
      <div className="w-16 h-16 rounded-fluent-xl bg-fluent-neutral-30 dark:bg-fluent-neutral-110 flex items-center justify-center mx-auto mb-6">
        <ScanLine size={28} className={isScanning ? 'text-fluent-accent animate-pulse' : 'text-fluent-neutral-80'} />
      </div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-2">First scan</h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-6 max-w-sm mx-auto">
        DeskPilot AI will analyze your desktop files using metadata only. No files are opened or read.
      </p>

      {scanComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-fluent p-4 mb-6 text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <Check size={15} className="text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Scan complete!</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            {[{ label: 'Files found', value: '47' }, { label: 'Categories', value: '6' }, { label: 'Suggestions', value: '38' }].map(s => (
              <div key={s.label} className="bg-green-100 dark:bg-green-900/30 rounded-fluent p-2">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{s.value}</p>
                <p className="text-[10px] text-green-600 dark:text-green-500">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {isScanning && (
        <div className="flex items-center justify-center gap-3 mb-6 text-fluent-neutral-90 dark:text-fluent-neutral-70">
          <div className="w-5 h-5 border-2 border-fluent-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Scanning metadata…</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" size="md" className="flex-1" onClick={onBack} disabled={isScanning}>Back</Button>
        {!scanComplete
          ? <Button variant="primary" size="md" className="flex-1" onClick={onScan} disabled={isScanning}>
              {isScanning ? 'Scanning…' : 'Start Scan'}
            </Button>
          : <Button variant="primary" size="md" className="flex-1" onClick={onNext}>Continue</Button>
        }
      </div>
    </div>
  )
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-8 shadow-fluent-16"
      >
        <Check size={36} className="text-white" strokeWidth={3} />
      </motion.div>
      <h2 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-3">You're all set!</h2>
      <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 text-sm mb-4 max-w-sm mx-auto leading-relaxed">
        DeskPilot AI is ready. Head to the dashboard to review your first organization recommendations.
      </p>
      <div className="flex flex-col gap-1.5 items-center mb-8">
        {['38 files ready to organize', 'AI learned 3 folder profiles', 'All your existing folders protected', 'Your files were never opened or read'].map(tip => (
          <div key={tip} className="flex items-center gap-2 text-sm text-fluent-neutral-80 dark:text-fluent-neutral-80">
            <Check size={13} className="text-green-500" />
            {tip}
          </div>
        ))}
      </div>
      <Button variant="primary" size="lg" onClick={onFinish} icon={<ChevronRight size={16} />}>
        Open Dashboard
      </Button>
    </div>
  )
}
