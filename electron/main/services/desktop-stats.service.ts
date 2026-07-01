import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { desktopIndexService } from './desktop-index.service'
import type { DesktopStatistics, HealthBreakdown, HealthFactor } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

const REVIEW_MINUTES_PER_FILE = 0.5 // ~30 seconds per file review
const OLD_FILE_DAYS = 365
const LARGE_FILE_MB = 100

function calculateHealthScore(stats: Omit<DesktopStatistics, 'healthScore' | 'previousHealthScore' | 'healthDelta' | 'calculatedAt' | 'workspaceId'>): number {
  if (stats.totalFiles === 0) return 100

  const organizedRatio = stats.alreadyOrganized / stats.totalFiles
  const chaosRatio = stats.needsReview / Math.max(stats.totalFiles, 1)
  const duplicateRatio = stats.duplicateFiles / Math.max(stats.totalFiles, 1)
  const largeRatio = stats.largeFiles / Math.max(stats.totalFiles, 1)
  const oldRatio = stats.oldFiles / Math.max(stats.totalFiles, 1)

  const score =
    organizedRatio * 50 +         // 50% weight on organized ratio
    (1 - chaosRatio) * 20 +       // 20% weight on low chaos
    (1 - duplicateRatio) * 15 +   // 15% weight on no duplicates
    (1 - largeRatio * 0.5) * 10 + // 10% weight on manageable large files
    (1 - oldRatio * 0.5) * 5      // 5% weight on no old files

  return Math.max(0, Math.min(100, Math.round(score)))
}

function getPreviousHealthScore(workspaceId: string): number {
  const row = getDatabase()
    .prepare('SELECT health_score FROM desktop_stats_snapshots WHERE workspace_id = ? ORDER BY calculated_at DESC LIMIT 1 OFFSET 1')
    .get(workspaceId) as { health_score: number } | undefined
  return row?.health_score ?? 0
}

function deserialize(row: Record<string, unknown>): DesktopStatistics {
  return {
    workspaceId: row.workspace_id as string,
    calculatedAt: new Date(row.calculated_at as number),
    totalFiles: row.total_files as number,
    newFiles: row.new_files as number,
    modifiedFiles: row.modified_files as number,
    renamedFiles: row.renamed_files as number,
    alreadyOrganized: row.already_organized as number,
    needsReview: row.needs_review as number,
    duplicateFiles: row.duplicate_files as number,
    largeFiles: row.large_files as number,
    oldFiles: row.old_files as number,
    estimatedReviewMinutes: row.estimated_review_minutes as number,
    healthScore: row.health_score as number,
    previousHealthScore: row.previous_health_score as number,
    healthDelta: row.health_delta as number,
    ignoredFiles: row.ignored_files as number,
    pinnedFiles: row.pinned_files as number,
  }
}

