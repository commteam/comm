import { Info, Shield, Brain, Zap, Heart, Code2, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Separator } from '../../app/components/ui/Separator'

const TECH_STACK = [
  { name: 'Electron', version: '29.x', role: 'Desktop shell' },
  { name: 'React', version: '18.x', role: 'UI framework' },
  { name: 'TypeScript', version: '5.x', role: 'Type safety' },
  { name: 'SQLite (better-sqlite3)', version: '9.x', role: 'Local database' },
  { name: 'TailwindCSS', version: '3.x', role: 'Styling' },
  { name: 'Framer Motion', version: '11.x', role: 'Animations' },
  { name: 'Recharts', version: '2.x', role: 'Charts' },
  { name: 'Zustand', version: '4.x', role: 'State management' },
]

const PRINCIPLES = [
  { icon: Shield, label: 'Never surprise the user', color: 'text-red-500' },
  { icon: Brain, label: 'Every action reversible', color: 'text-blue-500' },
  { icon: Zap, label: 'Learns from every decision', color: 'text-amber-500' },
  { icon: Heart, label: 'Privacy first — fully local', color: 'text-pink-500' },
]

export function AboutPage() {
  return (
    <PageWrapper maxWidth="md">
      <PageHeader title="About" description="DeskPilot AI desktop organizer" icon={<Info size={18} />} />

      {/* App identity */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="md" className="text-center mb-4">
          <div className="w-16 h-16 rounded-fluent-xl bg-fluent-accent flex items-center justify-center mx-auto mb-3 shadow-fluent-8">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 mb-0.5">DeskPilot AI</h1>
          <p className="text-sm text-fluent-neutral-70 dark:text-fluent-neutral-90 mb-2">Your Desktop. Always Organized.</p>
          <Badge variant="accent">Version 1.0.0-beta</Badge>
        </Card>
      </motion.div>

      {/* Core principles */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card padding="md" className="mb-4">
          <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">Core Principles</h2>
          <div className="grid grid-cols-2 gap-3">
            {PRINCIPLES.map(p => {
              const Icon = p.icon
              return (
                <div key={p.label} className="flex items-center gap-2.5">
                  <Icon size={16} className={p.color} />
                  <span className="text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50">{p.label}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      {/* Tech stack */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card padding="md" className="mb-4">
          <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">Technology Stack</h2>
          <div className="space-y-0">
            {TECH_STACK.map((tech, i) => (
              <div key={tech.name}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-fluent-neutral-120 dark:text-fluent-neutral-30">{tech.name}</span>
                    <span className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 ml-2">{tech.role}</span>
                  </div>
                  <Badge variant="muted" size="sm">{tech.version}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card padding="md">
          <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-3">Links</h2>
          <div className="space-y-2">
            {[
              { icon: Code2, label: 'Source Code', value: 'github.com/deskpilot-ai' },
              { icon: Globe, label: 'Website', value: 'deskpilot.ai' },
              { icon: Shield, label: 'Privacy Policy', value: 'deskpilot.ai/privacy' },
            ].map(link => {
              const Icon = link.icon
              return (
                <div key={link.label} className="flex items-center gap-3 py-1.5">
                  <Icon size={14} className="text-fluent-neutral-70 dark:text-fluent-neutral-90 shrink-0" />
                  <span className="text-sm text-fluent-neutral-100 dark:text-fluent-neutral-60 flex-1">{link.label}</span>
                  <span className="text-xs font-mono text-fluent-accent">{link.value}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </motion.div>

      <p className="text-center text-xs text-fluent-neutral-60 dark:text-fluent-neutral-100 mt-6">
        © 2024 DeskPilot AI. Built with care for Windows 11.
      </p>
    </PageWrapper>
  )
}
