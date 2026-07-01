import { motion } from 'framer-motion'
import { cn } from '../../../shared/utils/cn'

type ProgressVariant = 'accent' | 'success' | 'warning' | 'error'

const variantColors: Record<ProgressVariant, string> = {
  accent: 'bg-fluent-accent',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

interface ProgressBarProps {
  value: number
  max?: number
  variant?: ProgressVariant
  size?: 'xs' | 'sm' | 'md'
  animated?: boolean
  className?: string
  showLabel?: boolean
}

const sizeH = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }

export function ProgressBar({
  value,
  max = 100,
  variant = 'accent',
  size = 'sm',
  animated = true,
  className,
  showLabel,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-1">
          <span />
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-fluent-neutral-30 dark:bg-fluent-neutral-120 rounded-full overflow-hidden', sizeH[size])}>
        <motion.div
          className={cn('h-full rounded-full', variantColors[variant])}
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  )
}
