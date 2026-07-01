import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { RecommendationGroup, RecoveryState } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

export const recoveryManagerService = {
  save(sessionId: string, workspaceId: string, groups: RecommendationGroup[], snapshotId: string): void {
    const id = generateId()
    const pendingMoves = groups
      .filter(g => g.approved !== false)
      .flatMap(g => g.items.filter(i => i.approved !== false))
      .map(i => ({ fileId: i.fileId, filename: i.filename, fromPath: i.fromPath, toPath: i.toPath }))

    getDatabase().prepare(`
      INSERT OR REPLACE INTO recovery_state (id, workspace_id, session_id, pending_moves, undo_snapshot_id, saved_at, recovered)
      VALUES (@id, @workspaceId, @sessionId, @pendingMoves, @snapshotId, @savedAt, 0)
    `).run({ id, workspaceId, sessionId, pendingMoves: JSON.stringify(pendingMoves), snapshotId, savedAt: Date.now() })
  },

  get(workspaceId: string): RecoveryState | null {
    const row = getDatabase().prepare('SELECT * FROM recovery_state WHERE workspace_id = ? AND recovered = 0 ORDER BY saved_at DESC LIMIT 1')
      .get(workspaceId) as Record<string, unknown> | undefined
    if (!row) return null
    return {
      id: row.id as string,
      workspaceId: row.workspace_id as string,
      sessionId: row.session_id as string,
      pendingMoves: JSON.parse((row.pending_moves as string) || '[]'),
      undoSnapshotId: row.undo_snapshot_id as string | undefined,
      savedAt: new Date(row.saved_at as number),
      recovered: Boolean(row.recovered),
    }
  },

  clear(sessionId: string): void {
    getDatabase().prepare('UPDATE recovery_state SET recovered = 1 WHERE session_id = ?').run(sessionId)
    log.info(`Recovery state cleared for session ${sessionId}`)
  },

  hasPending(workspaceId: string): boolean {
    return Boolean(getDatabase().prepare('SELECT id FROM recovery_state WHERE workspace_id = ? AND recovered = 0').get(workspaceId))
  },
}
