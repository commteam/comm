import { HelpCircle, ChevronDown, ChevronRight, Search, BookOpen, Keyboard, MessageCircle, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Input } from '../../app/components/ui/Input'
import { Badge } from '../../app/components/ui/Badge'
import { cn } from '../../shared/utils/cn'

const FAQ_ITEMS = [
  {
    category: 'Getting Started',
    questions: [
      { q: 'How does DeskPilot AI learn my preferences?', a: 'Every time you approve or skip a file move recommendation, DeskPilot AI records your decision. Over time it builds a confidence model for each folder, learning which file types, keywords, and patterns belong there.' },
      { q: 'Will DeskPilot AI ever move files without asking me?', a: 'No. DeskPilot AI will never move any file without your explicit approval. Even in auto-apply mode (confidence ≥ 95%), you see a simulation preview before anything happens.' },
      { q: 'How do I start my first scan?', a: 'Go to Desktop Scan in the sidebar and click "Start Scan". DeskPilot AI will analyse your desktop and present recommendations grouped by file category.' },
    ],
  },
  {
    category: 'Organization',
    questions: [
      { q: 'What is the confidence score?', a: 'The confidence score (0–100%) reflects how certain DeskPilot AI is that a file belongs in a suggested folder. It is calculated from category match, keyword overlap, rule matching, and your past decisions.' },
      { q: 'What happens when I skip a file?', a: 'Skipped files are recorded and excluded from future sessions until new evidence changes the confidence. Repeat skips lower the confidence for that folder pairing.' },
      { q: 'Can I undo a move?', a: 'Yes. Every file move is recorded in the Timeline. Click "Undo" on any entry to reverse the operation instantly. DeskPilot AI stores the original path and restores the file exactly.' },
    ],
  },
  {
    category: 'Rules & Folders',
    questions: [
      { q: 'How do I protect a folder?', a: 'Open Folder Profiles, find the folder, and click the "Protect" button. Protected folders are never used as a destination and DeskPilot AI will not move files out of them.' },
      { q: 'Can I create rules manually?', a: 'Yes. Go to Rules in the sidebar and click "Add Rule". You can define keyword, extension, or category rules that map to a target folder.' },
      { q: 'What is a folder profile?', a: 'A folder profile captures what DeskPilot AI has learned about a folder: its dominant file categories, keywords, file count, and an overall confidence score for future placements.' },
    ],
  },
  {
    category: 'Privacy & Data',
    questions: [
      { q: 'Does DeskPilot AI send my files to the cloud?', a: 'No. All AI processing runs locally on your machine. File names and metadata are stored only in a local SQLite database at %AppData%/deskpilot.db.' },
      { q: 'Can I export or delete my data?', a: 'Yes. Go to Settings → Database to export your learning data or reset everything back to factory defaults.' },
    ],
  },
]

const SHORTCUTS = [
  { keys: ['Ctrl', 'S'], action: 'Start new scan' },
  { keys: ['Ctrl', 'Z'], action: 'Undo last move' },
  { keys: ['Ctrl', 'F'], action: 'Focus search' },
  { keys: ['Alt', '1'], action: 'Go to Dashboard' },
  { keys: ['Alt', '2'], action: 'Go to Desktop Scan' },
  { keys: ['Alt', '3'], action: 'Go to Organization Wizard' },
  { keys: ['Esc'], action: 'Close current panel / Cancel' },
]

export function HelpPage() {
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const filteredFaq = FAQ_ITEMS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      item =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter(cat => cat.questions.length > 0)

  return (
    <PageWrapper maxWidth="lg">
      <PageHeader title="Help" description="Answers, shortcuts, and support resources" icon={<HelpCircle size={18} />} />

      <Input
        placeholder="Search help…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={<Search size={13} />}
        className="mb-5"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: BookOpen, label: 'User Guide', description: 'Step-by-step documentation for all features', badge: 'Docs' },
          { icon: MessageCircle, label: 'Community', description: 'Ask questions and share tips with other users', badge: 'Forum' },
          { icon: ExternalLink, label: 'Report Issue', description: 'Found a bug? Let us know on GitHub', badge: 'GitHub' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Card key={item.label} padding="md" hover className="flex flex-col gap-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-fluent-accent" />
                <span className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">{item.label}</span>
                <Badge variant="accent" size="sm" className="ml-auto">{item.badge}</Badge>
              </div>
              <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">{item.description}</p>
            </Card>
          )
        })}
      </div>

      {/* FAQ */}
      <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">Frequently Asked Questions</h2>
      <div className="space-y-4 mb-6">
        {filteredFaq.map(cat => (
          <Card key={cat.category} padding="md">
            <p className="text-xs font-bold uppercase tracking-wider text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-2">{cat.category}</p>
            <div className="space-y-1">
              {cat.questions.map((item, i) => {
                const key = `${cat.category}-${i}`
                const isOpen = openItems.has(key)
                return (
                  <div key={i} className="border-b border-fluent-neutral-30 dark:border-fluent-neutral-120 last:border-0">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
                    >
                      <span className="text-sm font-medium text-fluent-neutral-120 dark:text-fluent-neutral-30">{item.q}</span>
                      {isOpen ? <ChevronDown size={14} className="shrink-0 text-fluent-accent" /> : <ChevronRight size={14} className="shrink-0 text-fluent-neutral-60" />}
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-fluent-neutral-80 dark:text-fluent-neutral-80 pb-3 leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
        {filteredFaq.length === 0 && (
          <div className="text-center py-12 text-fluent-neutral-70 dark:text-fluent-neutral-90">
            <HelpCircle size={32} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No results for "{search}"</p>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts */}
      <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3 flex items-center gap-2">
        <Keyboard size={14} /> Keyboard Shortcuts
      </h2>
      <Card padding="md">
        <div className="space-y-2">
          {SHORTCUTS.map(sc => (
            <div key={sc.action} className="flex items-center justify-between py-1.5 border-b border-fluent-neutral-20 dark:border-fluent-neutral-130 last:border-0">
              <span className="text-sm text-fluent-neutral-100 dark:text-fluent-neutral-60">{sc.action}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((k, i) => (
                  <span key={i} className={cn(
                    'px-2 py-0.5 rounded text-xs font-mono font-semibold',
                    'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-110 dark:text-fluent-neutral-50',
                    'border border-fluent-neutral-50 dark:border-fluent-neutral-100',
                  )}>{k}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  )
}
