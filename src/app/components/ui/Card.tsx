import { motion } from 'framer-motion'
import { cn } from '../../../shared/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glass?: boolean
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, className, hover, onClick, padding = 'md', glass }: CardProps) {
  const base = cn(
    'rounded-fluent-lg border transition-all duration-200',
    glass
      ? 'bg-white/70 dark:bg-fluent-neutral-130/70 backdrop-blur-fluent border-white/30 dark:border-white/10 shadow-fluent-8'
      : 'bg-white dark:bg-fluent-neutral-130 border-fluent-neutral-40/60 dark:border-fluent-neutral-120/60 shadow-fluent-4',
    paddingMap[padding],
    hover && 'hover:shadow-fluent-8 hover:border-fluent-neutral-60/60 dark:hover:border-fluent-neutral-100/60 cursor-default',
    onClick && 'cursor-default',
    className,
  )

  if (onClick || hover) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={hover ? { y: -1 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={base}>{children}</div>
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-10 tracking-tight', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5', className)}>
      {children}
    </p>
  )
}
