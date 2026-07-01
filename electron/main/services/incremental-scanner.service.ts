import fs from 'fs'
import path from 'path'
import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { desktopIndexService } from './desktop-index.service'
import { changeDetectorService } from './change-detector.service'
import { workspaceService } from './workspace.service'
import type { IntelligenceScanResult, ScanMode, ChangeEvent } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

interface ScanState {
  lastScanAt: number | null
  scanVersion: number
  desktopPath: string
}

const CURRENT_STATE_KEY = 'current'

function getScanState(): ScanState {
  const row = getDatabase()
    .prepare('SELECT * FROM scan_state WHERE id = ?')
    .get(CURRENT_STATE_KEY) as Record<string, unknown> | undefined
  return {
    lastScanAt: row ? (row.last_scan_at as number | null) : null,
    scanVersion: row ? (row.files_count as number) : 0, // reuse files_count as version counter
    desktopPath: row ? (row.desktop_path as string) : '',
  }
}

function updateScanState(desktopPath: string, duration: number, fileCount: number): void {
  const db = getDatabase()
  const existing = db.prepare('SELECT id FROM scan_state WHERE id = ?').get(CURRENT_STATE_KEY)
  const now = Date.now()
  if (existing) {
    db.prepare(
      'UPDATE scan_state SET last_scan_at = ?, last_scan_duration = ?, files_count = files_count + 1, desktop_path = ? WHERE id = ?'
    ).run(now, duration, desktopPath, CURRENT_STATE_KEY)
  } else {
    db.prepare(
      'INSERT INTO scan_state (id, last_scan_at, last_scan_duration, files_count, desktop_path) VALUES (?, ?, ?, 1, ?)'
    ).run(CURRENT_STATE_KEY, now, duration, desktopPath)
  }
}

function listDesktopFiles(desktopPath: string, ignoredExts: string[], ignoredPaths: string[], maxSizeMb: number): string[] {
  if (!fs.existsSync(desktopPath)) return []
  const maxBytes = maxSizeMb * 1024 * 1024
  const results: string[] = []

  try {
    const entries = fs.readdirSync(desktopPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      if (entry.name === 'desktop.ini' || entry.name === 'thumbs.db') continue
      if (ignoredPaths.some(p => entry.name.toLowerCase().includes(p.toLowerCase()))) continue

      const fullPath = path.join(desktopPath, entry.name)

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (ignoredExts.includes(ext)) continue
        try {
          const stat = fs.statSync(fullPath)
          if (stat.size > maxBytes) continue
          results.push(fullPath)
        } catch {
          // skip inaccessible files
        }
      }
      // Only top-level files — folders are handled by folder discovery
    }
  } catch (err) {
    log.error('Failed to list desktop files:', err)
  }

  return results
}

export const incrementalScannerService = {
  async scan(
    desktopPath: string,
    mode: ScanMode = 'incremental',
    options: {
      ignoredExtensions?: string[]
      ignoredPaths?: string[]
      maxFileSizeMb?: number
      onProgress?: (progress: number, message: string) => void
    } = {},
  ): Promise<IntelligenceScanResult> {
    const startedAt = new Date()
    const scanId = generateId()
    const workspace = workspaceService.ensureDefault(desktopPath)
    const workspaceId = workspace.id

    const {
      ignoredExtensions = ['.tmp', '.temp', '.bak', '.cache', '.lock'],
      ignoredPaths = ['System Volume Information', '$Recycle.Bin'],
      maxFileSizeMb = 500,
      onProgress,
    } = options

    const state = getScanState()
    const isFirstScan = state.lastScanAt === null
    const wasIncremental = !isFirstScan && mode === 'incremental'

    onProgress?.(5, 'Listing desktop files…')

    const currentPaths = listDesktopFiles(desktopPath, ignoredExtensions, ignoredPaths, maxFileSizeMb)
    const scanVersion = state.scanVersion + 1

    onProgress?.(20, `Found ${currentPaths.length} files`)

    let filesToProcess: string[] = currentPaths

    if (wasIncremental && mode === 'incremental') {
      // Only process files that are new or modified since last scan
      const lastScanMs = state.lastScanAt!
      filesToProcess = currentPaths.filter(p => {
        try {
          const stat = fs.statSync(p)
          return stat.mtimeMs > lastScanMs || !desktopIndexService.findByPath(p)
        } catch {
          return false
        }
      })
      log.info(`Incremental scan: ${filesToProcess.length} of ${currentPaths.length} files need processing`)
    }

    onProgress?.(30, `Indexing ${filesToProcess.length} files…`)

    let indexed = 0
    for (const filePath of filesToProcess) {
      try {
        desktopIndexService.indexFile(filePath, workspaceId, scanVersion)
        indexed++
        if (indexed % 20 === 0) {
          onProgress?.(30 + Math.round((indexed / filesToProcess.length) * 50), `Indexed ${indexed}/${filesToProcess.length}…`)
        }
      } catch (err) {
        log.warn(`Failed to index ${filePath}:`, err)
      }
    }

    onProgress?.(80, 'Detecting changes…')

    const changeEvents = wasIncremental
      ? changeDetectorService.detectChanges(currentPaths, workspaceId, scanVersion)
      : []

    const completedAt = new Date()
    const durationMs = completedAt.getTime() - startedAt.getTime()

    updateScanState(desktopPath, durationMs, indexed)

    onProgress?.(100, 'Scan complete')

    const result: IntelligenceScanResult = {
      scanId,
      mode,
      workspaceId,
      startedAt,
      completedAt,
      durationMs,
      filesScanned: currentPaths.length,
      filesIndexed: indexed,
      newFiles: changeEvents.filter(e => e.type === 'new_file').length,
      modifiedFiles: changeEvents.filter(e => e.type === 'modified_file').length,
      deletedFiles: changeEvents.filter(e => e.type === 'deleted_file').length,
      renamedFiles: changeEvents.filter(e => e.type === 'renamed_file').length,
      changeEvents,
      wasIncremental,
    }

    log.info(`Scan complete: ${indexed} files in ${durationMs}ms (incremental=${wasIncremental})`)
    return result
  },

  isFirstRun(): boolean {
    return getScanState().lastScanAt === null
  },

  getLastScanAt(): Date | null {
    const state = getScanState()
    return state.lastScanAt ? new Date(state.lastScanAt) : null
  },
}
