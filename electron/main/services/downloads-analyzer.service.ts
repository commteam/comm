import fs from 'fs'
import path from 'path'
import type { DownloadsAnalysis, DownloadFile } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

const INSTALLER_EXTS = new Set(['.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm'])
const TEMP_EXTS = new Set(['.tmp', '.temp', '.crdownload', '.part', '.download'])
const COMPRESSED_EXTS = new Set(['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'])
const YEAR_MS = 365 * 24 * 60 * 60 * 1000

export const downloadsAnalyzerService = {
  analyze(downloadsPath: string): DownloadsAnalysis {
    if (!downloadsPath || !fs.existsSync(downloadsPath)) {
      return { totalSize: 0, totalFiles: 0, oldInstallers: [], duplicates: [], tempFiles: [], compressed: [], unusedInstallers: [] }
    }
    let entries: fs.Dirent[]
    try { entries = fs.readdirSync(downloadsPath, { withFileTypes: true }) } catch {
      return { totalSize: 0, totalFiles: 0, oldInstallers: [], duplicates: [], tempFiles: [], compressed: [], unusedInstallers: [] }
    }

    let totalSize = 0, totalFiles = 0
    const oldInstallers: DownloadFile[] = [], tempFiles: DownloadFile[] = []
    const compressed: DownloadFile[] = [], unusedInstallers: DownloadFile[] = []
    const seenNames = new Map<string, DownloadFile[]>()
    const cutoff = Date.now() - YEAR_MS

    for (const entry of entries) {
      if (!entry.isFile()) continue
      const filePath = path.join(downloadsPath, entry.name)
      let stat: fs.Stats
      try { stat = fs.statSync(filePath) } catch { continue }
      const ext = path.extname(entry.name).toLowerCase()
      const size = stat.size
      const lastModified = stat.mtime
      totalSize += size; totalFiles++

      const file: DownloadFile = { filename: entry.name, path: filePath, size, lastModified, category: 'unknown', reason: '' }

      if (TEMP_EXTS.has(ext)) {
        tempFiles.push({ ...file, category: 'temp', reason: 'Temporary download file' })
      } else if (INSTALLER_EXTS.has(ext)) {
        file.category = 'installer'
        if (lastModified.getTime() < cutoff) {
          oldInstallers.push({ ...file, reason: 'Not used in over a year' })
          unusedInstallers.push({ ...file, reason: 'Likely already installed' })
        }
      } else if (COMPRESSED_EXTS.has(ext)) {
        compressed.push({ ...file, category: 'compressed', reason: 'Compressed archive' })
      }

      const baseName = entry.name.replace(/\s*\(\d+\)/, '').toLowerCase()
      const existing = seenNames.get(baseName) ?? []
      existing.push(file); seenNames.set(baseName, existing)
    }

    const duplicates: DownloadFile[] = []
    for (const [, files] of seenNames) {
      if (files.length > 1) {
        const sorted = files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
        for (const f of sorted.slice(1)) duplicates.push({ ...f, category: 'duplicate', reason: 'Duplicate download' })
      }
    }

    log.info(`Downloads analysis: ${totalFiles} files, ${Math.round(totalSize / 1e6)} MB`)
    return { totalSize, totalFiles, oldInstallers, duplicates, tempFiles, compressed, unusedInstallers }
  },
}
