import { getDatabase } from '../database/connection'
import type { DuplicateGroup } from '../../../src/shared/types/intelligence'

export const duplicateDetectionService = {
  findDuplicates(workspaceId: string): DuplicateGroup[] {
    const rows = getDatabase().prepare(`
      SELECT quick_hash, file_size, filename, absolute_path, modified_date
      FROM desktop_index WHERE workspace_id = ? AND deleted = 0 AND ignored = 0 AND quick_hash != ''
      ORDER BY modified_date DESC
    `).all(workspaceId) as Array<{ quick_hash: string; file_size: number; filename: string; absolute_path: string; modified_date: number }>

    const grouped = new Map<string, typeof rows>()
    for (const row of rows) {
      const key = `${row.quick_hash}:${row.file_size}`
      const existing = grouped.get(key) ?? []
      existing.push(row); grouped.set(key, existing)
    }

    const result: DuplicateGroup[] = []
    for (const [key, files] of grouped) {
      if (files.length < 2) continue
      const [hash] = key.split(':')
      result.push({
        hash, size: files[0].file_size,
        files: files.map(f => ({ filename: f.filename, path: f.absolute_path, lastModified: new Date(f.modified_date), workspaceId })),
        keepIndex: 0,
        totalWasted: files.slice(1).reduce((s, f) => s + f.file_size, 0),
      })
    }
    return result.sort((a, b) => b.totalWasted - a.totalWasted)
  },
}
