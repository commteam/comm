import { BrowserWindow } from 'electron'
import { fileWatcherService } from './file-watcher.service'
import log from 'electron-log'

let monitoringActive = false
let notificationCount = 0

export const backgroundMonitorService = {
  start(desktopPath: string): void {
    if (monitoringActive) return
    monitoringActive = true
    fileWatcherService.start(desktopPath)
    log.info('Background monitor started')
  },
  stop(): void {
    monitoringActive = false
    fileWatcherService.stop()
    log.info('Background monitor stopped')
  },
  isActive(): boolean { return monitoringActive },
  notifyNewFiles(count: number): void {
    notificationCount += count
    const win = BrowserWindow.getAllWindows()[0]
    if (win && !win.isDestroyed()) {
      win.webContents.send('monitor:new-files', { count: notificationCount })
    }
  },
  resetCount(): void { notificationCount = 0 },
  getCount(): number { return notificationCount },
}
