import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ScanLine, Sparkles, Clock, Activity,
  BookOpen, FolderOpen, Download, BarChart3, Settings,
  HelpCircle, Info, ChevronLeft, ChevronRight, Shield,
} from 'lucide-react'
import { ROUTES } from '../../../shared/constants'
import { useLayoutStore } from '../../stores/layout.store'
import { Tooltip } from '../ui'
import { cn } from '../../../shared/utils/cn'

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
      { path: ROUTES.ORGANIZE, label: 'Organize', icon: Sparkles, badge: '8' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { path: '/scan', label: 'Desktop Scan', icon: ScanLine },
      { path: ROUTES.TIMELINE, label: 'Timeline', icon: Clock },
      { path: '/activity', label: 'Activity', icon: Activity },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Management',
    items: [
      { path: ROUTES.RULES, label: 'Rules', icon: BookOpen, badge: '43' },
      { path: '/folder-profiles', label: 'Folder Profiles', icon: FolderOpen },
      { path: '/downloads', label: 'Downloads', icon: Download },
    ],
  },
]

const BOTTOM_ITEMS = [
  { path: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
  { path: ROUTES.PRIVACY_AUDIT, label: 'Privacy', icon: Shield },
  { path: '/help', label: 'Help', icon: HelpCircle },
  { path: '/about', label: 'About', icon: Info },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore()
  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 56 : 208 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative shrink-0 flex flex-col h-full bg-fluent-neutral-10 dark:bg-fluent-neutral-140 border-r border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50 overflow-hidden"
    >
      {/* Logo area */}
      <div className={cn('flex items-center px-3 py-3 mb-1 gap-2.5', sidebarCollapsed && 'justify-center px-0')}>
        <div className="w-7 h-7 rounded-lg bg-fluent-accent flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="1.5" width="5" height="5" rx="1.5" fill="white" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1.5" fill="white" opacity="0.7" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="white" opacity="0.4" />
          </svg>
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10 whitespace-nowrap tracking-tight"
            >
              DeskPilot AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-4 py-1">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 mb-1 text-[10px] font-semibold text-fluent-neutral-80 dark:text-fluent-neutral-90 uppercase tracking-widest"
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <SidebarItem key={item.path} {...item} collapsed={sidebarCollapsed} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom items */}
      <div className="px-2 pb-2 border-t border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50 pt-2 space-y-0.5">
        {BOTTOM_ITEMS.map(item => (
          <SidebarItem key={item.path} {...item} collapsed={sidebarCollapsed} />
        ))}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-white dark:bg-fluent-neutral-120 border border-fluent-neutral-40 dark:border-fluent-neutral-110 shadow-fluent-4 flex items-center justify-center text-fluent-neutral-80 hover:text-fluent-accent transition-colors z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}

interface SidebarItemProps {
  path: string
  label: string
  icon: React.ElementType
  badge?: string
  collapsed: boolean
}

function SidebarItem({ path, label, icon: Icon, badge, collapsed }: SidebarItemProps) {
  const content = (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 px-2 py-2 rounded-fluent text-sm font-medium transition-all duration-150 group relative',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-fluent-accent/10 dark:bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-light'
            : 'text-fluent-neutral-110 dark:text-fluent-neutral-60 hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-130 hover:text-fluent-neutral-140 dark:hover:text-fluent-neutral-10',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className="shrink-0" strokeWidth={isActive ? 2 : 1.75} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="flex-1 whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
          {!collapsed && badge && (
            <span className="text-[10px] font-bold bg-fluent-accent/10 text-fluent-accent px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return <Tooltip content={label} side="right">{content}</Tooltip>
  }
  return content
}
