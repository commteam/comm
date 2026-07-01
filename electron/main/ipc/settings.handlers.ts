import { ipcMain } from 'electron'
import log from 'electron-log'
import { loadSettings, saveSettings, updateSettings, resetSettings } from '../services/settings.service'
import type { AppSettings } from '../../../src/shared/types'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => {
    try {
      return { success: true, data: loadSettings() }
    } catch (err) {
      log.error('Failed to get settings:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('settings:update', (_event, partial: Partial<AppSettings>) => {
    try {
      const updated = updateSettings(partial)
      return { success: true, data: updated }
    } catch (err) {
      log.error('Failed to update settings:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('settings:reset', () => {
    try {
      const defaults = resetSettings()
      return { success: true, data: defaults }
    } catch (err) {
      log.error('Failed to reset settings:', err)
      return { success: false, error: String(err) }
    }
  })
}
