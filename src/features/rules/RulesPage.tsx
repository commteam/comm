import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useElectron } from '../../hooks/useElectron'
import type { FolderProfile } from '../../shared/types'

export function RulesPage() {
  const electron = useElectron()

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['folder-profiles'],
    queryFn: async () => {
      const res = await electron.getFolderProfiles()
      return (res.data ?? []) as FolderProfile[]
    },
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Rules &amp; Folders
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Folder profiles and organization rules learned over time.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-fluent-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && (!profiles || profiles.length === 0) && (
        <div className="fluent-card p-12 text-center text-fluent-neutral-80 dark:text-fluent-neutral-80">
          <p className="text-sm font-medium mb-1">No folder profiles yet</p>
          <p className="text-xs">Run a scan to discover your existing folders.</p>
        </div>
      )}

      {profiles && profiles.length > 0 && (
        <div className="grid gap-3">
          {profiles.map(profile => (
            <FolderProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function FolderProfileCard({ profile }: { profile: FolderProfile }) {
  const confidence = Math.round(profile.confidence * 100)

  return (
    <div className="fluent-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">
              {profile.name}
            </span>
            {profile.isProtected && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                Protected
              </span>
            )}
          </div>
          <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 font-mono truncate mb-2">
            {profile.path}
          </p>
          <div className="flex flex-wrap gap-1">
            {profile.dominantCategories.slice(0, 3).map(cat => (
              <span key={cat} className="text-xs bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-fluent-accent">{confidence}%</div>
          <div className="text-xs text-fluent-neutral-80">confidence</div>
          <div className="text-xs text-fluent-neutral-80 mt-1">{profile.fileCount} files</div>
        </div>
      </div>
    </div>
  )
}
