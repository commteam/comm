import { getDatabase } from '../database/connection'

export interface PrivacyAuditStats {
  documentsOpened: 0
  contentsRead: 0
  cloudUploads: 0
  internetRequests: 0
  externalAiRequests: 0
  metadataScans: number
  organizationSessions: number
  filesOrganized: number
  rulesLearned: number
  workspacesActive: number
}

export const privacyAuditService = {
  getStats(workspaceId?: string): PrivacyAuditStats {
    const db = getDatabase()

    const scanRow = workspaceId
      ? db.prepare('SELECT COUNT(*) as count FROM desktop_stats WHERE workspace_id = ?').get(workspaceId) as { count: number }
      : db.prepare('SELECT COUNT(*) as count FROM desktop_stats').get() as { count: number }

    const sessionRow = workspaceId
      ? db.prepare("SELECT COUNT(*) as count FROM org_sessions_v2 WHERE workspace_id = ? AND status = 'complete'").get(workspaceId) as { count: number }
      : db.prepare("SELECT COUNT(*) as count FROM org_sessions_v2 WHERE status = 'complete'").get() as { count: number }

    const moveRow = workspaceId
      ? db.prepare("SELECT COUNT(*) as count FROM file_moves WHERE workspace_id = ? AND status = 'success'").get(workspaceId) as { count: number }
      : db.prepare("SELECT COUNT(*) as count FROM file_moves WHERE status = 'success'").get() as { count: number }

    const ruleRow = workspaceId
      ? db.prepare('SELECT COUNT(*) as count FROM managed_rules WHERE workspace_id = ? AND active = 1').get(workspaceId) as { count: number }
      : db.prepare('SELECT COUNT(*) as count FROM managed_rules WHERE active = 1').get() as { count: number }

    const wsRow = db.prepare('SELECT COUNT(*) as count FROM workspaces')
      .get() as { count: number }

    return {
      documentsOpened: 0,
      contentsRead: 0,
      cloudUploads: 0,
      internetRequests: 0,
      externalAiRequests: 0,
      metadataScans: scanRow?.count ?? 0,
      organizationSessions: sessionRow?.count ?? 0,
      filesOrganized: moveRow?.count ?? 0,
      rulesLearned: ruleRow?.count ?? 0,
      workspacesActive: wsRow?.count ?? 0,
    }
  },
}
