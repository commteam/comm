import fs from 'fs'
import path from 'path'
import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { FileMoveRecord, GroupedFile } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

export const executionManagerService = {
  async moveFile(sessionId: string, workspaceId: string, item: GroupedFile): Promise<{ success: boolean; error?: string }> {
    const db = getDatabase()
    const moveId = generateId()
    db.prepare(`
      INSERT INTO file_moves (id, session_id, file_id, filename, from_path, to_path, status, workspace_id)
      VALUES (@id, @sessionId, @fileId, @filename, @fromPath, @toPath, 'pending', @workspaceId)
    `).run({ id: moveId, sessionId, fileId: item.fileId, filename: item.filename, fromPath: item.fromPath, toPath: item.toPath, workspaceId })

    try {
      const destDir = path.dirname(item.toPath)
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true })

      let finalPath = item.toPath
      if (fs.existsSync(finalPath)) {
        const ext = path.extname(item.filename)
        const base = path.basename(item.filename, ext)
        finalPath = path.join(destDir, `${base}_${Date.now()}${ext}`)
      }

      fs.renameSync(item.fromPath, finalPath)
      db.prepare('UPDATE file_moves SET status = ?, executed_at = ? WHERE id = ?').run('success', Date.now(), moveId)
      log.info(`Moved: ${item.filename}`)
      return { success: true }
    } catch (e) {
      const errMsg = String(e)
      db.prepare('UPDATE file_moves SET status = ?, error = ? WHERE id = ?').run('failed', errMsg, moveId)
      log.warn(`Move failed: ${item.filename} — ${errMsg}`)
      return { success: false, error: errMsg }
    }
  },

  undoMove(moveId: string): boolean {
    const row = getDatabase().prepare('SELECT * FROM file_moves WHERE id = ?').get(moveId) as Record<string, unknown> | undefined
    if (!row || row.status !== 'success') return false
    try {
      if (fs.existsSync(row.to_path as string) && !fs.existsSync(row.from_path as string)) {
        fs.renameSync(row.to_path as string, row.from_path as string)
        getDatabase().prepare('UPDATE file_moves SET status = ? WHERE id = ?').run('skipped', moveId)
        return true
      }
    } catch (e) { log.warn(`Undo move failed: ${row.filename} — ${e}`) }
    return false
  },

  getMovesForSession(sessionId: string): FileMoveRecord[] {
    const rows = getDatabase().prepare('SELECT * FROM file_moves WHERE session_id = ?').all(sessionId) as Record<string, unknown>[]
    return rows.map(r => ({
      id: r.id as string,
      sessionId: r.session_id as string,
      fileId: r.file_id as string,
      filename: r.filename as string,
      fromPath: r.from_path as string,
      toPath: r.to_path as string,
      status: r.status as FileMoveRecord['status'],
      error: r.error as string | undefined,
      executedAt: r.executed_at ? new Date(r.executed_at as number) : undefined,
      workspaceId: r.workspace_id as string,
    }))
  },
}
