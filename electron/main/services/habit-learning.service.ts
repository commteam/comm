import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { extractKeywords, getFileCategory } from '../../../src/shared/utils/file'
import path from 'path'
import type { HabitPattern } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

function deserialize(row: Record<string, unknown>): HabitPattern {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    folderId: row.folder_id as string,
    folderName: row.folder_name as string,
    fileCategory: row.file_category as string,
    keywords: JSON.parse((row.keywords as string) || '[]'),
    extensions: JSON.parse((row.extensions as string) || '[]'),
    confirmationCount: row.confirmation_count as number,
    confidence: row.confidence as number,
    lastSeenAt: new Date(row.last_seen_at as number),
    dayOfWeekPattern: JSON.parse((row.day_of_week_pattern as string) || '[]'),
    hourPattern: JSON.parse((row.hour_pattern as string) || '[]'),
  }
}

export const habitLearningService = {
  record(folderId: string, filename: string, category: string, workspaceId: string): void {
    const db = getDatabase()
    const ext = filename ? path.extname(filename).toLowerCase() : ''
    const keywords = filename ? extractKeywords(filename) : []
    const fileCategory = category || (ext ? getFileCategory(ext) : 'unknown')
    const now = new Date()
    const dow = now.getDay()
    const hour = now.getHours()

    const folderName = (db.prepare('SELECT name FROM folder_profiles WHERE id = ?').get(folderId) as { name: string } | undefined)?.name ?? ''

    const existing = db.prepare(
      'SELECT * FROM habit_patterns WHERE folder_id = ? AND file_category = ? AND workspace_id = ?'
    ).get(folderId, fileCategory, workspaceId) as Record<string, unknown> | undefined

    if (existing) {
      const count = (existing.confirmation_count as number) + 1
      const newConf = Math.min(1, count / 20)

      // Update time patterns
      const dowPattern: number[] = JSON.parse((existing.day_of_week_pattern as string) || '[]')
      if (!dowPattern.includes(dow)) dowPattern.push(dow)

      const hourPattern: number[] = JSON.parse((existing.hour_pattern as string) || '[]')
      if (!hourPattern.includes(hour)) hourPattern.push(hour)

      // Merge keywords
      const existingKw: string[] = JSON.parse((existing.keywords as string) || '[]')
      const mergedKw = Array.from(new Set([...existingKw, ...keywords])).slice(0, 30)

      // Merge extensions
      const existingExt: string[] = JSON.parse((existing.extensions as string) || '[]')
      if (ext && !existingExt.includes(ext)) existingExt.push(ext)

      db.prepare(`
        UPDATE habit_patterns SET confirmation_count = ?, confidence = ?, last_seen_at = ?, day_of_week_pattern = ?, hour_pattern = ?, keywords = ?, extensions = ? WHERE id = ?
      `).run(count, newConf, now.getTime(), JSON.stringify(dowPattern), JSON.stringify(hourPattern), JSON.stringify(mergedKw), JSON.stringify(existingExt.slice(0, 20)), existing.id as string)
    } else {
      db.prepare(`
        INSERT INTO habit_patterns (id, workspace_id, folder_id, folder_name, file_category, keywords, extensions, confirmation_count, confidence, last_seen_at, day_of_week_pattern, hour_pattern)
        VALUES (@id, @workspaceId, @folderId, @folderName, @fileCategory, @keywords, @extensions, 1, @confidence, @lastSeenAt, @dowPattern, @hourPattern)
      `).run({
        id: generateId(),
        workspaceId,
        folderId,
        folderName,
        fileCategory,
        keywords: JSON.stringify(keywords),
        extensions: JSON.stringify(ext ? [ext] : []),
        confidence: 1 / 20,
        lastSeenAt: now.getTime(),
        dowPattern: JSON.stringify([dow]),
        hourPattern: JSON.stringify([hour]),
      })
    }
  },

  getForFolder(folderId: string, workspaceId: string): HabitPattern[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM habit_patterns WHERE folder_id = ? AND workspace_id = ? ORDER BY confirmation_count DESC'
    ).all(folderId, workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getAll(workspaceId: string): HabitPattern[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM habit_patterns WHERE workspace_id = ? ORDER BY confidence DESC'
    ).all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  /**
   * Returns a habit-based confidence boost for a file going to a folder.
   */
  getHabitScore(folderId: string, fileCategory: string, workspaceId: string): number {
    const pattern = getDatabase().prepare(
      'SELECT confidence FROM habit_patterns WHERE folder_id = ? AND file_category = ? AND workspace_id = ?'
    ).get(folderId, fileCategory, workspaceId) as { confidence: number } | undefined
    return pattern?.confidence ?? 0
  },
}
