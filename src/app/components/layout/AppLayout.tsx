import { Outlet } from 'react-router-dom'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { ToastContainer } from '../feedback/ToastContainer'

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen bg-fluent-neutral-10 dark:bg-fluent-neutral-140 overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
