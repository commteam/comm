import { getDatabase } from '../database/connection'
import type { LargeFile } from '../../../src/shared/types/intelligence'

const LARGE_FILE_BYTES = 100 * 1024 * 1024
const ARCHIVE_EXTS = new Set(['.iso', '.zip', '.rar', '.7z', '.tar', '.gz', '.img', '.vmdk'])
const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'])
const INSTALLER_EXTS = new Set(['.exe', '.msi'])

export const largeFileAnalyzerService = {
  getLargeFiles(workspaceId: string, thresholdBytes = LARGE_FILE_BYTES): LargeFile[] {
    const rows = getDatabase().prepare(`
      SELECT id, filename, absolute_path, file_size, modified_date, file_category, extension
      FROM desktop_index WHERE workspace_id = ? AND deleted = 0 AND ignored = 0 AND file_size >= ?
      ORDER BY file_size DESC LIMIT 100
    `).all(workspaceId, thresholdBytes) as Array<{ id: string; filename: string; absolute_path: string; file_size: number; modified_date: number; file_category: string; extension: string }>

    return rows.map(r => {
      const ext = r.extension.toLowerCase()
      let recommendation: LargeFile['recommendation'] = 'ignore'
      if (ARCHIVE_EXTS.has(ext) || VIDEO_EXTS.has(ext)) recommendation = 'archive'
      else if (INSTALLER_EXTS.has(ext)) recommendation = 'move'
      return { fileId: r.id, filename: r.filename, absolutePath: r.absolute_path, fileSize: r.file_size, lastModified: new Date(r.modified_date), category: r.file_category, recommendation }
    })
  },
}
