import { useState } from 'react'
import { BookOpen, Search, Plus, Edit2, Trash2, PowerOff, ArrowRight, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { Input } from '../../app/components/ui/Input'

interface MockRule {
  id: string
  keyword: string
  targetFolder: string
  ruleType: 'keyword' | 'extension' | 'category'
  confidence: number
  appliedCount: number
  isActive: boolean
  createdAt: Date
}

const mockRules: MockRule[] = [
  { id: 'r1', keyword: 'proposal', targetFolder: 'Projects', ruleType: 'keyword', confidence: 0.98, appliedCount: 24, isActive: true, createdAt: new Date('2024-02-01') },
  { id: 'r2', keyword: 'meeting', targetFolder: 'Documents', ruleType: 'keyword', confidence: 0.94, appliedCount: 18, isActive: true, createdAt: new Date('2024-02-05') },
  { id: 'r3', keyword: 'invoice', targetFolder: 'Finance', ruleType: 'keyword', confidence: 0.97, appliedCount: 31, isActive: true, createdAt: new Date('2024-01-20') },
  { id: 'r4', keyword: 'budget', targetFolder: 'Finance', ruleType: 'keyword', confidence: 0.95, appliedCount: 12, isActive: true, createdAt: new Date('2024-01-25') },
  { id: 'r5', keyword: 'screenshot', targetFolder: 'Screenshots', ruleType: 'keyword', confidence: 0.99, appliedCount: 87, isActive: true, createdAt: new Date('2024-01-10') },
  { id: 'r6', keyword: '.exe', targetFolder: 'Installers', ruleType: 'extension', confidence: 0.99, appliedCount: 15, isActive: true, createdAt: new Date('2024-01-15') },
  { id: 'r7', keyword: '.zip', targetFolder: 'Archives', ruleType: 'extension', confidence: 0.96, appliedCount: 9, isActive: true, createdAt: new Date('2024-02-10') },
  { id: 'r8', keyword: 'contract', targetFolder: 'Important', ruleType: 'keyword', confidence: 0.92, appliedCount: 7, isActive: true, createdAt: new Date('2024-02-15') },
  { id: 'r9', keyword: 'nda', targetFolder: 'Important', ruleType: 'keyword', confidence: 0.93, appliedCount: 4, isActive: false, createdAt: new Date('2024-02-20') },
  { id: 'r10', keyword: 'backup', targetFolder: 'Archives', ruleType: 'keyword', confidence: 0.89, appliedCount: 6, isActive: true, createdAt: new Date('2024-02-25') },
]

export function RulesPage() {
  const [rules, setRules] = useState(mockRules)
  const [search, setSearch] = useState('')

  const filtered = rules.filter(r =>
    r.keyword.toLowerCase().includes(search.toLowerCase()) ||
    r.targetFolder.toLowerCase().includes(search.toLowerCase()),
  )

  function toggleRule(id: string) {
    setRules(rs => rs.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  function deleteRule(id: string) {
    setRules(rs => rs.filter(r => r.id !== id))
  }

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Rules"
        description="Organization rules learned from your decisions"
        icon={<BookOpen size={18} />}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={13} />}>
            Add Rule
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search rules…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<Search size={13} />}
          className="flex-1"
        />
        <Badge variant="default">{rules.filter(r => r.isActive).length} active</Badge>
        <Badge variant="muted">{rules.filter(r => !r.isActive).length} disabled</Badge>
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
                <RuleCard rule={rule} onToggle={() => toggleRule(rule.id)} onDelete={() => deleteRule(rule.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  )
}

function RuleCard({ rule, onToggle, onDelete }: { rule: MockRule; onToggle: () => void; onDelete: () => void }) {
  const typeColors = {
    keyword: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    extension: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    category: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  }

  return (
    <Card padding="sm" className={`flex items-center gap-3 ${!rule.isActive ? 'opacity-50' : ''}`}>
      {/* Keyword */}
      <div className={`px-2.5 py-1 rounded-fluent text-xs font-mono font-bold ${typeColors[rule.ruleType]}`}>
        {rule.keyword}
      </div>

      {/* Arrow */}
      <ArrowRight size={13} className="text-fluent-neutral-50 dark:text-fluent-neutral-90 shrink-0" />

      {/* Target */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <FolderOpen size={13} className="text-amber-500 shrink-0" />
        <span className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20 truncate">{rule.targetFolder}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 tabular-nums">{rule.appliedCount}×</span>
        <span className="text-xs font-semibold text-fluent-accent">{Math.round(rule.confidence * 100)}%</span>
        <Badge variant={rule.ruleType === 'keyword' ? 'info' : 'accent'} size="sm">{rule.ruleType}</Badge>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={onToggle} className="p-1.5 rounded hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-120 text-fluent-neutral-70 hover:text-fluent-accent transition-colors">
          <PowerOff size={13} />
        </button>
        <button className="p-1.5 rounded hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-120 text-fluent-neutral-70 hover:text-fluent-accent transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-fluent-neutral-70 hover:text-red-500 transition-colors">
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
          <Button variant="primary" size="sm" icon={<Plus size={13} />}>Add First Rule</Button>
        </>
      )}
    </div>
  )
}
