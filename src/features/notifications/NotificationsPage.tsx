import { Bell, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Badge } from '../../app/components/ui/Badge'
import { Button } from '../../app/components/ui/Button'
import { formatRelativeTime } from '../../shared/utils'

interface MockNotification {
  id: string
  type: 'success' | 'info' | 'warning'
  title: string
  message: string
  time: Date
  read: boolean
}

const initialNotifications: MockNotification[] = [
  { id: 'n1', type: 'success', title: 'Organization complete', message: '14 files moved successfully across 4 folders.', time: new Date(Date.now() - 1000 * 60 * 10), read: false },
  { id: 'n2', type: 'info', title: 'Scan finished', message: 'Desktop scan found 6 new files needing review.', time: new Date(Date.now() - 1000 * 60 * 60), read: false },
  { id: 'n3', type: 'warning', title: 'Low confidence files', message: '3 files could not be confidently categorized and are waiting for your input.', time: new Date(Date.now() - 1000 * 60 * 60 * 3), read: true },
  { id: 'n4', type: 'success', title: 'Rule learned', message: 'New rule created: files matching "invoice" → Finance.', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
  { id: 'n5', type: 'info', title: 'AI accuracy improved', message: 'AI accuracy reached 97.2% after your last session.', time: new Date(Date.now() - 1000 * 60 * 60 * 48), read: true },
]

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertCircle,
}

const iconColors = {
  success: 'text-green-500',
  info: 'text-fluent-accent',
  warning: 'text-amber-500',
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unread = notifications.filter(n => !n.read).length

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
  }

  function dismiss(id: string) {
    setNotifications(ns => ns.filter(n => n.id !== id))
  }

  function markRead(id: string) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <PageWrapper maxWidth="md">
      <PageHeader
        title="Notifications"
        description="Messages and alerts from DeskPilot AI"
        icon={<Bell size={18} />}
        actions={
          unread > 0
            ? <Button variant="secondary" size="sm" onClick={markAllRead}>Mark all read</Button>
            : undefined
        }
      />

      {unread > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="accent">{unread} unread</Badge>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-fluent-neutral-70 dark:text-fluent-neutral-90">
          <Bell size={36} className="mx-auto mb-4 opacity-20" strokeWidth={1.5} />
          <p className="font-semibold mb-1">No notifications</p>
          <p className="text-sm">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((n, i) => {
              const Icon = icons[n.type]
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  onClick={() => markRead(n.id)}
                >
                  <Card
                    padding="sm"
                    className={`flex items-start gap-3 cursor-pointer transition-all ${!n.read ? 'border-l-2 border-fluent-accent' : ''}`}
                  >
                    <Icon size={16} className={`${iconColors[n.type]} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-fluent-accent shrink-0" />}
                      </div>
                      <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-fluent-neutral-60 dark:text-fluent-neutral-100 mt-1">{formatRelativeTime(n.time)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                      className="p-1 rounded hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-120 text-fluent-neutral-60 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  )
}
