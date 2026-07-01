import chokidar, { FSWatcher } from 'chokidar'
import path from 'path'
import fs from 'fs'
import { BrowserWindow } from 'electron'
import { changeDetectorService } from './change-detector.service'
import { desktopIndexService } from './desktop-index.service'
import { workspaceService } from './workspace.service'
import log from 'electron-log'

interface WatcherState {
  watcher: FSWatcher | null
  desktopPath: string
  workspaceId: string
  enabled: boolean
}

const state: WatcherState = {
  watcher: null,
  desktopPath: '',
  workspaceId: 'default',
  enabled: false,
}

function getMainWindow(): BrowserWindow | null {
  const wins = BrowserWindow.getAllWindows()
  return wins.length > 0 ? wins[0] : null
}

function notifyRenderer(event: string, payload: unknown): void {
  const win = getMainWindow()
  win?.webContents.send(event, payload)
}

export const fileWatcherService = {
  start(desktopPath: string): void {
    if (state.watcher) this.stop()

    const workspace = workspaceService.ensureDefault(desktopPath)
    state.desktopPath = desktopPath
    state.workspaceId = workspace.id
    state.enabled = true

    state.watcher = chokidar.watch(desktopPath, {
      depth: 0,          // only watch top-level of desktop
      ignoreInitial: true,
      persistent: true,
      usePolling: false,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
      ignored: /(^|[/\\])\..|(desktop\.ini|thumbs\.db)/,
    })

    state.watcher
      .on('add', (filePath) => {
        if (!this._isFile(filePath)) return
        log.info(`[Watcher] New file: ${path.basename(filePath)}`)
        const fileSize = this._safeSize(filePath)
        const event = changeDetectorService.emitManual('new_file', filePath, fileSize, state.workspaceId)
        try {
          desktopIndexService.indexFile(filePath, state.workspaceId, Date.now())
        } catch { /* skip */ }
        notifyRenderer('watcher:file-added', {
          filename: path.basename(filePath),
          path: filePath,
          size: fileSize,
          eventId: event.id,
        })
      })
      .on('change', (filePath) => {
        if (!this._isFile(filePath)) return
        log.info(`[Watcher] Modified: ${path.basename(filePath)}`)
        const event = changeDetectorService.emitManual('modified_file', filePath, this._safeSize(filePath), state.workspaceId)
        notifyRenderer('watcher:file-changed', { filename: path.basename(filePath), path: filePath, eventId: event.id })
      })
      .on('unlink', (filePath) => {
        log.info(`[Watcher] Deleted: ${path.basename(filePath)}`)
        desktopIndexService.markDeleted(filePath)
        const event = changeDetectorService.emitManual('deleted_file', filePath, 0, state.workspaceId)
        notifyRenderer('watcher:file-deleted', { filename: path.basename(filePath), path: filePath, eventId: event.id })
      })
      .on('rename', (filePath) => {
        log.info(`[Watcher] Renamed: ${path.basename(filePath)}`)
        const event = changeDetectorService.emitManual('renamed_file', filePath, this._safeSize(filePath), state.workspaceId)
        notifyRenderer('watcher:file-renamed', { filename: path.basename(filePath), path: filePath, eventId: event.id })
      })
      .on('error', (err) => {
        log.error('[Watcher] Error:', err)
      })

    log.info(`File watcher started for: ${desktopPath}`)
  },

  stop(): void {
    if (state.watcher) {
      state.watcher.close()
      state.watcher = null
      state.enabled = false
      log.info('File watcher stopped')
    }
  },

  isRunning(): boolean {
    return state.watcher !== null && state.enabled
  },

  getDesktopPath(): string {
    return state.desktopPath
  },

  _isFile(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile()
    } catch {
      return false
    }
  },

  _safeSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size
    } catch {
      return 0
    }
  },
}
