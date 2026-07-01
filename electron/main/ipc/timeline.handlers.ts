import { ipcMain } from 'electron'
import log from 'electron-log'
import { timelineRepo } from '../database/repository'

export function registerTimelineHandlers(): void {
  ipcMain.handle('timeline:get-entries', (_event, limit = 100) => {
    try {
      return { success: true, data: timelineRepo.findRecent(limit) }
    } catch (err) {
      log.error('Failed to get timeline:', err)
      return { success: false, error: String(err) }
    }
  })
}
