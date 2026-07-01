import { create } from 'zustand'

interface LayoutStore {
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  rightPanelContent: React.ReactNode | null
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  openRightPanel: (content: React.ReactNode) => void
  closeRightPanel: () => void
}

const SIDEBAR_KEY = 'deskpilot_sidebar_collapsed'

export const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarCollapsed: localStorage.getItem(SIDEBAR_KEY) === 'true',
  rightPanelOpen: false,
  rightPanelContent: null,

  toggleSidebar: () =>
    set(s => {
      const next = !s.sidebarCollapsed
      localStorage.setItem(SIDEBAR_KEY, String(next))
      return { sidebarCollapsed: next }
    }),

  setSidebarCollapsed: (v) => {
    localStorage.setItem(SIDEBAR_KEY, String(v))
    set({ sidebarCollapsed: v })
  },

  openRightPanel: (content) => set({ rightPanelOpen: true, rightPanelContent: content }),
  closeRightPanel: () => set({ rightPanelOpen: false, rightPanelContent: null }),
}))
