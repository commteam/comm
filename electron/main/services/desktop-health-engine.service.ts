import { desktopStatsService } from './desktop-stats.service'
import type { DesktopStatistics } from '../../../src/shared/types/intelligence'

export interface HealthSuggestion {
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action: string
}

export const desktopHealthEngineService = {
  getSuggestions(stats: DesktopStatistics): HealthSuggestion[] {
    const suggestions: HealthSuggestion[] = []

    if (stats.needsReview > 10) {
      suggestions.push({
        priority: 'high',
        title: `${stats.needsReview} files need organization`,
        description: 'Run the Organization Wizard to review AI recommendations.',
        action: 'organize',
      })
    }

    if (stats.duplicateFiles > 0) {
      suggestions.push({
        priority: 'medium',
        title: `${stats.duplicateFiles} duplicate files detected`,
        description: 'Review and remove duplicates to save space.',
        action: 'duplicates',
      })
    }

    if (stats.oldFiles > 5) {
      suggestions.push({
        priority: 'low',
        title: `${stats.oldFiles} old files on desktop`,
        description: "Consider archiving files you haven't used in over a year.",
        action: 'archive',
      })
    }

    if (stats.largeFiles > 0) {
      suggestions.push({
        priority: 'low',
        title: `${stats.largeFiles} large files detected`,
        description: 'Large files are slowing down your desktop.',
        action: 'large-files',
      })
    }

    return suggestions
  },

  getTrend(workspaceId: string): { direction: 'up' | 'down' | 'stable'; delta: number } {
    const history = desktopStatsService.getHistoricalScores(workspaceId, 2)
    if (history.length < 2) return { direction: 'stable', delta: 0 }
    const delta = history[0].score - history[1].score
    return { direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable', delta: Math.abs(delta) }
  },
}
