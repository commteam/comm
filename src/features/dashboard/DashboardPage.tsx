import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ScanLine, Sparkles, Eye, Undo2, Shield,
  HardDrive, Clock, TrendingUp, FileText,
  Zap, ChevronRight, AlertCircle, RefreshCw,
} from 'lucide-react'
import { PageWrapper } from '../../app/components/layout/PageWrapper'
import { Card, CardHeader, CardTitle } from '../../app/components/ui/Card'
import { Button } from '../../app/components/ui/Button'
import { Badge } from '../../app/components/ui/Badge'
import { ProgressBar } from '../../app/components/ui/ProgressBar'
import { AnimatedCounter } from '../../app/components/ui/AnimatedCounter'
import { HealthScoreRing } from './components/HealthScoreRing'
import { AIAssistantCard } from './components/AIAssistantCard'
import { RecentActivityPreview } from './components/RecentActivityPreview'
import { getHealthColor, getHealthLabel } from '../../shared/mock/dashboard'
import { ROUTES } from '../../shared/constants'
import { formatRelativeTime } from '../../shared/utils'
import { useDesktopStats } from '../../hooks/useIntelligence'
import { useState, useEffect } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

const api = () => (window as any).electronAPI

export function DashboardPage() {
  const navigate = useNavigate()
  const { stats, breakdown, loading, refresh } = useDesktopStats()
  const [hasPendingRecovery, setHasPendingRecovery] = useState(false)

  useEffect(() => {
    api().checkRecovery?.()
      .then((res: { success: boolean; data: { recovered: boolean } | null }) => {
        if (res.success && res.data) setHasPendingRecovery(true)
      })
      .catch(() => { })
  }, [])

  const healthScore = stats?.healthScore ?? 0
  const healthColor = getHealthColor(healthScore)
  const healthLabel = getHealthLabel(healthScore)

  const newFiles = stats?.newFiles ?? 0
  const needsReview = stats?.needsReview ?? 0
  const autoOrganizable = newFiles - needsReview
  const duplicateFiles = stats?.duplicateFiles ?? 0

  const reviewTimeMin = stats ? Math.round(stats.needsReview * 0.5) : 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning.'
    if (hour < 17) return 'Good afternoon.'
    return 'Good evening.'
  }

  const getSummary = () => {
    if (!stats) return 'Loading your desktop intelligence...'
    const parts: string[] = []
    if (newFiles > 0) parts.push(`${newFiles} new file${newFiles !== 1 ? 's' : ''} found`)
    if (autoOrganizable > 0) parts.push(`${autoOrganizable} can be organized automatically`)
    if (needsReview > 0) parts.push(`${needsReview} require${needsReview === 1 ? 's' : ''} your review`)
    if (parts.length === 0) return 'Your desktop is fully organized.'
    return parts.join('. ') + '.'
  }

  return (
    <PageWrapper maxWidth="xl">
      {hasPendingRecovery && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 px-4 py-3 rounded-fluent-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40"
        >
          <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Incomplete session detected</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">A previous organization session was interrupted. Go to Organize to resume or discard it.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.ORGANIZE)}>
            Resume
          </Button>
        </motion.div>
      )}
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7 flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-1">
            {getSummary()}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading} className="mt-1">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

        {/* Top row — Health + AI Card */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          <Card className="col-span-1 flex flex-col items-center justify-center py-6">
            <HealthScoreRing score={healthScore} color={healthColor} label={healthLabel} />
            {breakdown && (
              <div className="mt-3 flex items-center gap-1 text-xs">
                <TrendingUp size={11} className="text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {breakdown.factors.length} factors analyzed
                </span>
              </div>
            )}
          </Card>

          <div className="col-span-2">
            <AIAssistantCard
              filesFound={newFiles}
              autoOrganizable={autoOrganizable}
              needsReview={needsReview}
              lastScan={stats?.calculatedAt ?? new Date()}
              onOrganize={() => navigate(ROUTES.ORGANIZE)}
              onReview={() => navigate(ROUTES.ORGANIZE)}
            />
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
          <StatCard
            label="New Files"
            value={newFiles}
            icon={<FileText size={16} />}
            color="blue"
            onClick={() => navigate(ROUTES.SCAN)}
          />
          <StatCard
            label="Needs Review"
            value={needsReview}
            icon={<AlertCircle size={16} />}
            color="amber"
            badge={needsReview > 0 ? 'Action needed' : undefined}
            onClick={() => navigate(ROUTES.ORGANIZE)}
          />
          <StatCard
            label="Auto-Organizable"
            value={autoOrganizable > 0 ? autoOrganizable : 0}
            icon={<Zap size={16} />}
            color="purple"
          />
          <StatCard
            label="Duplicates"
            value={duplicateFiles}
            icon={<TrendingUp size={16} />}
            color="green"
            onClick={() => navigate(ROUTES.SCAN)}
          />
        </motion.div>

        {/* Mid row */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {/* Desktop overview */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Desktop Overview</CardTitle>
              <HardDrive size={15} className="text-fluent-neutral-80" />
            </CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                  {stats?.totalFiles ?? 0} <span className="text-sm font-normal text-fluent-neutral-80">files</span>
                </span>
                <span className="text-xs text-fluent-neutral-80">{stats?.alreadyOrganized ?? 0} organized</span>
              </div>
              <ProgressBar
                value={stats?.alreadyOrganized ?? 0}
                max={Math.max(stats?.totalFiles ?? 1, 1)}
                variant="accent"
                size="md"
              />
              <p className="text-xs text-fluent-neutral-80">
                {stats ? Math.round((stats.alreadyOrganized / Math.max(stats.totalFiles, 1)) * 100) : 0}% organized
                {reviewTimeMin > 0 && ` · ~${reviewTimeMin} min to review`}
              </p>
            </div>
          </Card>

          {/* Protected folders */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Protected</CardTitle>
              <Shield size={15} className="text-fluent-neutral-80" />
            </CardHeader>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                {stats?.pinnedFiles ?? 0}
                <span className="text-sm font-normal text-fluent-neutral-80 ml-1">pinned files</span>
              </div>
              <p className="text-xs text-fluent-neutral-80">DeskPilot AI will never touch these</p>
              <Button variant="ghost" size="xs" className="mt-2" onClick={() => navigate(ROUTES.FOLDER_PROFILES)}>
                Manage <ChevronRight size={11} />
              </Button>
            </div>
          </Card>

          {/* Last scan */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Last Scan</CardTitle>
              <Clock size={15} className="text-fluent-neutral-80" />
            </CardHeader>
            <div className="space-y-2">
              <p className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                {stats?.calculatedAt ? formatRelativeTime(stats.calculatedAt) : 'Never'}
              </p>
              <p className="text-xs text-fluent-neutral-80">
                {stats?.largeFiles ?? 0} large files · {stats?.oldFiles ?? 0} old files
              </p>
              <p className="text-xs text-fluent-neutral-80">
                {stats?.ignoredFiles ?? 0} ignored
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Scan Desktop', icon: ScanLine, color: 'text-blue-500', path: ROUTES.SCAN },
                { label: 'Organize Files', icon: Sparkles, color: 'text-purple-500', path: ROUTES.ORGANIZE },
                { label: 'Review', icon: Eye, color: 'text-amber-500', path: ROUTES.ORGANIZE },
                { label: 'Simulation', icon: Eye, color: 'text-green-500', path: ROUTES.ORGANIZE },
                { label: 'Undo Last', icon: Undo2, color: 'text-fluent-neutral-80', path: ROUTES.TIMELINE },
              ].map(action => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-2 p-3 rounded-fluent bg-fluent-neutral-10 dark:bg-fluent-neutral-120 hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-110 transition-colors border border-fluent-neutral-30 dark:border-fluent-neutral-110"
                  >
                    <Icon size={20} className={action.color} strokeWidth={1.75} />
                    <span className="text-xs font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50 text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={itemVariants}>
          <RecentActivityPreview onViewAll={() => navigate(ROUTES.ACTIVITY)} />
        </motion.div>

      </motion.div>
    </PageWrapper>
  )
}

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  decimals?: number
  icon: React.ReactNode
  color: 'blue' | 'amber' | 'purple' | 'green'
  badge?: string
  onClick?: () => void
}

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', value: 'text-blue-700 dark:text-blue-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400', value: 'text-amber-700 dark:text-amber-300' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', icon: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400', value: 'text-purple-700 dark:text-purple-300' },
  green: { bg: 'bg-green-50 dark:bg-green-950/30', icon: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400', value: 'text-green-700 dark:text-green-300' },
}

function StatCard({ label, value, suffix = '', decimals = 0, icon, color, badge, onClick }: StatCardProps) {
  const c = colorMap[color]
  return (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      onClick={onClick}
      className={`rounded-fluent-lg p-4 border border-transparent ${c.bg} ${onClick ? 'cursor-default' : ''} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-fluent flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        {badge && <Badge variant="warning" size="sm">{badge}</Badge>}
      </div>
      <div className={`text-2xl font-bold mb-0.5 ${c.value}`}>
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </div>
      <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 font-medium">{label}</p>
    </motion.div>
  )
}
