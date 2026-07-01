import type {
  AIProvider,
  AIClassification,
  DesktopFile,
  FolderProfile,
  Recommendation,
  UserDecision,
} from '../../../../src/shared/types'
import { generateId } from '../../../../src/shared/utils'
import { getConfidenceLevel } from '../../../../src/shared/utils'
import { CONFIDENCE_THRESHOLDS } from '../../../../src/shared/constants'
import { decisionRepo, folderRepo } from '../../database/repository'

/**
 * Local AI provider — no external API needed.
 * Uses rule-based classification with learned patterns.
 * Designed so future providers (OpenAI, Claude, Ollama) can swap in
 * by implementing the AIProvider interface.
 */
export class LocalAIProvider implements AIProvider {
  readonly name = 'DeskPilot Local AI'
  readonly version = '1.0.0'
  readonly isLocal = true

  async isAvailable(): Promise<boolean> {
    return true
  }

  async classify(file: DesktopFile): Promise<AIClassification> {
    const profiles = folderRepo.findAll()
    const scores = profiles.map(p => ({
      id: p.id,
      score: this.scoreFileForFolder(file, p),
    }))

    const topMatches = scores
      .filter(s => s.score > CONFIDENCE_THRESHOLDS.LOW)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.id)

    const confidence = scores.length > 0
      ? Math.max(...scores.map(s => s.score), 0)
      : 0

    return {
      fileId: file.id,
      category: file.category,
      keywords: file.keywords,
      confidence,
      suggestedFolderIds: topMatches,
      metadata: {},
    }
  }

  async recommend(file: DesktopFile, profiles: FolderProfile[]): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    for (const profile of profiles) {
      if (profile.isProtected) continue

      const score = this.scoreFileForFolder(file, profile)
      if (score < CONFIDENCE_THRESHOLDS.LOW) continue

      const reasons = this.buildReasons(file, profile, score)
      const confidenceLevel = getConfidenceLevel(score)

      recommendations.push({
        id: generateId(),
        sessionId: '',
        file,
        targetFolder: profile,
        reasons,
        confidence: score,
        confidenceLevel,
        status: 'pending',
        isAutoApplicable: score >= CONFIDENCE_THRESHOLDS.AUTO_APPLY,
        createdAt: new Date(),
      })
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 1)
  }

  async learn(decision: UserDecision): Promise<void> {
    decisionRepo.insert({
      id: generateId(),
      ...decision,
      confidence: 0.8,
    })
  }

  private scoreFileForFolder(file: DesktopFile, folder: FolderProfile): number {
    let score = 0
    let factors = 0

    // Category match
    if (folder.dominantCategories.includes(file.category)) {
      score += 0.4
    }
    factors++

    // Keyword overlap
    const fileKeywords = new Set(file.keywords.map(k => k.toLowerCase()))
    const folderKeywords = folder.keywords.map(k => k.toLowerCase())
    const overlap = folderKeywords.filter(k => fileKeywords.has(k)).length
    if (folderKeywords.length > 0) {
      score += (overlap / folderKeywords.length) * 0.3
    }
    factors++

    // Extension match via rules
    const rules = folderRepo.findRulesByFolder(folder.id)
    for (const rule of rules) {
      if (rule.ruleType === 'extension' && rule.value === file.extension) {
        score += 0.3 * rule.confidence
      }
      if (rule.ruleType === 'keyword' && fileKeywords.has(rule.value.toLowerCase())) {
        score += 0.2 * rule.confidence
      }
      if (rule.ruleType === 'category' && rule.value === file.category) {
        score += 0.25 * rule.confidence
      }
    }
    factors++

    // Prior decisions boost
    const priorDecisions = decisionRepo.findByFile(file.id)
    const approvedForFolder = priorDecisions.filter(
      d => d.action === 'approved' && d.targetFolderId === folder.id,
    )
    if (approvedForFolder.length > 0) {
      score += 0.2
    }
    factors++

    return Math.min(score, 1.0)
  }

  private buildReasons(
    file: DesktopFile,
    folder: FolderProfile,
    _score: number,
  ) {
    const reasons = []

    if (folder.dominantCategories.includes(file.category)) {
      reasons.push({
        type: 'category_match' as const,
        description: `Folder primarily contains ${file.category} files`,
        weight: 0.4,
      })
    }

    const fileKeywords = new Set(file.keywords.map(k => k.toLowerCase()))
    const matchedKeywords = folder.keywords.filter(k => fileKeywords.has(k.toLowerCase()))
    if (matchedKeywords.length > 0) {
      reasons.push({
        type: 'keyword_match' as const,
        description: `Keyword match: ${matchedKeywords.slice(0, 3).join(', ')}`,
        weight: 0.3,
      })
    }

    const priorDecisions = decisionRepo.findByFile(file.id)
    if (priorDecisions.some(d => d.targetFolderId === folder.id)) {
      reasons.push({
        type: 'previous_decision' as const,
        description: 'Similar files have been moved here before',
        weight: 0.2,
      })
    }

    return reasons
  }
}
