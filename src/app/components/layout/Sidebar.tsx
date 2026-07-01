import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../../shared/constants'

const navItems = [
  {
    path: ROUTES.DASHBOARD,
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1.5" />
        <rect x="11" y="1" width="6" height="6" rx="1.5" />
        <rect x="1" y="11" width="6" height="6" rx="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" />
      </svg>
    ),
  },
  {
    path: ROUTES.ORGANIZE,
    label: 'Organize',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 9h14M2 4h10M2 14h7" strokeLinecap="round" />
        <path d="M14 12l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: ROUTES.TIMELINE,
    label: 'Timeline',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="7.5" />
        <path d="M9 5v4l2.5 2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: ROUTES.RULES,
    label: 'Rules',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 4h12M3 9h8M3 14h10" strokeLinecap="round" />
        <circle cx="14" cy="9" r="2.5" />
      </svg>
    ),
  },
]

const bottomNavItems = [
  {
    path: ROUTES.NOTIFICATIONS,
    label: 'Notifications',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 2a5 5 0 0 1 5 5v3l1.5 2H2.5L4 10V7a5 5 0 0 1 5-5z" />
        <path d="M7 14a2 2 0 0 0 4 0" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    label: 'Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="9" r="2.5" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function Sidebar() {
  return (
    <aside className="w-52 shrink-0 flex flex-col h-full bg-fluent-neutral-10 dark:bg-fluent-neutral-140 border-r border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50 py-2 px-2">
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map(item => (
          <SidebarNavItem key={item.path} {...item} />
        ))}
      </nav>

      <div className="border-t border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50 pt-2 mt-2 flex flex-col gap-0.5">
        {bottomNavItems.map(item => (
          <SidebarNavItem key={item.path} {...item} />
        ))}
      </div>
    </aside>
  )
}

interface SidebarNavItemProps {
  path: string
  label: string
  icon: React.ReactNode
}

function SidebarNavItem({ path, label, icon }: SidebarNavItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'nav-item-active' : ''}`
      }
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
