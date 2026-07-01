import { motion } from 'framer-motion'
import { AnimatedCounter } from '../../../app/components/ui/AnimatedCounter'

interface HealthScoreRingProps {
  score: number
  color: string
  label: string
}

export function HealthScoreRing({ score, color, label }: HealthScoreRingProps) {
  const radius = 52
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          {/* Track */}
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-fluent-neutral-30 dark:text-fluent-neutral-120"
          />
          {/* Progress */}
          <motion.circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
            <AnimatedCounter value={score} duration={1200} />
          </span>
          <span className="text-[10px] font-semibold text-fluent-neutral-80 uppercase tracking-wider">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold" style={{ color }}>{label}</p>
        <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">Desktop Health</p>
      </div>
    </div>
  )
}
