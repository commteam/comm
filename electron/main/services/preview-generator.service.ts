import { desktopStatsService } from './desktop-stats.service'
import type { OrganizationPreview, RecommendationGroup } from '../../../src/shared/types/intelligence'

export const previewGeneratorService = {
  generate(sessionId: string, workspaceId: string, groups: RecommendationGroup[]): OrganizationPreview {
    const approvedItems = groups
      .filter(g => g.approved !== false)
      .flatMap(g => g.items.filter(i => i.approved !== false))

    const currentStats = desktopStatsService.getLatest(workspaceId) ?? desktopStatsService.calculate(workspaceId)
    const movedCount = approvedItems.length
    const predictedHealthScore = Math.min(100,
      Math.round(currentStats.healthScore + (movedCount / Math.max(currentStats.totalFiles, 1)) * 20)
    )
    const folderIds = new Set(groups.filter(g => g.approved !== false).map(g => g.targetFolderId))

    return {
      sessionId,
      groups,
      totalFiles: movedCount,
      estimatedDurationMs: movedCount * 100,
      healthBefore: currentStats.healthScore,
      healthAfter: predictedHealthScore,
      foldersUsed: folderIds.size,
    }
  },
}
