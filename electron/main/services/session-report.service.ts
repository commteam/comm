import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { SessionReport } from '../../../src/shared/types/intelligence'

function deserialize(row: Record<string, unknown>): SessionReport {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    workspaceId: row.workspace_id as string,
    filesOrganized: row.files_organized as number,
    filesSkipped: row.files_skipped as number,
    filesFailed: row.files_failed as number,
    rulesLearned: row.rules_learned as number,
    healthBefore: row.health_before as number,
    healthAfter: row.health_after as number,
    timeSavedMinutes: row.time_saved_minutes as number,
    durationMs: row.duration_ms as number,
    createdAt: new Date(row.created_at as number),
    exported: Boolean(row.exported),
  }
}

export const sessionReportService = {
  create(data: Omit<SessionReport, 'id' | 'createdAt' | 'exported'>): string {
    const id = generateId()
    getDatabase().prepare(`
      INSERT INTO session_reports (id, session_id, workspace_id, files_organized, files_skipped, files_failed, rules_learned, health_before, health_after, time_saved_minutes, duration_ms, created_at, exported)
      VALUES (@id, @sessionId, @workspaceId, @filesOrganized, @filesSkipped, @filesFailed, @rulesLearned, @healthBefore, @healthAfter, @timeSavedMinutes, @durationMs, @createdAt, 0)
    `).run({ ...data, id, createdAt: Date.now() })
    return id
  },

  get(reportId: string): SessionReport | null {
    const row = getDatabase().prepare('SELECT * FROM session_reports WHERE id = ?').get(reportId) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  getForSession(sessionId: string): SessionReport | null {
    const row = getDatabase().prepare('SELECT * FROM session_reports WHERE session_id = ?').get(sessionId) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  getAll(workspaceId: string, limit = 50): SessionReport[] {
    const rows = getDatabase().prepare('SELECT * FROM session_reports WHERE workspace_id = ? ORDER BY created_at DESC LIMIT ?')
      .all(workspaceId, limit) as Record<string, unknown>[]
    return rows.map(deserialize)
  },
}
