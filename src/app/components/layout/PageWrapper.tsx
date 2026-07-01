import { motion } from 'framer-motion'
import { cn } from '../../../shared/utils/cn'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}

export function PageWrapper({ children, className, maxWidth = 'lg' }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn('p-6 mx-auto w-full', maxWidths[maxWidth], className)}
    >
      {children}
    </motion.div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  icon?: React.ReactNode
}

export function PageHeader({ title, description, actions, icon }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-fluent bg-fluent-accent/10 dark:bg-fluent-accent/20 flex items-center justify-center text-fluent-accent shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
