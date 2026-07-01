import { motion } from 'framer-motion'

export function OrganizePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Organize
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Review AI recommendations for your desktop files.
        </p>
      </div>

      <div className="fluent-card p-12 text-center text-fluent-neutral-80 dark:text-fluent-neutral-80">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-30" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 24h36M6 12h24M6 36h18" strokeLinecap="round" />
          <circle cx="38" cy="36" r="8" />
          <path d="M38 32v4l2 2" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-medium mb-1">No pending recommendations</p>
        <p className="text-xs">Run a scan from the Dashboard to generate recommendations.</p>
      </div>
    </motion.div>
  )
}
