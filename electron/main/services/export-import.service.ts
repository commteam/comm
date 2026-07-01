import fs from 'fs'
import { getDatabase } from '../database/connection'
import log from 'electron-log'

export interface ExportData {
  version: number
  exportedAt: string
  workspaceId: string
  rules: unknown[]
  folderProfiles: unknown[]
  scheduledTasks: unknown[]
  habitPatterns: unknown[]
}

export const exportImportService = {
  export(workspaceId: string): ExportData {
    const db = getDatabase()
    const rules = db.prepare('SELECT * FROM managed_rules WHERE workspace_id = ?').all(workspaceId)
    const folderProfiles = db.prepare('SELECT id, name, path, description, dominant_categories, keywords, confidence, is_protected, is_user_created FROM folder_profiles').all()
    const scheduledTasks = db.prepare('SELECT * FROM scheduled_tasks WHERE workspace_id = ?').all(workspaceId)
    const habitPatterns = db.prepare('SELECT * FROM habit_patterns WHERE workspace_id = ?').all(workspaceId)

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      workspaceId,
      rules,
      folderProfiles,
      scheduledTasks,
      habitPatterns,
    }
  },

  exportToFile(workspaceId: string, filePath: string): void {
    const data = this.export(workspaceId)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    log.info(`Exported workspace data to ${filePath}`)
  },

  importFromFile(filePath: string, targetWorkspaceId: string): { imported: number; errors: string[] } {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data: ExportData = JSON.parse(raw)
    const db = getDatabase()
    let imported = 0
    const errors: string[] = []

    if (data.version !== 1) {
      errors.push('Unsupported export version')
      return { imported, errors }
    }

    for (const fp of data.folderProfiles) {
      try {
        const p = fp as Record<string, unknown>
        db.prepare(`INSERT OR IGNORE INTO folder_profiles (id, name, path, description, dominant_categories, keywords, confidence, is_protected, is_user_created, file_count, total_size, last_updated, created_at) VALUES (?,?,?,?,?,?,?,?,?,0,0,?,?)`)
          .run(p['id'], p['name'], p['path'], p['description'] ?? '', p['dominant_categories'] ?? '[]', p['keywords'] ?? '[]', p['confidence'] ?? 0, p['is_protected'] ?? 0, p['is_user_created'] ?? 0, Date.now(), Date.now())
        imported++
      } catch (e) { errors.push(String(e)) }
    }

    for (const rule of data.rules) {
      try {
        const r = rule as Record<string, unknown>
        db.prepare(`INSERT OR IGNORE INTO managed_rules (id, workspace_id, folder_id, folder_name, rule_type, value, strength, confidence, confirmation_count, rejection_count, is_active, decay_factor, last_used_at, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
          .run(r['id'], targetWorkspaceId, r['folder_id'], r['folder_name'], r['rule_type'] ?? 'keyword', r['value'] ?? '', r['strength'] ?? 'weak', r['confidence'] ?? 0, r['confirmation_count'] ?? 0, r['rejection_count'] ?? 0, r['is_active'] ?? 1, r['decay_factor'] ?? 1.0, r['last_used_at'] ?? null, r['created_at'] ?? Date.now())
        imported++
      } catch (e) { errors.push(String(e)) }
    }

    log.info(`Import complete: ${imported} items, ${errors.length} errors`)
    return { imported, errors }
  },
}
