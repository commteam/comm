import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { Workspace } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

const DEFAULT_WORKSPACE_ID = 'default'

function deserialize(row: Record<string, unknown>): Workspace {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    desktopPath: row.desktop_path as string,
    isActive: Boolean(row.is_active),
    createdAt: new Date(row.created_at as number),
    lastActiveAt: new Date(row.last_active_at as number),
    totalFilesOrganized: row.total_files_organized as number,
    totalSessions: row.total_sessions as number,
    color: row.color as string,
    icon: row.icon as string,
  }
}

export const workspaceService = {
  ensureDefault(desktopPath: string): Workspace {
    const db = getDatabase()
    const existing = db
      .prepare('SELECT * FROM workspaces WHERE id = ?')
      .get(DEFAULT_WORKSPACE_ID) as Record<string, unknown> | undefined

    if (existing) {
      // Update desktop path if it changed
      if (existing.desktop_path !== desktopPath) {
        db.prepare('UPDATE workspaces SET desktop_path = ? WHERE id = ?').run(desktopPath, DEFAULT_WORKSPACE_ID)
        existing.desktop_path = desktopPath
      }
      return deserialize(existing)
    }

    const ws: Workspace = {
      id: DEFAULT_WORKSPACE_ID,
      name: 'My Desktop',
      description: 'Default workspace',
      desktopPath,
      isActive: true,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalFilesOrganized: 0,
      totalSessions: 0,
      color: '#0078D4',
      icon: 'monitor',
    }

    db.prepare(`
      INSERT INTO workspaces (id, name, description, desktop_path, is_active, created_at, last_active_at, total_files_organized, total_sessions, color, icon)
      VALUES (@id, @name, @description, @desktopPath, @isActive, @createdAt, @lastActiveAt, @totalFilesOrganized, @totalSessions, @color, @icon)
    `).run({
      id: ws.id,
      name: ws.name,
      description: ws.description,
      desktopPath: ws.desktopPath,
      isActive: 1,
      createdAt: ws.createdAt.getTime(),
      lastActiveAt: ws.lastActiveAt.getTime(),
      totalFilesOrganized: 0,
      totalSessions: 0,
      color: ws.color,
      icon: ws.icon,
    })

    log.info(`Created default workspace for ${desktopPath}`)
    return ws
  },

  getActive(): Workspace | null {
    const row = getDatabase()
      .prepare('SELECT * FROM workspaces WHERE is_active = 1 LIMIT 1')
      .get() as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  getAll(): Workspace[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM workspaces ORDER BY last_active_at DESC')
      .all() as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getById(id: string): Workspace | null {
    const row = getDatabase()
      .prepare('SELECT * FROM workspaces WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  create(name: string, desktopPath: string): Workspace {
    const ws: Workspace = {
      id: generateId(),
      name,
      description: '',
      desktopPath,
      isActive: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalFilesOrganized: 0,
      totalSessions: 0,
      color: '#0078D4',
      icon: 'monitor',
    }
    getDatabase().prepare(`
      INSERT INTO workspaces (id, name, description, desktop_path, is_active, created_at, last_active_at, total_files_organized, total_sessions, color, icon)
      VALUES (@id, @name, @description, @desktopPath, @isActive, @createdAt, @lastActiveAt, @totalFilesOrganized, @totalSessions, @color, @icon)
    `).run({ ...ws, isActive: 0, createdAt: ws.createdAt.getTime(), lastActiveAt: ws.lastActiveAt.getTime() })
    return ws
  },

  touch(id: string): void {
    getDatabase()
      .prepare('UPDATE workspaces SET last_active_at = ? WHERE id = ?')
      .run(Date.now(), id)
  },

  incrementStats(id: string, filesOrganized: number): void {
    getDatabase().prepare(`
      UPDATE workspaces SET total_files_organized = total_files_organized + ?, total_sessions = total_sessions + 1, last_active_at = ? WHERE id = ?
    `).run(filesOrganized, Date.now(), id)
  },

  getActiveId(): string {
    const ws = this.getActive()
    return ws?.id ?? DEFAULT_WORKSPACE_ID
  },
}
