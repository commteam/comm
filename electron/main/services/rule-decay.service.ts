import { getDatabase } from '../database/connection'
import log from 'electron-log'

const DECAY_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000 // 1 week
const DECAY_RATE = 0.05 // lose 5% confidence per idle week
const MIN_CONFIDENCE = 0.02
const DEACTIVATE_THRESHOLD = 0.01

export const ruleDecayService = {
  /**
   * Apply decay to all rules that haven't been used recently.
   * Call this once per session start.
   */
  applyDecay(workspaceId: string): void {
    const db = getDatabase()
    const now = Date.now()
    const cutoff = now - DECAY_INTERVAL_MS

    const idleRules = db.prepare(`
      SELECT id, confidence, decay_factor, last_used_at
      FROM managed_rules
      WHERE workspace_id = ? AND is_active = 1 AND (last_used_at IS NULL OR last_used_at < ?)
    `).all(workspaceId, cutoff) as {
      id: string
      confidence: number
      decay_factor: number
      last_used_at: number | null
    }[]

    let decayed = 0
    let deactivated = 0

    const update = db.prepare('UPDATE managed_rules SET confidence = ?, decay_factor = ?, is_active = ? WHERE id = ?')

    const applyAll = db.transaction(() => {
      for (const rule of idleRules) {
        const weeksIdle = rule.last_used_at
          ? Math.floor((now - rule.last_used_at) / DECAY_INTERVAL_MS)
          : 4 // default 4 weeks if never used

        const newDecayFactor = Math.max(0.1, rule.decay_factor - DECAY_RATE * weeksIdle)
        const newConfidence = Math.max(MIN_CONFIDENCE, rule.confidence * newDecayFactor)
        const isActive = newConfidence > DEACTIVATE_THRESHOLD ? 1 : 0

        update.run(newConfidence, newDecayFactor, isActive, rule.id)
        decayed++
        if (!isActive) deactivated++
      }
    })

    applyAll()

    if (decayed > 0) {
      log.info(`Rule decay: ${decayed} rules decayed, ${deactivated} deactivated (workspace=${workspaceId})`)
    }
  },

  /**
   * Reset decay for a rule when it's used (call after confirmation).
   * rule-manager already sets decay_factor=1.0 on update.
   */
  resetDecay(ruleId: string): void {
    getDatabase()
      .prepare('UPDATE managed_rules SET decay_factor = 1.0 WHERE id = ?')
      .run(ruleId)
  },

  getDecayReport(workspaceId: string): { total: number; healthy: number; decaying: number; deactivated: number } {
    const rows = getDatabase().prepare(`
      SELECT is_active, decay_factor FROM managed_rules WHERE workspace_id = ?
    `).all(workspaceId) as { is_active: number; decay_factor: number }[]

    let healthy = 0, decaying = 0, deactivated = 0
    for (const r of rows) {
      if (!r.is_active) deactivated++
      else if (r.decay_factor < 0.8) decaying++
      else healthy++
    }

    return { total: rows.length, healthy, decaying, deactivated }
  },
}
