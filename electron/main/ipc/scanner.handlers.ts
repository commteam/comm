import { ipcMain, BrowserWindow } from 'electron'
import log from 'electron-log'
import { scanDesktop, getScanStatus } from '../services/scanner.service'
import { discoverFolders } from '../services/folder-discovery.service'
import { loadSettings } from '../services/settings.service'

export function registerScannerHandlers(): void {
  ipcMain.handle('scanner:scan-desktop', async (event) => {
    try {
      const settings = loadSettings()
      const win = BrowserWindow.fromWebContents(event.sender)

      const result = await scanDesktop(
        settings.general.desktopPath,
        settings.scanner,
        (progress) => {
          win?.webContents.send('scanner:progress', progress)
        },
      )

      // Discover/refresh folder profiles after scan
      await discoverFolders(settings.general.desktopPath)

      return { success: true, data: result }
    } catch (err) {
      log.error('Scanner error:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('scanner:get-status', () => ({
    success: true,
    data: getScanStatus(),
  }))
}
