import { forwardRef } from 'react'
import { cn } from '../../../shared/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-fluent-neutral-110 dark:text-fluent-neutral-50 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-fluent-neutral-80 dark:text-fluent-neutral-80 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full h-9 px-3 text-sm rounded-fluent transition-all duration-150',
              'bg-white dark:bg-fluent-neutral-120',
              'border border-fluent-neutral-50 dark:border-fluent-neutral-100',
              'text-fluent-neutral-140 dark:text-fluent-neutral-10',
              'placeholder:text-fluent-neutral-70 dark:placeholder:text-fluent-neutral-90',
              'focus:outline-none focus:border-fluent-accent focus:ring-1 focus:ring-fluent-accent/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-400 focus:border-red-400 focus:ring-red-400/30',
              icon ? 'pl-9' : undefined,
              iconRight ? 'pr-9' : undefined,
              className,
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 text-fluent-neutral-80 dark:text-fluent-neutral-80">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
