import { getDatabase } from '../database/connection'
import type { DecisionHistoryEntry, DecisionOutcome } from '../../../src/shared/types/intelligence'

function deserialize(row: Record<string, unknown>): DecisionHistoryEntry {
  return {
    id: row.id as string,
    fileId: row.file_id as string,
    filename: row.filename as string,
    recommendedFolderId: row.recommended_folder_id as string,
    recommendedFolderName: row.recommended_folder_name as string,
    actualFolderId: row.actual_folder_id as string | undefined,
    actualFolderName: row.actual_folder_name as string | undefined,
    outcome: row.outcome as DecisionOutcome,
    confidence: row.confidence as number,
    ruleUsed: row.rule_used as string | undefined,
    workspaceId: row.workspace_id as string,
    timestamp: new Date(row.timestamp as number),
    sessionId: row.session_id as string | undefined,
    undone: Boolean(row.undone),
  }
}

export const decisionHistoryService = {
  getAll(workspaceId: string, limit = 200): DecisionHistoryEntry[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM decision_history WHERE workspace_id = ? ORDER BY timestamp DESC LIMIT ?'
    ).all(workspaceId, limit) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getForFile(fileId: string, workspaceId: string): DecisionHistoryEntry[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM decision_history WHERE file_id = ? AND workspace_id = ? ORDER BY timestamp DESC'
    ).all(fileId, workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getForFolder(folderId: string, workspaceId: string): DecisionHistoryEntry[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM decision_history WHERE recommended_folder_id = ? AND workspace_id = ? ORDER BY timestamp DESC LIMIT 100'
    ).all(folderId, workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  markUndone(decisionId: string): void {
    getDatabase().prepare('UPDATE decision_history SET undone = 1 WHERE id = ?').run(decisionId)
  },

  getStats(workspaceId: string): {
    total: number
    accepted: number
    rejected: number
    modified: number
    skipped: number
    acceptanceRate: number
  } {
    const rows = getDatabase().prepare(
      'SELECT outcome, COUNT(*) as count FROM decision_history WHERE workspace_id = ? GROUP BY outcome'
    ).all(workspaceId) as { outcome: string; count: number }[]

    const map: Record<string, number> = {}
    for (const r of rows) map[r.outcome] = r.count

    const total = Object.values(map).reduce((a, b) => a + b, 0)
    const accepted = map['accepted'] ?? 0

    return {
      total,
      accepted,
      rejected: map['rejected'] ?? 0,
      modified: map['modified'] ?? 0,
      skipped: map['skipped'] ?? 0,
      acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    }
  },

  getRecentByFolder(workspaceId: string, days = 30): Array<{ folderName: string; count: number }> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    const rows = getDatabase().prepare(`
      SELECT recommended_folder_name, COUNT(*) as count
      FROM decision_history
      WHERE workspace_id = ? AND timestamp > ? AND outcome = 'accepted'
      GROUP BY recommended_folder_name
      ORDER BY count DESC
      LIMIT 10
    `).all(workspaceId, cutoff) as { recommended_folder_name: string; count: number }[]
    return rows.map(r => ({ folderName: r.recommended_folder_name, count: r.count }))
  },
}
