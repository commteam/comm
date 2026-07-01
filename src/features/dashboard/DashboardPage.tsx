import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ScanLine, Sparkles, Eye, Undo2, Shield,
  HardDrive, Clock, TrendingUp, FileText,
  Zap, ChevronRight, AlertCircle,
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
import { mockDashboardStats, getHealthColor, getHealthLabel } from '../../shared/mock/dashboard'
import { ROUTES } from '../../shared/constants'
import { formatRelativeTime } from '../../shared/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const stats = mockDashboardStats
  const healthColor = getHealthColor(stats.healthScore)
  const healthLabel = getHealthLabel(stats.healthScore)

  return (
    <PageWrapper maxWidth="xl">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-7"
      >
        <h1 className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 tracking-tight">
          Welcome back.
        </h1>
        <p className="text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-1">
          Your desktop looks {healthLabel.toLowerCase()} today.
        </p>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">

        {/* Top row — Health + AI Card */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {/* Health score */}
          <Card className="col-span-1 flex flex-col items-center justify-center py-6">
            <HealthScoreRing score={stats.healthScore} color={healthColor} label={healthLabel} />
            <div className="mt-3 flex items-center gap-1 text-xs">
              <TrendingUp size={11} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">+{stats.healthTrend}% this week</span>
            </div>
          </Card>

          {/* AI assistant card */}
          <div className="col-span-2">
            <AIAssistantCard
              filesFound={stats.newFiles}
              autoOrganizable={stats.newFiles - stats.needsReview}
              needsReview={stats.needsReview}
              lastScan={stats.lastOrganized}
              onOrganize={() => navigate(ROUTES.ORGANIZE)}
              onReview={() => navigate(ROUTES.ORGANIZE)}
            />
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4">
          <StatCard
            label="New Files"
            value={stats.newFiles}
            icon={<FileText size={16} />}
            color="blue"
            onClick={() => navigate(ROUTES.SCAN)}
          />
          <StatCard
            label="Needs Review"
            value={stats.needsReview}
            icon={<AlertCircle size={16} />}
            color="amber"
            badge={stats.needsReview > 0 ? 'Action needed' : undefined}
            onClick={() => navigate(ROUTES.ORGANIZE)}
          />
          <StatCard
            label="AI Accuracy"
            value={stats.aiAccuracy}
            suffix="%"
            decimals={1}
            icon={<Zap size={16} />}
            color="purple"
          />
          <StatCard
            label="Learned Rules"
            value={stats.learnedRules}
            icon={<TrendingUp size={16} />}
            color="green"
            onClick={() => navigate(ROUTES.RULES)}
          />
        </motion.div>

        {/* Mid row */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {/* Storage */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <HardDrive size={15} className="text-fluent-neutral-80" />
            </CardHeader>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                  {stats.storageUsed.toFixed(1)} <span className="text-sm font-normal text-fluent-neutral-80">GB</span>
                </span>
                <span className="text-xs text-fluent-neutral-80">of {stats.storageTotalGb} GB</span>
              </div>
              <ProgressBar
                value={stats.storageUsed}
                max={stats.storageTotalGb}
                variant={stats.storageUsed / stats.storageTotalGb > 0.8 ? 'warning' : 'accent'}
                size="md"
              />
              <p className="text-xs text-fluent-neutral-80">{Math.round((stats.storageUsed / stats.storageTotalGb) * 100)}% used across organized folders</p>
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
                {stats.protectedFolders}
                <span className="text-sm font-normal text-fluent-neutral-80 ml-1">folders</span>
              </div>
              <p className="text-xs text-fluent-neutral-80">DeskPilot AI will never touch these</p>
              <Button variant="ghost" size="xs" className="mt-2" onClick={() => navigate(ROUTES.FOLDER_PROFILES)}>
                Manage <ChevronRight size={11} />
              </Button>
            </div>
          </Card>

          {/* Last organization */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Last Session</CardTitle>
              <Clock size={15} className="text-fluent-neutral-80" />
            </CardHeader>
            <div className="space-y-2">
              <p className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
                {formatRelativeTime(stats.lastOrganized)}
              </p>
              <p className="text-xs text-fluent-neutral-80">
                <AnimatedCounter value={stats.totalFilesOrganized} /> files organized total
              </p>
              <p className="text-xs text-fluent-neutral-80">
                {stats.sessionsCompleted} sessions completed
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
