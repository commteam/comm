import { useState } from 'react'
import { BookOpen, Search, PowerOff, Trash2, ArrowRight, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { Input } from '../../app/components/ui/Input'
import { useRules } from '../../hooks/useIntelligence'
import type { ManagedRule } from '../../shared/types/intelligence'

const STRENGTH_VARIANT = {
  weak: 'warning',
  stable: 'info',
  strong: 'accent',
  trusted: 'success',
} as const

export function RulesPage() {
  const { rules, deactivate } = useRules()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = rules.filter(r =>
    r.value.toLowerCase().includes(search.toLowerCase()) ||
    r.folderName.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleDeactivate(id: string) {
    setDeletingId(id)
    await deactivate(id)
    setDeletingId(null)
  }

  const activeCount = rules.filter(r => r.isActive).length
  const inactiveCount = rules.filter(r => !r.isActive).length

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Rules"
        description="Organization rules learned from your decisions"
        icon={<BookOpen size={18} />}
      />

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search size={13} />}
          className="flex-1"
        />
        <Badge variant="default">{activeCount} active</Badge>
        <Badge variant="muted">{inactiveCount} disabled</Badge>
      </div>

      {filtered.length === 0 ? (
        <EmptyRules onClear={() => setSearch('')} hasSearch={!!search} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <RuleCard
                  rule={rule}
                  onDeactivate={() => handleDeactivate(rule.id)}
                  loading={deletingId === rule.id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  )
}

function RuleCard({ rule, onDeactivate, loading }: { rule: ManagedRule; onDeactivate: () => void; loading: boolean }) {
  const typeColors = {
    keyword: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    extension: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    category: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    pattern: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  }

  return (
    <Card padding="sm" className={`flex items-center gap-3 ${!rule.isActive ? 'opacity-50' : ''}`}>
      <div className={`px-2.5 py-1 rounded-fluent text-xs font-mono font-bold ${typeColors[rule.ruleType]}`}>
        {rule.value}
      </div>

      <ArrowRight size={13} className="text-fluent-neutral-50 dark:text-fluent-neutral-90 shrink-0" />

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <FolderOpen size={13} className="text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{rule.folderName}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 tabular-nums">{rule.confirmationCount}×</span>
        <span className="text-xs font-semibold text-fluent-accent">{Math.round(rule.confidence * 100)}%</span>
        <Badge variant={STRENGTH_VARIANT[rule.strength]} size="sm">{rule.strength}</Badge>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={onDeactivate}
          disabled={loading || !rule.isActive}
          title={rule.isActive ? 'Deactivate rule' : 'Already inactive'}
          className="p-1.5 rounded hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-120 text-fluent-neutral-70 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          <PowerOff size={13} />
        </button>
        <button
          onClick={onDeactivate}
          disabled={loading}
          title="Remove rule"
          className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-fluent-neutral-70 hover:text-red-500 transition-colors disabled:opacity-40"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </Card>
  )
}

function EmptyRules({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
      <BookOpen size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
      {hasSearch ? (
        <>
          <p className="font-semibold mb-2">No rules match your search</p>
          <Button variant="secondary" size="sm" onClick={onClear}>Clear search</Button>
        </>
      ) : (
        <>
          <p className="font-semibold mb-1">No rules yet</p>
          <p className="text-sm mb-4">Rules are learned automatically as you approve file moves.</p>
        </>
      )}
    </div>
  )
}
