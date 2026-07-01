import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { extractKeywords, getFileCategory } from '../../../src/shared/utils/file'
import path from 'path'
import log from 'electron-log'

export const folderProfileUpdaterService = {
  /**
   * Called every time a file is organized into a folder.
   * Updates keywords, categories, file count, and saves a version snapshot.
   */
  onFileOrganized(fileId: string, filename: string, folderId: string): void {
    const db = getDatabase()
    const folder = db.prepare('SELECT * FROM folder_profiles WHERE id = ?').get(folderId) as Record<string, unknown> | undefined
    if (!folder) return

    const ext = path.extname(filename).toLowerCase()
    const category = getFileCategory(ext)
    const fileKeywords = extractKeywords(filename)

    // Merge keywords
    const existingKeywords: string[] = JSON.parse((folder.keywords as string) || '[]')
    const mergedKeywords = Array.from(new Set([...existingKeywords, ...fileKeywords])).slice(0, 50)

    // Merge categories
    const existingCategories: string[] = JSON.parse((folder.dominant_categories as string) || '[]')
    if (!existingCategories.includes(category)) {
      existingCategories.unshift(category)
    }
    const mergedCategories = existingCategories.slice(0, 10)

    // Increase confidence slightly
    const newConfidence = Math.min(1, (folder.confidence as number) + 0.01)
    const newFileCount = (folder.file_count as number) + 1

    // Save version snapshot before update
    this._snapshotVersion(folderId, folder)

    // Update profile
    db.prepare(`
      UPDATE folder_profiles SET keywords = ?, dominant_categories = ?, confidence = ?, file_count = ?, last_updated = ? WHERE id = ?
    `).run(
      JSON.stringify(mergedKeywords),
      JSON.stringify(mergedCategories),
      newConfidence,
      newFileCount,
      Date.now(),
      folderId,
    )

    log.info(`Folder profile updated: ${folder.name} (confidence=${newConfidence.toFixed(3)})`)
  },

  /**
   * Bulk update folder stats from a full scan.
   */
  updateFromScan(folderId: string, fileCount: number, totalSize: number, categories: string[], keywords: string[]): void {
    const db = getDatabase()
    const folder = db.prepare('SELECT * FROM folder_profiles WHERE id = ?').get(folderId) as Record<string, unknown> | undefined
    if (!folder) return

    this._snapshotVersion(folderId, folder)

    const existingKeywords: string[] = JSON.parse((folder.keywords as string) || '[]')
    const mergedKeywords = Array.from(new Set([...existingKeywords, ...keywords])).slice(0, 50)

    db.prepare(`
      UPDATE folder_profiles SET file_count = ?, total_size = ?, dominant_categories = ?, keywords = ?, last_updated = ? WHERE id = ?
    `).run(fileCount, totalSize, JSON.stringify(categories), JSON.stringify(mergedKeywords), Date.now(), folderId)
  },

  getVersionHistory(folderId: string): Array<{
    version: number
    capturedAt: Date
    confidence: number
    fileCount: number
    keywords: string[]
  }> {
    const rows = getDatabase().prepare(
      'SELECT * FROM folder_profile_versions WHERE folder_id = ? ORDER BY version DESC LIMIT 20'
    ).all(folderId) as Record<string, unknown>[]

    return rows.map(r => ({
      version: r.version as number,
      capturedAt: new Date(r.captured_at as number),
      confidence: r.confidence as number,
      fileCount: r.file_count as number,
      keywords: JSON.parse((r.keywords as string) || '[]'),
    }))
  },

  _snapshotVersion(folderId: string, folder: Record<string, unknown>): void {
    const db = getDatabase()
    const maxVersion = (db.prepare('SELECT MAX(version) as v FROM folder_profile_versions WHERE folder_id = ?').get(folderId) as { v: number | null })?.v ?? 0

    db.prepare(`
      INSERT INTO folder_profile_versions (id, folder_id, keywords, dominant_categories, confidence, file_count, total_size, version, captured_at)
      VALUES (@id, @folderId, @keywords, @dominantCategories, @confidence, @fileCount, @totalSize, @version, @capturedAt)
    `).run({
      id: generateId(),
      folderId,
      keywords: folder.keywords,
      dominantCategories: folder.dominant_categories,
      confidence: folder.confidence,
      fileCount: folder.file_count,
      totalSize: folder.total_size,
      version: maxVersion + 1,
      capturedAt: Date.now(),
    })
  },
}
