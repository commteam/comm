import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
type Size = 'xs' | 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary: `
    bg-fluent-accent text-white shadow-fluent-4
    hover:bg-fluent-accent-dark active:bg-fluent-accent-dark
    disabled:bg-fluent-neutral-60
  `,
  secondary: `
    bg-fluent-neutral-20 dark:bg-fluent-neutral-120
    text-fluent-neutral-130 dark:text-fluent-neutral-10
    border border-fluent-neutral-50 dark:border-fluent-neutral-110
    hover:bg-fluent-neutral-30 dark:hover:bg-fluent-neutral-110
    shadow-fluent-2
  `,
  outline: `
    bg-transparent
    text-fluent-neutral-130 dark:text-fluent-neutral-20
    border border-fluent-neutral-50 dark:border-fluent-neutral-100
    hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-130
  `,
  ghost: `
    bg-transparent
    text-fluent-neutral-110 dark:text-fluent-neutral-50
    hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-130
  `,
  danger: `
    bg-red-500 text-white shadow-fluent-4
    hover:bg-red-600 active:bg-red-700
  `,
  success: `
    bg-green-500 text-white shadow-fluent-4
    hover:bg-green-600 active:bg-green-700
  `,
}

const sizeStyles: Record<Size, string> = {
  xs: 'h-6 px-2 text-xs rounded-md gap-1',
  sm: 'h-8 px-3 text-sm rounded-fluent-sm gap-1.5',
  md: 'h-9 px-4 text-sm rounded-fluent gap-2',
  lg: 'h-11 px-6 text-base rounded-fluent gap-2.5',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, iconRight, fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-fluent-accent/50 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'select-none cursor-default',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? <Loader2 className="animate-spin" size={size === 'lg' ? 18 : 14} /> : icon}
        {children}
        {!loading && iconRight}
      </motion.button>
    )
  },
)
Button.displayName = 'Button'
