import { motion } from 'framer-motion'
import { cn } from '../../../shared/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  label?: string
  description?: string
}

export function Switch({ checked, onChange, disabled, size = 'md', label, description }: SwitchProps) {
  const track = size === 'sm' ? 'w-8 h-4' : 'w-10 h-5'
  const thumb = size === 'sm' ? 'w-3 h-3 top-0.5 left-0.5' : 'w-3.5 h-3.5 top-[3px] left-[3px]'
  const translateX = size === 'sm' ? 16 : 20

  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative shrink-0 rounded-full transition-colors duration-200 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-fluent-accent/50 focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        track,
        checked ? 'bg-fluent-accent' : 'bg-fluent-neutral-60 dark:bg-fluent-neutral-100',
      )}
    >
      <motion.span
        className={cn('absolute rounded-full bg-white shadow-sm', thumb)}
        animate={{ x: checked ? translateX : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )

  if (!label) return toggle

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20">{label}</p>
        {description && <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5">{description}</p>}
      </div>
      {toggle}
    </div>
  )
}
