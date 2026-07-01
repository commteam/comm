import type {
  RecommendationExplanation,
  ExplanationPoint,
  SimilarFile,
  ConfidenceBreakdown,
} from '../../../src/shared/types/intelligence'
import type { DesktopIndexEntry } from '../../../src/shared/types/intelligence'
import { getDatabase } from '../database/connection'

export const recommendationExplainerService = {
  explain(
    entry: DesktopIndexEntry,
    recommendedFolderName: string,
    recommendedFolderId: string,
    breakdown: ConfidenceBreakdown,
    workspaceId: string,
  ): RecommendationExplanation {
    const points: ExplanationPoint[] = []

    // Keyword matches
    if (breakdown.matchedKeywords.length > 0) {
      points.push({
        type: 'keyword',
        text: `Filename contains "${breakdown.matchedKeywords.slice(0, 3).join('", "')}"`,
        weight: breakdown.factors.filenameKeywords,
      })
    }

    // Folder profile match
    if (breakdown.factors.folderProfileMatch > 15) {
      points.push({
        type: 'profile',
        text: `${recommendedFolderName} folder profile strongly matches (${breakdown.factors.folderProfileMatch}%)`,
        weight: breakdown.factors.folderProfileMatch,
      })
    }

    // History
    if (breakdown.confirmationCount > 0) {
      points.push({
        type: 'history',
        text: `Similar files confirmed ${breakdown.confirmationCount} time${breakdown.confirmationCount !== 1 ? 's' : ''} before`,
        weight: breakdown.factors.historicalDecisions,
      })
    }

    // Extension rules
    if (breakdown.factors.fileExtension > 0) {
      points.push({
        type: 'rule',
        text: `File extension rule matches ${recommendedFolderName}`,
        weight: breakdown.factors.fileExtension,
      })
    }

    // Recent behavior
    if (breakdown.factors.recentBehavior > 5) {
      points.push({
        type: 'habit',
        text: `You've been organizing files into ${recommendedFolderName} recently`,
        weight: breakdown.factors.recentBehavior,
      })
    }

    // Matched rules
    if (breakdown.matchedRules.length > 0) {
      points.push({
        type: 'rule',
        text: `Keyword rule matched: "${breakdown.matchedRules[0]}"`,
        weight: breakdown.factors.filenameKeywords,
      })
    }

    // Similar files in this folder
    if (breakdown.similarFileCount > 0) {
      points.push({
        type: 'similarity',
        text: `${breakdown.similarFileCount} similar file${breakdown.similarFileCount !== 1 ? 's' : ''} already in ${recommendedFolderName}`,
        weight: breakdown.factors.workspaceContext,
      })
    }

    // Sort by weight descending
    points.sort((a, b) => b.weight - a.weight)

    const similarFiles = this._getSimilarFiles(recommendedFolderId, entry.extension, workspaceId)
    const autoSelectSuggested = breakdown.overall >= 90 && breakdown.confirmationCount >= 10

    const whyThisFolder = this._buildSummary(entry.filename, recommendedFolderName, breakdown, points)

    return {
      fileId: entry.id,
      filename: entry.filename,
      recommendedFolder: recommendedFolderName,
      confidenceBreakdown: breakdown,
      points,
      similarFiles,
      autoSelectSuggested,
      whyThisFolder,
    }
  },

  _getSimilarFiles(folderId: string, extension: string, workspaceId: string): SimilarFile[] {
    const rows = getDatabase().prepare(`
      SELECT filename, actual_folder_name, timestamp
      FROM decision_history
      WHERE recommended_folder_id = ? AND workspace_id = ? AND outcome = 'accepted'
      ORDER BY timestamp DESC LIMIT 5
    `).all(folderId, workspaceId) as { filename: string; actual_folder_name: string; timestamp: number }[]

    return rows.map(r => ({
      filename: r.filename,
      folder: r.actual_folder_name ?? '',
      confirmedAt: new Date(r.timestamp),
      confidence: 1,
    }))
  },

  _buildSummary(
    filename: string,
    folderName: string,
    breakdown: ConfidenceBreakdown,
    points: ExplanationPoint[],
  ): string {
    if (breakdown.overall >= 95) {
      return `DeskPilot AI is very confident ${filename} belongs in ${folderName}. ${points[0]?.text ?? ''}.`
    }
    if (breakdown.overall >= 80) {
      return `${filename} most likely belongs in ${folderName}. ${points[0]?.text ?? ''}.`
    }
    if (breakdown.overall >= 60) {
      return `${filename} probably belongs in ${folderName}, but please confirm.`
    }
    return `DeskPilot AI is unsure where ${filename} belongs. Please choose a folder.`
  },
}
