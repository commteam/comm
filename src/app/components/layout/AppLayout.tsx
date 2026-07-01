import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { ToastContainer } from '../feedback/ToastContainer'
import { useLayoutStore } from '../../stores/layout.store'

export function AppLayout() {
  const { rightPanelOpen, rightPanelContent, closeRightPanel } = useLayoutStore()

  return (
    <div className="flex flex-col h-screen bg-fluent-neutral-10 dark:bg-fluent-neutral-140 overflow-hidden">
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>

          {/* Right panel */}
          <AnimatePresence>
            {rightPanelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden shrink-0 border-l border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50 bg-white dark:bg-fluent-neutral-130"
              >
                <div className="w-80 h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-fluent-neutral-40/50 dark:border-fluent-neutral-120/50">
                    <span className="text-sm font-semibold text-fluent-neutral-130 dark:text-fluent-neutral-20">Details</span>
                    <button
                      onClick={closeRightPanel}
                      className="p-1 rounded hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-120 text-fluent-neutral-80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {rightPanelContent}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      <StatusBar />
      <ToastContainer />
    </div>
  )
}
