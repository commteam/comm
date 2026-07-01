import { ipcMain } from 'electron'
import log from 'electron-log'
import { folderRepo } from '../database/repository'

export function registerFolderHandlers(): void {
  ipcMain.handle('folders:get-profiles', () => {
    try {
      return { success: true, data: folderRepo.findAll() }
    } catch (err) {
      log.error('Failed to get folder profiles:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folders:get-profile', (_event, id: string) => {
    try {
      const profile = folderRepo.findById(id)
      return { success: true, data: profile }
    } catch (err) {
      log.error('Failed to get folder profile:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folders:set-protected', (_event, payload: { folderId: string; reason: string }) => {
    try {
      const profile = folderRepo.findById(payload.folderId)
      if (!profile) return { success: false, error: 'Folder not found' }

      folderRepo.upsert({ ...profile, isProtected: true })
      return { success: true, data: { ...profile, isProtected: true } }
    } catch (err) {
      log.error('Failed to protect folder:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folders:remove-protected', (_event, folderId: string) => {
    try {
      const profile = folderRepo.findById(folderId)
      if (!profile) return { success: false, error: 'Folder not found' }

      folderRepo.upsert({ ...profile, isProtected: false })
      return { success: true }
    } catch (err) {
      log.error('Failed to unprotect folder:', err)
      return { success: false, error: String(err) }
    }
  })
}
