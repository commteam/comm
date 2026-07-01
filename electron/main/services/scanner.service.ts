import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import log from 'electron-log'
import type { DesktopFile, ScanResult } from '../../../src/shared/types'
import type { ScannerSettings } from '../../../src/shared/types/settings'
import { getFileCategory, extractKeywords, getFileExtension } from '../../../src/shared/utils'
import { generateId } from '../../../src/shared/utils'
import { fileRepo } from '../database/repository'

export type ScanStatus = 'idle' | 'scanning' | 'error'

let currentStatus: ScanStatus = 'idle'

export function getScanStatus(): ScanStatus {
  return currentStatus
}

export async function scanDesktop(
  desktopPath: string,
  settings: ScannerSettings,
  onProgress?: (progress: number) => void,
): Promise<ScanResult> {
  if (currentStatus === 'scanning') {
    throw new Error('Scan already in progress')
  }

  currentStatus = 'scanning'
  const startTime = Date.now()
  const discoveredFiles: DesktopFile[] = []
  const newFiles: DesktopFile[] = []
  const modifiedFiles: DesktopFile[] = []

  log.info(`Starting desktop scan: ${desktopPath}`)

  try {
    if (!fs.existsSync(desktopPath)) {
      throw new Error(`Desktop path does not exist: ${desktopPath}`)
    }

    const entries = fs.readdirSync(desktopPath, { withFileTypes: true })
    const fileEntries = entries.filter(e => e.isFile())
    const total = fileEntries.length

    for (let i = 0; i < fileEntries.length; i++) {
      const entry = fileEntries[i]
      const filePath = path.join(desktopPath, entry.name)

      try {
        const file = await processFile(filePath, entry.name, settings)
        if (!file) continue

        discoveredFiles.push(file)

        const existing = fileRepo.findById(file.id)
        if (!existing) {
          newFiles.push(file)
        } else if (existing.modifiedAt.getTime() !== file.modifiedAt.getTime()) {
          modifiedFiles.push(file)
        }

        fileRepo.upsert(file)
      } catch (err) {
        log.warn(`Failed to process file: ${filePath}`, err)
      }

      onProgress?.(Math.round(((i + 1) / total) * 100))
    }

    const totalSize = discoveredFiles.reduce((sum, f) => sum + f.size, 0)
    const scanDuration = Date.now() - startTime

    log.info(`Scan complete. Found ${discoveredFiles.length} files in ${scanDuration}ms`)

    return {
      files: discoveredFiles,
      totalFiles: discoveredFiles.length,
      totalSize,
      newFiles,
      modifiedFiles,
      removedFileIds: [],
      scanDuration,
      scannedAt: new Date(),
    }
  } finally {
    currentStatus = 'idle'
  }
}

async function processFile(
  filePath: string,
  fileName: string,
  settings: ScannerSettings,
): Promise<DesktopFile | null> {
  const stats = fs.statSync(filePath)

  if (!stats.isFile()) return null

  const ext = getFileExtension(fileName)

  if (settings.ignoreHiddenFiles && fileName.startsWith('.')) return null
  if (settings.ignoredExtensions.includes(ext)) return null
  if (stats.size > settings.maxFileSizeMb * 1024 * 1024) return null

  const category = getFileCategory(ext)
  const keywords = extractKeywords(fileName)

  // Use path hash as stable ID to detect renames
  const id = crypto.createHash('md5').update(filePath).digest('hex')

  return {
    id,
    name: fileName,
    extension: ext,
    category,
    path: filePath,
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    accessedAt: stats.atime,
    isHidden: fileName.startsWith('.'),
    isSystem: false,
    keywords,
  }
}
