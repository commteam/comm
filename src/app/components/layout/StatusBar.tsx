import { Circle, Zap, Clock } from 'lucide-react'
import { formatRelativeTime } from '../../../shared/utils'
import { mockDashboardStats } from '../../../shared/mock'

export function StatusBar() {
  return (
    <div className="h-6 flex items-center justify-between px-4 bg-fluent-accent shrink-0">
      <div className="flex items-center gap-4">
        <StatusItem icon={<Circle size={8} fill="currentColor" className="text-green-300" />}>
          <span className="text-green-100">AI Active</span>
        </StatusItem>
        <StatusItem icon={<Zap size={9} className="text-blue-200" />}>
          <span className="text-blue-100">Local AI · v1.0</span>
        </StatusItem>
      </div>

      <div className="flex items-center gap-4">
        <StatusItem icon={<Clock size={9} className="text-white/60" />}>
          <span className="text-white/70">
            Last scan {formatRelativeTime(mockDashboardStats.lastOrganized)}
          </span>
        </StatusItem>
        <span className="text-white/50 text-[10px]">
          {mockDashboardStats.totalFilesOrganized} files organized total
        </span>
      </div>
    </div>
  )
}

function StatusItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[10px] font-medium text-white/80">
      {icon}
      {children}
    </div>
  )
}
