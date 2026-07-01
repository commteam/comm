import { cn } from '../../../shared/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'muted'
type BadgeSize = 'sm' | 'md'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70',
  success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  accent: 'bg-fluent-accent/10 dark:bg-fluent-accent/20 text-fluent-accent dark:text-fluent-accent-light',
  muted: 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-80 dark:text-fluent-neutral-80',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = 'default', size = 'md', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
