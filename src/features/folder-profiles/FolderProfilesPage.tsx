import { FolderOpen, Shield, ShieldOff, RefreshCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { ProgressBar } from '../../app/components/ui/ProgressBar'
import { formatFileSize } from '../../shared/utils'

interface FolderProfile {
  id: string
  name: string
  description: string
  absolutePath: string
  keywords: string[]
  dominantCategories: string[]
  fileCount: number
  totalSize: number
  confidence: number
  isProtected: boolean
}

const api = () => (window as any).electronAPI

export function FolderProfilesPage() {
  const [profiles, setProfiles] = useState<FolderProfile[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api().getFolderProfiles()
      if (res.success) setProfiles(res.data)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function toggleProtected(profile: FolderProfile) {
    if (profile.isProtected) {
      await api().unprotectFolder(profile.id)
    } else {
      await api().protectFolder(profile.id)
    }
    await refresh()
  }

  const protectedCount = profiles.filter(p => p.isProtected).length
  const highConfidenceCount = profiles.filter(p => p.confidence >= 0.9).length

  return (
    <PageWrapper maxWidth="lg">
      <PageHeader
        title="Folder Profiles"
        description="Learned profiles for every folder on your desktop"
        icon={<FolderOpen size={18} />}
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />} onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Folders', value: profiles.length },
          { label: 'Protected', value: protectedCount, color: 'text-red-600 dark:text-red-400' },
          { label: 'High Confidence', value: highConfidenceCount, color: 'text-green-600 dark:text-green-400' },
        ].map(stat => (
          <Card key={stat.label} padding="sm" className="text-center">
            <p className={`text-2xl font-bold mb-0.5 ${stat.color ?? 'text-fluent-neutral-140 dark:text-fluent-neutral-10'}`}>{stat.value}</p>
            <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">{stat.label}</p>
          </Card>
        ))}
      </div>

      {loading && profiles.length === 0 && (
        <div className="text-center py-12 text-fluent-neutral-70">
          <FolderOpen size={28} className="mx-auto mb-3 opacity-30 animate-pulse" strokeWidth={1.5} />
          <p className="text-sm">Loading folder profiles…</p>
        </div>
      )}

      {!loading && profiles.length === 0 && (
        <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
          <FolderOpen size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold mb-1">No folder profiles yet</p>
          <p className="text-sm">Run a desktop scan to discover and profile your folders.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {profiles.map((profile, i) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FolderProfileCard profile={profile} onToggleProtected={() => toggleProtected(profile)} />
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  )
}

function FolderProfileCard({ profile, onToggleProtected }: { profile: FolderProfile; onToggleProtected: () => void }) {
  const confidence = Math.round(profile.confidence * 100)

  return (
    <Card padding="md" hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-fluent flex items-center justify-center ${profile.isProtected ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            <FolderOpen size={18} className={profile.isProtected ? 'text-red-500' : 'text-amber-500'} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20">{profile.name}</h3>
              {profile.isProtected && <Badge variant="error" size="sm">Protected</Badge>}
            </div>
            <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 truncate max-w-32">{profile.description}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-fluent-accent">{confidence}%</p>
          <p className="text-[10px] text-fluent-neutral-70 dark:text-fluent-neutral-90">confidence</p>
        </div>
      </div>

      <ProgressBar
        value={confidence}
        variant={confidence >= 90 ? 'success' : confidence >= 70 ? 'accent' : 'warning'}
        size="xs"
      />

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-fluent-neutral-70 dark:text-fluent-neutral-90">Files:</span>{' '}
          <span className="font-semibold text-fluent-neutral-110 dark:text-fluent-neutral-50">{profile.fileCount}</span>
        </div>
        <div>
          <span className="text-fluent-neutral-70 dark:text-fluent-neutral-90">Size:</span>{' '}
          <span className="font-semibold text-fluent-neutral-110 dark:text-fluent-neutral-50">{formatFileSize(profile.totalSize)}</span>
        </div>
      </div>

      {profile.dominantCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.dominantCategories.map(cat => (
            <Badge key={cat} variant="muted" size="sm">{cat}</Badge>
          ))}
        </div>
      )}

      {profile.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.keywords.slice(0, 4).map(kw => (
            <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded-full bg-fluent-accent/8 dark:bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-light font-mono">
              {kw}
            </span>
          ))}
          {profile.keywords.length > 4 && (
            <span className="text-[10px] text-fluent-neutral-70 dark:text-fluent-neutral-90 px-1">+{profile.keywords.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex gap-1 pt-1 border-t border-fluent-neutral-30 dark:border-fluent-neutral-120">
        <Button
          variant="ghost"
          size="xs"
          icon={profile.isProtected ? <ShieldOff size={11} /> : <Shield size={11} />}
          className={profile.isProtected ? 'text-red-500 hover:text-red-600' : ''}
          onClick={onToggleProtected}
        >
          {profile.isProtected ? 'Unprotect' : 'Protect'}
        </Button>
      </div>
    </Card>
  )
}
