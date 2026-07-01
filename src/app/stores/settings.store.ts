import { create } from 'zustand'
import type { AppSettings } from '../../shared/types'

interface SettingsStore {
  settings: AppSettings | null
  isLoading: boolean
  error: string | null
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.electronAPI.getSettings()
      if (response.success) {
        set({ settings: response.data, isLoading: false })
      } else {
        set({ error: response.error ?? 'Failed to load settings', isLoading: false })
      }
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  updateSettings: async (partial: Partial<AppSettings>) => {
    const response = await window.electronAPI.updateSettings(partial)
    if (response.success) {
      set({ settings: response.data })
    }
  },

  resetSettings: async () => {
    const response = await window.electronAPI.resetSettings()
    if (response.success) {
      set({ settings: response.data })
    }
  },
}))
