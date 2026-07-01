import { useElectron } from '../../../hooks/useElectron'
import { APP_NAME } from '../../../shared/constants'

export function TitleBar() {
  const electron = useElectron()

  return (
    <div
      className="flex items-center justify-between h-10 px-4
                 bg-white/80 dark:bg-fluent-neutral-130/80 backdrop-blur-fluent-sm
                 border-b border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50
                 select-none shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App identity */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-fluent-accent flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="1" fill="white" />
            <rect x="7" y="1" width="4" height="4" rx="1" fill="white" opacity="0.7" />
            <rect x="1" y="7" width="4" height="4" rx="1" fill="white" opacity="0.7" />
            <rect x="7" y="7" width="4" height="4" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20 tracking-wide">
          {APP_NAME}
        </span>
      </div>

      {/* Window controls */}
      <div
        className="flex items-center gap-0"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <WindowButton onClick={() => electron.minimize()} title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor">
            <rect width="10" height="1" />
          </svg>
        </WindowButton>
        <WindowButton onClick={() => electron.maximize()} title="Maximize/Restore">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        </WindowButton>
        <WindowButton onClick={() => electron.quit()} title="Close" isClose>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="0" y1="0" x2="10" y2="10" />
            <line x1="10" y1="0" x2="0" y2="10" />
          </svg>
        </WindowButton>
      </div>
    </div>
  )
}

interface WindowButtonProps {
  onClick: () => void
  title: string
  isClose?: boolean
  children: React.ReactNode
}

function WindowButton({ onClick, title, isClose, children }: WindowButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        w-10 h-8 flex items-center justify-center
        text-fluent-neutral-100 dark:text-fluent-neutral-70
        transition-colors duration-100
        ${isClose
          ? 'hover:bg-red-500 hover:text-white'
          : 'hover:bg-fluent-neutral-30 dark:hover:bg-fluent-neutral-120'
        }
      `}
    >
      {children}
    </button>
  )
}