export const desktopStatsService = {
  calculate(workspaceId: string): DesktopStatistics {
    const statusCounts = desktopIndexService.countByStatus(workspaceId)
    const duplicateGroups = desktopIndexService.findDuplicates(workspaceId)
    const largeFiles = desktopIndexService.findLargeFiles(workspaceId, LARGE_FILE_MB)
    const oldFiles = desktopIndexService.findOldFiles(workspaceId, OLD_FILE_DAYS)

    const totalFiles = desktopIndexService.count(workspaceId)
    const newFiles = statusCounts['new'] ?? 0
    const needsReview = (statusCounts['new'] ?? 0) + (statusCounts['needs_review'] ?? 0)
    const alreadyOrganized =
      (statusCounts['organized'] ?? 0) +
      (statusCounts['auto_applied'] ?? 0) +
      (statusCounts['pinned'] ?? 0) +
      (statusCounts['favorite'] ?? 0)
    const ignoredFiles = statusCounts['ignored'] ?? 0
    const pinnedFiles = statusCounts['pinned'] ?? 0

    const duplicateFiles = duplicateGroups.reduce((sum, g) => sum + g.length - 1, 0)

    const partialStats = {
      totalFiles,
      newFiles,
      modifiedFiles: 0,
      renamedFiles: 0,
      alreadyOrganized,
      needsReview,
      duplicateFiles,
      largeFiles: largeFiles.length,
      oldFiles: oldFiles.length,
      estimatedReviewMinutes: Math.ceil(needsReview * REVIEW_MINUTES_PER_FILE),
      ignoredFiles,
      pinnedFiles,
    }

    const healthScore = calculateHealthScore(partialStats)
    const previousHealthScore = getPreviousHealthScore(workspaceId)
    const healthDelta = healthScore - previousHealthScore

    const stats: DesktopStatistics = {
      workspaceId,
      calculatedAt: new Date(),
      ...partialStats,
      healthScore,
      previousHealthScore,
      healthDelta,
    }

    // Persist snapshot
    getDatabase().prepare(`
      INSERT INTO desktop_stats_snapshots (
        id, workspace_id, calculated_at, total_files, new_files, modified_files, renamed_files,
        already_organized, needs_review, duplicate_files, large_files, old_files,
        estimated_review_minutes, health_score, previous_health_score, health_delta,
        ignored_files, pinned_files
      ) VALUES (
        @id, @workspaceId, @calculatedAt, @totalFiles, @newFiles, @modifiedFiles, @renamedFiles,
        @alreadyOrganized, @needsReview, @duplicateFiles, @largeFiles, @oldFiles,
        @estimatedReviewMinutes, @healthScore, @previousHealthScore, @healthDelta,
        @ignoredFiles, @pinnedFiles
      )
    `).run({
      id: generateId(),
      workspaceId,
      calculatedAt: stats.calculatedAt.getTime(),
      totalFiles: stats.totalFiles,
      newFiles: stats.newFiles,
      modifiedFiles: stats.modifiedFiles,
      renamedFiles: stats.renamedFiles,
      alreadyOrganized: stats.alreadyOrganized,
      needsReview: stats.needsReview,
      duplicateFiles: stats.duplicateFiles,
      largeFiles: stats.largeFiles,
      oldFiles: stats.oldFiles,
      estimatedReviewMinutes: stats.estimatedReviewMinutes,
      healthScore: stats.healthScore,
      previousHealthScore: stats.previousHealthScore,
      healthDelta: stats.healthDelta,
      ignoredFiles: stats.ignoredFiles,
      pinnedFiles: stats.pinnedFiles,
    })

    return stats
  },

  getLatest(workspaceId: string): DesktopStatistics | null {
    const row = getDatabase()
      .prepare('SELECT * FROM desktop_stats_snapshots WHERE workspace_id = ? ORDER BY calculated_at DESC LIMIT 1')
      .get(workspaceId) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  getHealthBreakdown(stats: DesktopStatistics): HealthBreakdown {
    const total = Math.max(stats.totalFiles, 1)
    const factors: HealthFactor[] = [
      {
        name: 'Organization rate',
        score: Math.round((stats.alreadyOrganized / total) * 100),
        weight: 50,
        description: `${stats.alreadyOrganized} of ${total} files organized`,
      },
      {
        name: 'Low clutter',
        score: Math.round((1 - stats.needsReview / total) * 100),
        weight: 20,
        description: `${stats.needsReview} files need review`,
      },
      {
        name: 'No duplicates',
        score: Math.round((1 - stats.duplicateFiles / total) * 100),
        weight: 15,
        description: `${stats.duplicateFiles} duplicate files found`,
      },
      {
        name: 'File sizes',
        score: Math.round((1 - (stats.largeFiles / total) * 0.5) * 100),
        weight: 10,
        description: `${stats.largeFiles} large files (>${LARGE_FILE_MB}MB)`,
      },
      {
        name: 'File age',
        score: Math.round((1 - (stats.oldFiles / total) * 0.5) * 100),
        weight: 5,
        description: `${stats.oldFiles} files older than ${OLD_FILE_DAYS} days`,
      },
    ]

    const label =
      stats.healthScore >= 90 ? 'Excellent' :
      stats.healthScore >= 75 ? 'Good' :
      stats.healthScore >= 50 ? 'Fair' : 'Needs Attention'

    const color =
      stats.healthScore >= 90 ? '#22c55e' :
      stats.healthScore >= 75 ? '#0078D4' :
      stats.healthScore >= 50 ? '#f59e0b' : '#ef4444'

    return { score: stats.healthScore, label, color, factors }
  },

  getHistoricalScores(workspaceId: string, limit = 30): Array<{ date: string; score: number }> {
    const rows = getDatabase()
      .prepare('SELECT calculated_at, health_score FROM desktop_stats_snapshots WHERE workspace_id = ? ORDER BY calculated_at DESC LIMIT ?')
      .all(workspaceId, limit) as { calculated_at: number; health_score: number }[]
    return rows.reverse().map(r => ({
      date: new Date(r.calculated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(r.health_score),
    }))
  },
}
