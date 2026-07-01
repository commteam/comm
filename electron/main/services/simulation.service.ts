import { desktopIndexService } from './desktop-index.service'
import { decisionEngineService } from './decision-engine.service'
import { recommendationExplainerService } from './recommendation-explainer.service'
import { desktopStatsService } from './desktop-stats.service'
import { generateId } from '../../../src/shared/utils'
import type { SimulationResult, SimulationChange, SimulationState } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

export const simulationService = {
  /**
   * Run a full simulation using real index data and decision engine scores.
   */
  async run(workspaceId: string): Promise<SimulationResult> {
    const sessionId = generateId()
    const currentStats = desktopStatsService.getLatest(workspaceId) ?? desktopStatsService.calculate(workspaceId)

    const filesNeedingReview = desktopIndexService.findNeedsReview(workspaceId)
    const changes: SimulationChange[] = []

    for (const entry of filesNeedingReview) {
      const best = decisionEngineService.getBestMatch(entry, workspaceId)
      if (!best || best.confidence < 0.3) continue

      changes.push({
        fileId: entry.id,
        filename: entry.filename,
        fromPath: entry.absolutePath,
        toPath: `${best.folderPath}\\${entry.filename}`,
        folderName: best.folderName,
        confidence: best.confidence,
        isAutoApplicable: best.confidence >= 0.90,
      })
    }

    // Before state
    const before: SimulationState = {
      desktopFiles: currentStats.totalFiles,
      organizedFiles: currentStats.alreadyOrganized,
      chaosScore: 100 - currentStats.healthScore,
      categories: this._getCategoryBreakdown(workspaceId),
    }

    // Predicted after state
    const movedCount = changes.length
    const after: SimulationState = {
      desktopFiles: currentStats.totalFiles - movedCount,
      organizedFiles: currentStats.alreadyOrganized + movedCount,
      chaosScore: Math.max(0, before.chaosScore - movedCount * 2),
      categories: before.categories,
    }

    // Predicted health score
    const predictedOrganizedRatio = after.organizedFiles / Math.max(after.desktopFiles + after.organizedFiles, 1)
    const predictedHealthScore = Math.min(100, Math.round(currentStats.healthScore + (movedCount / Math.max(currentStats.totalFiles, 1)) * 20))

    const timeSavedMinutes = Math.round(movedCount * 0.5) // ~30s per file manually

    log.info(`Simulation: ${changes.length} changes predicted, health ${currentStats.healthScore} → ${predictedHealthScore}`)

    return {
      sessionId,
      before,
      after,
      changes,
      predictedHealthScore,
      predictedTimeSavedMinutes: timeSavedMinutes,
      totalFilesToMove: changes.length,
      autoApplicable: changes.filter(c => c.isAutoApplicable).length,
      requiresReview: changes.filter(c => !c.isAutoApplicable).length,
    }
  },

  _getCategoryBreakdown(workspaceId: string): Record<string, number> {
    const entries = desktopIndexService.findAll(workspaceId)
    const cats: Record<string, number> = {}
    for (const e of entries) {
      cats[e.fileCategory] = (cats[e.fileCategory] ?? 0) + 1
    }
    return cats
  },
}
