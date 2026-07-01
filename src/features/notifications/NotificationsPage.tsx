import { motion } from 'framer-motion'

export function NotificationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Notifications
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Messages and alerts from DeskPilot AI.
        </p>
      </div>

      <div className="fluent-card p-12 text-center text-fluent-neutral-80 dark:text-fluent-neutral-80">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-30" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M24 6a14 14 0 0 1 14 14v8l4 6H6l4-6v-8A14 14 0 0 1 24 6z" />
          <path d="M20 38a4 4 0 0 0 8 0" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-medium mb-1">No notifications</p>
        <p className="text-xs">You're all caught up.</p>
      </div>
    </motion.div>
  )
}
