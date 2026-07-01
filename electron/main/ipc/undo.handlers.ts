import { ipcMain } from 'electron'
import log from 'electron-log'
import { orgRepo } from '../database/repository'
import { undoSession } from '../services/undo.service'

export function registerUndoHandlers(): void {
  ipcMain.handle('undo:get-history', (_event, sessionId: string) => {
    try {
      return { success: true, data: orgRepo.findMoveOpsBySession(sessionId) }
    } catch (err) {
      log.error('Failed to get undo history:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('undo:undo-all-session', async (_event, sessionId: string) => {
    try {
      const result = await undoSession(sessionId)
      return { success: true, data: result }
    } catch (err) {
      log.error('Failed to undo session:', err)
      return { success: false, error: String(err) }
    }
  })
}
