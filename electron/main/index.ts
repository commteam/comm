import { app, BrowserWindow } from 'electron'
import log from 'electron-log'
import { initDatabase, closeDatabase } from './database/connection'
import { createMainWindow } from './windows/main-window'
import { registerAllIPCHandlers } from './ipc'

// Configure logging
log.transports.file.level = 'info'
log.transports.console.level = process.env.NODE_ENV === 'development' ? 'debug' : 'info'

log.info('DeskPilot AI starting...')
log.info(`Platform: ${process.platform}`)
log.info(`Electron: ${process.versions.electron}`)
log.info(`Node: ${process.versions.node}`)

// Handle Squirrel startup events on Windows
if (process.platform === 'win32') {
  if (require('electron-squirrel-startup')) {
    app.quit()
  }
}

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

app.whenReady().then(() => {
  try {
    // Initialize database first
    initDatabase()

    // Register all IPC handlers before creating window
    registerAllIPCHandlers()

    // Create main window
    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })

    log.info('DeskPilot AI ready')
  } catch (err) {
    log.error('Failed to initialize:', err)
    app.quit()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase()
    app.quit()
  }
})

app.on('before-quit', () => {
  closeDatabase()
})

// Security: prevent new window creation
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault()
    }
  })
})
