import { motion } from 'framer-motion'
import { useSettingsStore } from '../../app/stores/settings.store'

export function DashboardPage() {
  const { settings } = useSettingsStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Welcome back.
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Your desktop is being watched over.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatusCard
          title="Desktop Path"
          value={settings?.general.desktopPath.split(/[\\/]/).pop() ?? '—'}
          subtitle="Monitored location"
          color="blue"
        />
        <StatusCard
          title="AI Provider"
          value="Local AI"
          subtitle="No internet needed"
          color="green"
        />
        <StatusCard
          title="Status"
          value="Ready"
          subtitle="Awaiting first scan"
          color="neutral"
        />
      </div>

      {/* Getting started */}
      <div className="fluent-card p-6">
        <h2 className="text-base font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-4">
          Getting started
        </h2>
        <div className="space-y-3">
          {[
            { step: 1, label: 'Complete onboarding to scan your desktop', done: settings?.general.onboardingCompleted },
            { step: 2, label: 'Review AI folder recommendations', done: false },
            { step: 3, label: 'Approve or skip each suggestion', done: false },
            { step: 4, label: 'DeskPilot learns from your decisions', done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${done
                  ? 'bg-green-500 text-white'
                  : 'bg-fluent-neutral-30 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70'
                }
              `}>
                {done ? '✓' : step}
              </div>
              <span className={`text-sm ${done ? 'line-through text-fluent-neutral-80' : 'text-fluent-neutral-130 dark:text-fluent-neutral-20'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface StatusCardProps {
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'neutral'
}

function StatusCard({ title, value, subtitle, color }: StatusCardProps) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    neutral: 'bg-fluent-neutral-20 dark:bg-fluent-neutral-130 border-fluent-neutral-50 dark:border-fluent-neutral-110',
  }

  return (
    <div className={`rounded-fluent border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium text-fluent-neutral-90 dark:text-fluent-neutral-70 uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-lg font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
        {value}
      </p>
      <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5">
        {subtitle}
      </p>
    </div>
  )
}
