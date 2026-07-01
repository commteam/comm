import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { desktopIndexService } from './desktop-index.service'
import { decisionEngineService } from './decision-engine.service'
import { desktopStatsService } from './desktop-stats.service'
import { executionManagerService } from './execution-manager.service'
import { undoSnapshotService } from './undo-snapshot.service'
import { sessionReportService } from './session-report.service'
import { recoveryManagerService } from './recovery-manager.service'
import { learningEngineService } from './learning-engine.service'
import type { OrgSessionV2, RecommendationGroup, OrgSessionStatus } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

function deserializeSession(row: Record<string, unknown>): OrgSessionV2 {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    status: row.status as OrgSessionStatus,
    mode: row.mode as OrgSessionV2['mode'],
    totalFiles: row.total_files as number,
    approvedCount: row.approved_count as number,
    skippedCount: row.skipped_count as number,
    failedCount: row.failed_count as number,
    executedCount: row.executed_count as number,
    startedAt: new Date(row.started_at as number),
    completedAt: row.completed_at ? new Date(row.completed_at as number) : undefined,
    undoSnapshotId: row.undo_snapshot_id as string | undefined,
    reportId: row.report_id as string | undefined,
    recoveryData: JSON.parse((row.recovery_data as string) || '{}'),
  }
}

export const organizationEngineService = {
  async startSession(workspaceId: string, mode: OrgSessionV2['mode'] = 'manual'): Promise<OrgSessionV2> {
    const db = getDatabase()
    const id = generateId()
    const startedAt = Date.now()

    db.prepare(`
      INSERT INTO org_sessions_v2 (id, workspace_id, status, mode, total_files, approved_count, skipped_count, failed_count, executed_count, started_at, recovery_data)
      VALUES (@id, @workspaceId, 'analyzing', @mode, 0, 0, 0, 0, 0, @startedAt, '{}')
    `).run({ id, workspaceId, mode, startedAt })

    log.info(`Organization session started: ${id}`)
    return this.getSession(id)!
  },

  generateGroups(workspaceId: string, sessionId: string): RecommendationGroup[] {
    const needsReview = desktopIndexService.findNeedsReview(workspaceId)
    const groupMap = new Map<string, RecommendationGroup>()

    for (const entry of needsReview) {
      if (entry.ignored || entry.pinned) continue
      const best = decisionEngineService.getBestMatch(entry, workspaceId)
      if (!best || best.confidence < 0.3) continue

      const key = best.folderId
      if (!groupMap.has(key)) {
        // ConfidenceBreakdown.factors is an object with named keys, derive a top reason
        const factorEntries = Object.entries(best.breakdown.factors) as Array<[string, number]>
        const topFactor = factorEntries.sort((a, b) => b[1] - a[1])[0]
        const topReason = topFactor
          ? topFactor[0].replace(/([A-Z])/g, ' $1').trim()
          : 'AI recommendation'

        groupMap.set(key, {
          id: generateId(),
          label: best.folderName,
          fileCount: 0,
          targetFolderName: best.folderName,
          targetFolderId: best.folderId,
          targetFolderPath: best.folderPath,
          confidence: best.confidence,
          reason: topReason,
          items: [],
          expanded: false,
          approved: null,
        })
      }

      const group = groupMap.get(key)!
      group.items.push({
        fileId: entry.id,
        filename: entry.filename,
        fromPath: entry.absolutePath,
        toPath: `${best.folderPath}\\${entry.filename}`,
        confidence: best.confidence,
        approved: null,
      })
      group.fileCount++
      group.confidence = (group.confidence * (group.fileCount - 1) + best.confidence) / group.fileCount
    }

    const groups = Array.from(groupMap.values()).sort((a, b) => b.confidence - a.confidence)
    const total = groups.reduce((s, g) => s + g.fileCount, 0)
    getDatabase().prepare('UPDATE org_sessions_v2 SET total_files = ?, status = ? WHERE id = ?')
      .run(total, 'reviewing', sessionId)

    return groups
  },

  async executeApproved(
    sessionId: string,
    workspaceId: string,
    approvedGroups: RecommendationGroup[],
    onProgress?: (done: number, total: number, filename: string) => void,
  ): Promise<{ executed: number; failed: number; snapshotId: string; reportId: string }> {
    const db = getDatabase()
    db.prepare('UPDATE org_sessions_v2 SET status = ? WHERE id = ?').run('executing', sessionId)

    const statsBefore = desktopStatsService.getLatest(workspaceId) ?? desktopStatsService.calculate(workspaceId)
    const snapshotId = await undoSnapshotService.create(sessionId, workspaceId, approvedGroups)

    recoveryManagerService.save(sessionId, workspaceId, approvedGroups, snapshotId)

    let executed = 0
    let failed = 0
    const allItems = approvedGroups.flatMap(g => g.items.filter(i => i.approved !== false))
    const total = allItems.length

    for (const item of allItems) {
      onProgress?.(executed, total, item.filename)
      const result = await executionManagerService.moveFile(sessionId, workspaceId, item)
      if (result.success) {
        executed++
        learningEngineService.onConfirmed(
          item.fileId,
          item.filename,
          item.toPath.split('\\').slice(0, -1).join('\\'),
          undefined,
          0.8,
          workspaceId,
          sessionId,
        )
        desktopIndexService.updateStatus(item.fileId, 'organized', 0.9)
      } else {
        failed++
      }
    }

    const statsAfter = desktopStatsService.calculate(workspaceId)
    const reportId = sessionReportService.create({
      sessionId,
      workspaceId,
      filesOrganized: executed,
      filesSkipped: total - executed - failed,
      filesFailed: failed,
      rulesLearned: 0,
      healthBefore: statsBefore.healthScore,
      healthAfter: statsAfter.healthScore,
      timeSavedMinutes: Math.round(executed * 0.5),
      durationMs: 0,
    })

    db.prepare(`
      UPDATE org_sessions_v2 SET status = 'complete', completed_at = ?, executed_count = ?, failed_count = ?, undo_snapshot_id = ?, report_id = ? WHERE id = ?
    `).run(Date.now(), executed, failed, snapshotId, reportId, sessionId)

    recoveryManagerService.clear(sessionId)
    log.info(`Session ${sessionId} complete: ${executed} moved, ${failed} failed`)

    return { executed, failed, snapshotId, reportId }
  },

  getSession(sessionId: string): OrgSessionV2 | null {
    const row = getDatabase().prepare('SELECT * FROM org_sessions_v2 WHERE id = ?').get(sessionId) as Record<string, unknown> | undefined
    return row ? deserializeSession(row) : null
  },

  cancelSession(sessionId: string): void {
    getDatabase().prepare('UPDATE org_sessions_v2 SET status = ?, completed_at = ? WHERE id = ?')
      .run('cancelled', Date.now(), sessionId)
  },
}
