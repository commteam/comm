import { getDatabase } from '../database/connection'
import type {
  DecisionFactors,
  DecisionFactorWeights,
  ConfidenceBreakdown,
  DEFAULT_FACTOR_WEIGHTS,
} from '../../../src/shared/types/intelligence'
import { DEFAULT_FACTOR_WEIGHTS as WEIGHTS } from '../../../src/shared/types/intelligence'
import { extractKeywords, getFileCategory } from '../../../src/shared/utils/file'
import type { DesktopIndexEntry } from '../../../src/shared/types/intelligence'
import type { FolderProfile } from '../../../src/shared/types'
import { folderRepo } from '../database/repository'
import log from 'electron-log'

interface FolderScore {
  folderId: string
  folderName: string
  folderPath: string
  confidence: number
  breakdown: ConfidenceBreakdown
}

export const decisionEngineService = {
  /**
   * Evaluate a file and return ranked folder recommendations with full confidence breakdowns.
   */
  evaluate(
    entry: DesktopIndexEntry,
    workspaceId: string,
    weights: DecisionFactorWeights = WEIGHTS,
  ): FolderScore[] {
    const folders = folderRepo.findAll()
    if (folders.length === 0) return []

    const keywords = extractKeywords(entry.filename)
    const ext = entry.extension.toLowerCase()
    const scores: FolderScore[] = []

    for (const folder of folders) {
      if (folder.isProtected) continue

      const factors = this._computeFactors(entry, folder, keywords, ext, workspaceId)
      const overall = this._weightedScore(factors, weights)
      const breakdown = this._buildBreakdown(overall, factors, weights, keywords, folder, workspaceId, entry.id)

      scores.push({
        folderId: folder.id,
        folderName: folder.name,
        folderPath: folder.path,
        confidence: Math.round(overall * 100) / 100,
        breakdown,
      })
    }

    return scores.sort((a, b) => b.confidence - a.confidence)
  },

  getBestMatch(entry: DesktopIndexEntry, workspaceId: string): FolderScore | null {
    const scores = this.evaluate(entry, workspaceId)
    return scores.length > 0 ? scores[0] : null
  },

  _computeFactors(
    entry: DesktopIndexEntry,
    folder: FolderProfile,
    fileKeywords: string[],
    ext: string,
    workspaceId: string,
  ): DecisionFactors {
    return {
      filenameKeywords: this._scoreKeywords(fileKeywords, folder.keywords),
      folderProfileMatch: this._scoreFolderProfile(entry, folder),
      historicalDecisions: this._scoreHistory(entry.id, folder.id, workspaceId),
      recentBehavior: this._scoreRecentBehavior(folder.id, workspaceId),
      workspaceContext: this._scoreWorkspaceContext(folder.id, workspaceId),
      fileExtension: this._scoreExtension(ext, folder),
    }
  },

  _weightedScore(factors: DecisionFactors, weights: DecisionFactorWeights): number {
    return (
      factors.filenameKeywords * weights.filenameKeywords +
      factors.folderProfileMatch * weights.folderProfileMatch +
      factors.historicalDecisions * weights.historicalDecisions +
      factors.recentBehavior * weights.recentBehavior +
      factors.workspaceContext * weights.workspaceContext +
      factors.fileExtension * weights.fileExtension
    )
  },

  _buildBreakdown(
    overall: number,
    factors: DecisionFactors,
    weights: DecisionFactorWeights,
    matchedKeywords: string[],
    folder: FolderProfile,
    workspaceId: string,
    fileId: string,
  ): ConfidenceBreakdown {
    const confirmationCount = this._getConfirmationCount(fileId, folder.id, workspaceId)
    const similarFileCount = this._getSimilarFileCount(folder.id, workspaceId)

    return {
      overall: Math.round(overall * 100),
      factors: {
        filenameKeywords: Math.round(factors.filenameKeywords * weights.filenameKeywords * 100),
        folderProfileMatch: Math.round(factors.folderProfileMatch * weights.folderProfileMatch * 100),
        historicalDecisions: Math.round(factors.historicalDecisions * weights.historicalDecisions * 100),
        recentBehavior: Math.round(factors.recentBehavior * weights.recentBehavior * 100),
        workspaceContext: Math.round(factors.workspaceContext * weights.workspaceContext * 100),
        fileExtension: Math.round(factors.fileExtension * weights.fileExtension * 100),
      },
      matchedKeywords,
      matchedRules: folder.keywords.filter(k => matchedKeywords.some(fk => fk.includes(k) || k.includes(fk))),
      similarFileCount,
      confirmationCount,
    }
  },

  _scoreKeywords(fileKeywords: string[], folderKeywords: string[]): number {
    if (fileKeywords.length === 0 || folderKeywords.length === 0) return 0
    const folderSet = new Set(folderKeywords.map(k => k.toLowerCase()))
    let matches = 0
    for (const kw of fileKeywords) {
      if (folderSet.has(kw.toLowerCase())) {
        matches++
      } else {
        // Partial match
        for (const fk of folderKeywords) {
          if (kw.toLowerCase().includes(fk.toLowerCase()) || fk.toLowerCase().includes(kw.toLowerCase())) {
            matches += 0.5
            break
          }
        }
      }
    }
    return Math.min(1, matches / Math.max(fileKeywords.length, 1))
  },

  _scoreFolderProfile(entry: DesktopIndexEntry, folder: FolderProfile): number {
    let score = 0

    // Category match
    if (folder.dominantCategories.includes(entry.fileCategory)) {
      score += 0.6
    } else if (folder.dominantCategories.includes(entry.aiCategory)) {
      score += 0.4
    }

    // Profile confidence carries weight
    score += folder.confidence * 0.3

    // Keyword overlap
    const fileKws = extractKeywords(entry.filename)
    const overlap = fileKws.filter(k => folder.keywords.some(fk => fk.toLowerCase() === k.toLowerCase())).length
    score += Math.min(0.1, overlap * 0.02)

    return Math.min(1, score)
  },

  _scoreHistory(fileId: string, folderId: string, workspaceId: string): number {
    const rows = getDatabase().prepare(`
      SELECT outcome FROM decision_history
      WHERE file_id = ? AND recommended_folder_id = ? AND workspace_id = ?
      ORDER BY timestamp DESC LIMIT 20
    `).all(fileId, folderId, workspaceId) as { outcome: string }[]

    if (rows.length === 0) return 0

    let score = 0
    for (const r of rows) {
      if (r.outcome === 'accepted') score += 1
      else if (r.outcome === 'modified') score -= 0.3
      else if (r.outcome === 'rejected') score -= 0.5
    }

    return Math.max(0, Math.min(1, score / rows.length))
  },

  _scoreRecentBehavior(folderId: string, workspaceId: string): number {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days
    const rows = getDatabase().prepare(`
      SELECT COUNT(*) as count FROM decision_history
      WHERE recommended_folder_id = ? AND workspace_id = ? AND timestamp > ? AND outcome = 'accepted'
    `).get(folderId, workspaceId, cutoff) as { count: number }
    return Math.min(1, rows.count / 10) // saturate at 10 recent confirmations
  },

  _scoreWorkspaceContext(folderId: string, workspaceId: string): number {
    const rows = getDatabase().prepare(`
      SELECT COUNT(*) as count FROM decision_history
      WHERE recommended_folder_id = ? AND workspace_id = ? AND outcome = 'accepted'
    `).get(folderId, workspaceId) as { count: number }
    return Math.min(1, rows.count / 25)
  },

  _scoreExtension(ext: string, folder: FolderProfile): number {
    const rules = getDatabase().prepare(
      "SELECT value FROM folder_rules WHERE folder_id = ? AND rule_type = 'extension' AND is_active = 1"
    ).all(folder.id) as { value: string }[]
    const ruleSet = new Set(rules.map(r => r.value.toLowerCase()))
    return ruleSet.has(ext) ? 1 : 0
  },

  _getConfirmationCount(fileId: string, folderId: string, workspaceId: string): number {
    const row = getDatabase().prepare(`
      SELECT COUNT(*) as count FROM decision_history
      WHERE file_id = ? AND recommended_folder_id = ? AND workspace_id = ? AND outcome = 'accepted'
    `).get(fileId, folderId, workspaceId) as { count: number }
    return row.count
  },

  _getSimilarFileCount(folderId: string, workspaceId: string): number {
    const row = getDatabase().prepare(`
      SELECT COUNT(*) as count FROM decision_history
      WHERE recommended_folder_id = ? AND workspace_id = ? AND outcome = 'accepted'
    `).get(folderId, workspaceId) as { count: number }
    return row.count
  },
}
