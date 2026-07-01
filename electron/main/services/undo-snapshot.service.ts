import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { executionManagerService } from './execution-manager.service'
import { desktopIndexService } from './desktop-index.service'
import type { UndoSnapshot, RecommendationGroup } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

function deserialize(row: Record<string, unknown>): UndoSnapshot {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    workspaceId: row.workspace_id as string,
    createdAt: new Date(row.created_at as number),
    fileMoves: JSON.parse((row.file_moves as string) || '[]'),
    learningEventIds: JSON.parse((row.learning_event_ids as string) || '[]'),
    ruleStates: JSON.parse((row.rule_states as string) || '[]'),
    folderProfileStates: JSON.parse((row.folder_profile_states as string) || '[]'),
    deleted: Boolean(row.deleted),
    label: row.label as string,
  }
}

export const undoSnapshotService = {
  async create(sessionId: string, workspaceId: string, groups: RecommendationGroup[]): Promise<string> {
    const db = getDatabase()
    const id = generateId()
    const folderIds = [...new Set(groups.map(g => g.targetFolderId))]

    const ruleStates = folderIds.flatMap(folderId => {
      const rules = db.prepare('SELECT id, confidence, active FROM managed_rules WHERE folder_id = ? AND workspace_id = ?')
        .all(folderId, workspaceId) as Array<{ id: string; confidence: number; active: number }>
      return rules.map(r => ({ ruleId: r.id, confidenceBefore: r.confidence, activeBefore: Boolean(r.active) }))
    })

    const folderProfileStates = folderIds.map(folderId => {
      const snap = db.prepare('SELECT id FROM folder_profile_versions WHERE folder_id = ? ORDER BY created_at DESC LIMIT 1')
        .get(folderId) as { id: string } | undefined
      return { folderId, snapshotId: snap?.id ?? '' }
    })

    const learningRows = db.prepare('SELECT id FROM learning_events WHERE workspace_id = ? ORDER BY timestamp DESC LIMIT 200')
      .all(workspaceId) as Array<{ id: string }>

    const label = `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`

    db.prepare(`
      INSERT INTO undo_snapshots (id, session_id, workspace_id, created_at, file_moves, learning_event_ids, rule_states, folder_profile_states, deleted, label)
      VALUES (@id, @sessionId, @workspaceId, @createdAt, '[]', @learningEventIds, @ruleStates, @folderProfileStates, 0, @label)
    `).run({
      id, sessionId, workspaceId, createdAt: Date.now(),
      learningEventIds: JSON.stringify(learningRows.map(r => r.id)),
      ruleStates: JSON.stringify(ruleStates),
      folderProfileStates: JSON.stringify(folderProfileStates),
      label,
    })

    return id
  },

  async undo(snapshotId: string): Promise<{ restored: number; failed: number }> {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM undo_snapshots WHERE id = ?').get(snapshotId) as Record<string, unknown> | undefined
    if (!row) return { restored: 0, failed: 0 }

    const snapshot = deserialize(row)
    if (snapshot.deleted) return { restored: 0, failed: 0 }

    const moves = executionManagerService.getMovesForSession(snapshot.sessionId)
    let restored = 0
    let failed = 0

    for (const move of moves.filter(m => m.status === 'success')) {
      const ok = executionManagerService.undoMove(move.id)
      if (ok) {
        desktopIndexService.updateStatus(move.fileId, 'new', 0)
        restored++
      } else {
        failed++
      }
    }

    for (const rs of snapshot.ruleStates) {
      db.prepare('UPDATE managed_rules SET confidence = ?, active = ? WHERE id = ?')
        .run(rs.confidenceBefore, rs.activeBefore ? 1 : 0, rs.ruleId)
    }

    for (const eid of snapshot.learningEventIds) {
      db.prepare('UPDATE decision_history SET undone = 1 WHERE id = ?').run(eid)
    }

    log.info(`Undo ${snapshotId}: restored ${restored}, failed ${failed}`)
    return { restored, failed }
  },

  getAll(workspaceId: string): UndoSnapshot[] {
    const rows = getDatabase().prepare('SELECT * FROM undo_snapshots WHERE workspace_id = ? AND deleted = 0 ORDER BY created_at DESC')
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  delete(snapshotId: string): void {
    getDatabase().prepare('UPDATE undo_snapshots SET deleted = 1 WHERE id = ?').run(snapshotId)
  },
}
