import { AnimatePresence, motion } from 'framer-motion'
import { useNotificationStore } from '../../stores/notification.store'
import type { ToastNotification } from '../../../shared/types'

export function ToastContainer() {
  const toasts = useNotificationStore(s => s.toasts)
  const removeToast = useNotificationStore(s => s.removeToast)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const toastColors = {
  success: 'border-l-green-500 bg-green-50 dark:bg-green-950/40',
  error: 'border-l-red-500 bg-red-50 dark:bg-red-950/40',
  warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/40',
  info: 'border-l-fluent-accent bg-blue-50 dark:bg-blue-950/40',
}

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

interface ToastProps {
  toast: ToastNotification
  onDismiss: () => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`
        pointer-events-auto max-w-sm w-full
        flex items-start gap-3 p-3
        rounded-fluent shadow-fluent-16
        border border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50
        border-l-4 ${toastColors[toast.type]}
      `}
    >
      <span className="text-base shrink-0 mt-0.5">{toastIcons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-fluent-neutral-140 dark:text-fluent-neutral-10 truncate">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-0.5 line-clamp-2">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded text-fluent-neutral-80 hover:text-fluent-neutral-130 dark:hover:text-fluent-neutral-20 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="1" x2="13" y2="13" />
          <line x1="13" y1="1" x2="1" y2="13" />
        </svg>
      </button>
    </motion.div>
  )
}
