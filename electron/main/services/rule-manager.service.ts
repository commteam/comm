import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { extractKeywords } from '../../../src/shared/utils/file'
import type { ManagedRule, RuleStrength, RULE_STRENGTH_THRESHOLDS } from '../../../src/shared/types/intelligence'
import { RULE_STRENGTH_THRESHOLDS as THRESHOLDS } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

function strengthFromCount(count: number): RuleStrength {
  if (count >= THRESHOLDS.trusted) return 'trusted'
  if (count >= THRESHOLDS.strong) return 'strong'
  if (count >= THRESHOLDS.stable) return 'stable'
  if (count >= THRESHOLDS.weak) return 'weak'
  return 'weak'
}

function confidenceFromCount(count: number, rejections: number): number {
  const net = count - rejections * 2
  if (net <= 0) return 0
  return Math.min(1, net / (THRESHOLDS.trusted * 1.2))
}

function deserialize(row: Record<string, unknown>): ManagedRule {
  return {
    id: row.id as string,
    folderId: row.folder_id as string,
    folderName: row.folder_name as string,
    ruleType: row.rule_type as ManagedRule['ruleType'],
    value: row.value as string,
    strength: row.strength as RuleStrength,
    confidence: row.confidence as number,
    confirmationCount: row.confirmation_count as number,
    rejectionCount: row.rejection_count as number,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at as number) : undefined,
    createdAt: new Date(row.created_at as number),
    decayFactor: row.decay_factor as number,
    isActive: Boolean(row.is_active),
    workspaceId: row.workspace_id as string,
  }
}

export const ruleManagerService = {
  recordConfirmation(folderId: string, filename: string, workspaceId: string): void {
    const db = getDatabase()
    const keywords = extractKeywords(filename)

    for (const kw of keywords) {
      const existing = db.prepare(
        "SELECT * FROM managed_rules WHERE folder_id = ? AND rule_type = 'keyword' AND value = ? AND workspace_id = ?"
      ).get(folderId, kw, workspaceId) as Record<string, unknown> | undefined

      if (existing) {
        const count = (existing.confirmation_count as number) + 1
        const rejects = existing.rejection_count as number
        const newStrength = strengthFromCount(count)
        const newConf = confidenceFromCount(count, rejects)

        db.prepare(`
          UPDATE managed_rules SET confirmation_count = ?, strength = ?, confidence = ?, last_used_at = ?, decay_factor = 1.0 WHERE id = ?
        `).run(count, newStrength, newConf, Date.now(), existing.id as string)

        log.info(`Rule strengthened: "${kw}" → ${existing.folder_name} (${newStrength}, count=${count})`)
      } else if (this._shouldCreateRule(keywords.indexOf(kw))) {
        // Only auto-create once we have at least one confirmation (will be upgraded as count grows)
        const folderName = (db.prepare('SELECT name FROM folder_profiles WHERE id = ?').get(folderId) as { name: string } | undefined)?.name ?? ''
        db.prepare(`
          INSERT INTO managed_rules (id, folder_id, folder_name, rule_type, value, strength, confidence, confirmation_count, rejection_count, created_at, decay_factor, is_active, workspace_id)
          VALUES (@id, @folderId, @folderName, 'keyword', @value, 'weak', @confidence, 1, 0, @createdAt, 1.0, 1, @workspaceId)
        `).run({
          id: generateId(),
          folderId,
          folderName,
          value: kw,
          confidence: 1 / (THRESHOLDS.trusted * 1.2),
          createdAt: Date.now(),
          workspaceId,
        })
      }
    }
  },

  recordRejection(folderId: string, filename: string, workspaceId: string): void {
    const db = getDatabase()
    const keywords = extractKeywords(filename)

    for (const kw of keywords) {
      const existing = db.prepare(
        "SELECT * FROM managed_rules WHERE folder_id = ? AND rule_type = 'keyword' AND value = ? AND workspace_id = ?"
      ).get(folderId, kw, workspaceId) as Record<string, unknown> | undefined

      if (existing) {
        const rejects = (existing.rejection_count as number) + 1
        const count = existing.confirmation_count as number
        const newConf = confidenceFromCount(count, rejects)
        const isActive = newConf > 0.05 ? 1 : 0

        db.prepare(`
          UPDATE managed_rules SET rejection_count = ?, confidence = ?, is_active = ? WHERE id = ?
        `).run(rejects, newConf, isActive, existing.id as string)
      }
    }
  },

  _shouldCreateRule(keywordIndex: number): boolean {
    // Create rules for top keywords only (first 3 from filename)
    return keywordIndex < 3
  },

  getForFolder(folderId: string, workspaceId: string): ManagedRule[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM managed_rules WHERE folder_id = ? AND workspace_id = ? AND is_active = 1 ORDER BY confidence DESC'
    ).all(folderId, workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getAll(workspaceId: string): ManagedRule[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM managed_rules WHERE workspace_id = ? ORDER BY confidence DESC'
    ).all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getStrong(workspaceId: string): ManagedRule[] {
    const rows = getDatabase().prepare(
      "SELECT * FROM managed_rules WHERE workspace_id = ? AND strength IN ('strong','trusted') AND is_active = 1 ORDER BY confidence DESC"
    ).all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  deactivate(id: string): void {
    getDatabase().prepare('UPDATE managed_rules SET is_active = 0 WHERE id = ?').run(id)
  },

  activate(id: string): void {
    getDatabase().prepare('UPDATE managed_rules SET is_active = 1 WHERE id = ?').run(id)
  },
}
