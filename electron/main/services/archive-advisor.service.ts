import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { desktopIndexService } from './desktop-index.service'
import type { ArchiveCandidate } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

function deserialize(row: Record<string, unknown>): ArchiveCandidate {
  return {
    id: row.id as string,
    fileId: row.file_id as string,
    filename: row.filename as string,
    absolutePath: row.absolute_path as string,
    fileSize: row.file_size as number,
    lastModified: new Date(row.last_modified as number),
    reason: row.reason as string,
    suggestedArchivePath: row.suggested_archive_path as string,
    status: row.status as ArchiveCandidate['status'],
    workspaceId: row.workspace_id as string,
    detectedAt: new Date(row.detected_at as number),
  }
}

export const archiveAdvisorService = {
  analyze(workspaceId: string, yearsThreshold = 1): ArchiveCandidate[] {
    const db = getDatabase()
    const cutoff = Date.now() - yearsThreshold * YEAR_MS
    const entries = desktopIndexService.findAll(workspaceId)
    const candidates: ArchiveCandidate[] = []

    for (const entry of entries) {
      if (entry.ignored || entry.pinned || entry.deleted || entry.archived) continue
      if (entry.modifiedDate.getTime() > cutoff) continue
      const ageYears = Math.round((Date.now() - entry.modifiedDate.getTime()) / YEAR_MS * 10) / 10
      const reason = `Not modified for ${ageYears} year${ageYears !== 1 ? 's' : ''}`

      const existing = db.prepare('SELECT id FROM archive_candidates WHERE file_id = ? AND workspace_id = ? AND status = ?')
        .get(entry.id, workspaceId, 'pending')
      if (existing) continue

      const candidate: ArchiveCandidate = {
        id: generateId(), fileId: entry.id, filename: entry.filename,
        absolutePath: entry.absolutePath, fileSize: entry.fileSize,
        lastModified: entry.modifiedDate, reason,
        suggestedArchivePath: `Archive\\${new Date(entry.modifiedDate).getFullYear()}\\${entry.filename}`,
        status: 'pending', workspaceId, detectedAt: new Date(),
      }

      db.prepare(`
        INSERT INTO archive_candidates (id, file_id, filename, absolute_path, file_size, last_modified, reason, suggested_archive_path, status, workspace_id, detected_at)
        VALUES (@id, @fileId, @filename, @absolutePath, @fileSize, @lastModified, @reason, @suggestedArchivePath, 'pending', @workspaceId, @detectedAt)
      `).run({ ...candidate, lastModified: candidate.lastModified.getTime(), detectedAt: candidate.detectedAt.getTime() })
      candidates.push(candidate)
    }

    log.info(`Archive advisor: ${candidates.length} new candidates`)
    return candidates
  },

  getPending(workspaceId: string): ArchiveCandidate[] {
    const rows = getDatabase().prepare('SELECT * FROM archive_candidates WHERE workspace_id = ? AND status = ? ORDER BY last_modified ASC')
      .all(workspaceId, 'pending') as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  respond(id: string, status: ArchiveCandidate['status']): void {
    getDatabase().prepare('UPDATE archive_candidates SET status = ? WHERE id = ?').run(status, id)
  },
}
