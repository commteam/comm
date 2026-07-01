import { cn } from '../../../shared/utils/cn'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  label?: string
  className?: string
  disabled?: boolean
}

export function Select({ value, onChange, options, label, className, disabled }: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full h-9 pl-3 pr-8 text-sm rounded-fluent appearance-none transition-all duration-150',
            'bg-white dark:bg-fluent-neutral-120',
            'border border-fluent-neutral-50 dark:border-fluent-neutral-100',
            'text-fluent-neutral-140 dark:text-fluent-neutral-10',
            'focus:outline-none focus:border-fluent-accent focus:ring-1 focus:ring-fluent-accent/30',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-fluent-neutral-80 dark:text-fluent-neutral-80"
        />
      </div>
    </div>
  )
}
