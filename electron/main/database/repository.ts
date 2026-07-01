import type Database from 'better-sqlite3'
import { getDatabase } from './connection'
import { generateId } from '../../../src/shared/utils'
import { FILE_QUERIES } from '../../../src/database/queries/files'
import { FOLDER_QUERIES } from '../../../src/database/queries/folders'
import { ORGANIZATION_QUERIES } from '../../../src/database/queries/organization'
import { SETTINGS_QUERIES, TIMELINE_QUERIES, DECISION_QUERIES } from '../../../src/database/queries/settings'
import type {
  DesktopFile,
  FolderProfile,
  FolderRule,
  OrganizationSession,
  Recommendation,
  MoveOperation,
  TimelineEntry,
  UserDecision,
  AppSettings,
} from '../../../src/shared/types'

// ─── File Repository ────────────────────────────────────────────────────────

export const fileRepo = {
  upsert(file: DesktopFile): void {
    const db = getDatabase()
    const stmt = db.prepare(FILE_QUERIES.INSERT)
    stmt.run({
      id: file.id,
      name: file.name,
      extension: file.extension,
      category: file.category,
      path: file.path,
      size: file.size,
      createdAt: file.createdAt.getTime(),
      modifiedAt: file.modifiedAt.getTime(),
      accessedAt: file.accessedAt.getTime(),
      isHidden: file.isHidden ? 1 : 0,
      isSystem: file.isSystem ? 1 : 0,
      keywords: JSON.stringify(file.keywords),
      hash: file.hash ?? null,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
    })
  },

  findById(id: string): DesktopFile | null {
    const db = getDatabase()
    const row = db.prepare(FILE_QUERIES.FIND_BY_ID).get(id) as Record<string, unknown> | undefined
    return row ? deserializeFile(row) : null
  },

  findAll(): DesktopFile[] {
    const db = getDatabase()
    const rows = db.prepare(FILE_QUERIES.FIND_ALL).all() as Record<string, unknown>[]
    return rows.map(deserializeFile)
  },

  deleteById(id: string): void {
    getDatabase().prepare(FILE_QUERIES.DELETE_BY_ID).run(id)
  },

  count(): number {
    const db = getDatabase()
    const result = db.prepare(FILE_QUERIES.COUNT).get() as { count: number }
    return result.count
  },
}

// ─── Folder Repository ──────────────────────────────────────────────────────

export const folderRepo = {
  upsert(profile: FolderProfile): void {
    const db = getDatabase()
    db.prepare(FOLDER_QUERIES.INSERT).run({
      id: profile.id,
      name: profile.name,
      path: profile.path,
      isProtected: profile.isProtected ? 1 : 0,
      isUserCreated: profile.isUserCreated ? 1 : 0,
      description: profile.description,
      dominantCategories: JSON.stringify(profile.dominantCategories),
      keywords: JSON.stringify(profile.keywords),
      fileCount: profile.fileCount,
      totalSize: profile.totalSize,
      confidence: profile.confidence,
      lastUpdated: profile.lastUpdated.getTime(),
      createdAt: profile.createdAt.getTime(),
    })
  },

  findAll(): FolderProfile[] {
    const db = getDatabase()
    const rows = db.prepare(FOLDER_QUERIES.FIND_ALL).all() as Record<string, unknown>[]
    return rows.map(deserializeFolder)
  },

  findById(id: string): FolderProfile | null {
    const db = getDatabase()
    const row = db.prepare(FOLDER_QUERIES.FIND_BY_ID).get(id) as Record<string, unknown> | undefined
    return row ? deserializeFolder(row) : null
  },

  upsertRule(rule: FolderRule): void {
    const db = getDatabase()
    db.prepare(FOLDER_QUERIES.INSERT_RULE).run({
      id: rule.id,
      folderId: rule.folderId,
      ruleType: rule.ruleType,
      value: rule.value,
      priority: rule.priority,
      isActive: rule.isActive ? 1 : 0,
      confidence: rule.confidence,
      appliedCount: rule.appliedCount,
      createdAt: rule.createdAt.getTime(),
      updatedAt: rule.updatedAt.getTime(),
    })
  },

  findRulesByFolder(folderId: string): FolderRule[] {
    const db = getDatabase()
    const rows = db.prepare(FOLDER_QUERIES.FIND_RULES_BY_FOLDER).all(folderId) as Record<string, unknown>[]
    return rows.map(deserializeFolderRule)
  },
}

// ─── Organization Repository ────────────────────────────────────────────────

export const orgRepo = {
  insertSession(session: OrganizationSession): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.INSERT_SESSION).run({
      id: session.id,
      mode: session.mode,
      status: session.status,
      totalFiles: session.totalFiles,
      processedFiles: session.processedFiles,
      approvedCount: session.approvedCount,
      skippedCount: session.skippedCount,
      autoAppliedCount: session.autoAppliedCount,
      startedAt: session.startedAt.getTime(),
    })
  },

  updateSession(session: Partial<OrganizationSession> & { id: string }): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.UPDATE_SESSION).run({
      id: session.id,
      status: session.status,
      processedFiles: session.processedFiles,
      approvedCount: session.approvedCount,
      skippedCount: session.skippedCount,
      autoAppliedCount: session.autoAppliedCount,
      completedAt: session.completedAt?.getTime() ?? null,
    })
  },

  insertRecommendation(rec: Recommendation): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.INSERT_RECOMMENDATION).run({
      id: rec.id,
      sessionId: rec.sessionId,
      fileId: rec.file.id,
      targetFolderId: rec.targetFolder.id,
      reasons: JSON.stringify(rec.reasons),
      confidence: rec.confidence,
      confidenceLevel: rec.confidenceLevel,
      status: rec.status,
      isAutoApplicable: rec.isAutoApplicable ? 1 : 0,
      createdAt: rec.createdAt.getTime(),
    })
  },

  updateRecommendationStatus(id: string, status: string): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.UPDATE_RECOMMENDATION_STATUS).run({
      id,
      status,
      resolvedAt: Date.now(),
    })
  },

  insertMoveOperation(op: MoveOperation): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.INSERT_MOVE_OPERATION).run({
      id: op.id,
      sessionId: op.sessionId,
      recommendationId: op.recommendationId,
      fileId: op.fileId,
      sourcePath: op.sourcePath,
      destinationPath: op.destinationPath,
      status: op.status,
    })
  },

  completeMoveOperation(id: string, error?: string): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.UPDATE_MOVE_OPERATION).run({
      id,
      status: error ? 'failed' : 'completed',
      executedAt: Date.now(),
      error: error ?? null,
    })
  },

  undoMoveOperation(id: string): void {
    getDatabase().prepare(ORGANIZATION_QUERIES.UNDO_MOVE_OPERATION).run(Date.now(), id)
  },

  findMoveOpsBySession(sessionId: string): MoveOperation[] {
    const db = getDatabase()
    const rows = db.prepare(ORGANIZATION_QUERIES.FIND_MOVE_OPS_BY_SESSION).all(sessionId) as Record<string, unknown>[]
    return rows.map(deserializeMoveOp)
  },
}

// ─── Settings Repository ─────────────────────────────────────────────────────

export const settingsRepo = {
  get<T>(key: string): T | null {
    const db = getDatabase()
    const row = db.prepare(SETTINGS_QUERIES.GET).get(key) as { value: string } | undefined
    if (!row) return null
    try {
      return JSON.parse(row.value) as T
    } catch {
      return row.value as unknown as T
    }
  },

  set(key: string, value: unknown): void {
    getDatabase().prepare(SETTINGS_QUERIES.SET).run(key, JSON.stringify(value), Date.now())
  },

  getAll(): Record<string, unknown> {
    const db = getDatabase()
    const rows = db.prepare(SETTINGS_QUERIES.GET_ALL).all() as { key: string; value: string }[]
    return Object.fromEntries(rows.map(r => [r.key, JSON.parse(r.value)]))
  },
}

// ─── Timeline Repository ─────────────────────────────────────────────────────

export const timelineRepo = {
  insert(entry: TimelineEntry): void {
    getDatabase().prepare(TIMELINE_QUERIES.INSERT).run({
      id: entry.id,
      sessionId: entry.sessionId ?? null,
      type: entry.type,
      title: entry.title,
      description: entry.description,
      filePath: entry.filePath ?? null,
      targetPath: entry.targetPath ?? null,
      metadata: JSON.stringify(entry.metadata ?? {}),
      timestamp: entry.timestamp.getTime(),
    })
  },

  findRecent(limit = 50): TimelineEntry[] {
    const db = getDatabase()
    const rows = db.prepare(TIMELINE_QUERIES.FIND_RECENT).all(limit) as Record<string, unknown>[]
    return rows.map(deserializeTimelineEntry)
  },
}

// ─── Decision Repository ─────────────────────────────────────────────────────

export const decisionRepo = {
  insert(decision: UserDecision & { id: string; confidence: number }): void {
    getDatabase().prepare(DECISION_QUERIES.INSERT).run({
      id: decision.id,
      fileId: decision.fileId,
      action: decision.action,
      targetFolderId: decision.targetFolderId ?? null,
      correctedFolderId: decision.correctedFolderId ?? null,
      feedback: decision.feedback ?? null,
      confidence: decision.confidence,
      decidedAt: decision.decidedAt.getTime(),
    })
  },

  findByFile(fileId: string): UserDecision[] {
    const db = getDatabase()
    const rows = db.prepare(DECISION_QUERIES.FIND_BY_FILE).all(fileId) as Record<string, unknown>[]
    return rows.map(r => ({
      fileId: r.file_id as string,
      action: r.action as UserDecision['action'],
      targetFolderId: r.target_folder_id as string | undefined,
      correctedFolderId: r.corrected_folder_id as string | undefined,
      feedback: r.feedback as string | undefined,
      decidedAt: new Date(r.decided_at as number),
    }))
  },
}

// ─── Deserializers ────────────────────────────────────────────────────────────

function deserializeFile(row: Record<string, unknown>): DesktopFile {
  return {
    id: row.id as string,
    name: row.name as string,
    extension: row.extension as string,
    category: row.category as DesktopFile['category'],
    path: row.path as string,
    size: row.size as number,
    createdAt: new Date(row.created_at as number),
    modifiedAt: new Date(row.modified_at as number),
    accessedAt: new Date(row.accessed_at as number),
    isHidden: Boolean(row.is_hidden),
    isSystem: Boolean(row.is_system),
    keywords: JSON.parse((row.keywords as string) || '[]'),
    hash: row.hash as string | undefined,
  }
}

function deserializeFolder(row: Record<string, unknown>): FolderProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    path: row.path as string,
    isProtected: Boolean(row.is_protected),
    isUserCreated: Boolean(row.is_user_created),
    description: row.description as string,
    dominantCategories: JSON.parse((row.dominant_categories as string) || '[]'),
    keywords: JSON.parse((row.keywords as string) || '[]'),
    fileCount: row.file_count as number,
    totalSize: row.total_size as number,
    confidence: row.confidence as number,
    lastUpdated: new Date(row.last_updated as number),
    createdAt: new Date(row.created_at as number),
  }
}

function deserializeFolderRule(row: Record<string, unknown>): FolderRule {
  return {
    id: row.id as string,
    folderId: row.folder_id as string,
    ruleType: row.rule_type as FolderRule['ruleType'],
    value: row.value as string,
    priority: row.priority as number,
    isActive: Boolean(row.is_active),
    confidence: row.confidence as number,
    appliedCount: row.applied_count as number,
    createdAt: new Date(row.created_at as number),
    updatedAt: new Date(row.updated_at as number),
  }
}

function deserializeMoveOp(row: Record<string, unknown>): MoveOperation {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    recommendationId: row.recommendation_id as string,
    fileId: row.file_id as string,
    sourcePath: row.source_path as string,
    destinationPath: row.destination_path as string,
    status: row.status as MoveOperation['status'],
    executedAt: row.executed_at ? new Date(row.executed_at as number) : undefined,
    undoneAt: row.undone_at ? new Date(row.undone_at as number) : undefined,
    error: row.error as string | undefined,
  }
}

function deserializeTimelineEntry(row: Record<string, unknown>): TimelineEntry {
  return {
    id: row.id as string,
    sessionId: row.session_id as string | undefined,
    type: row.type as TimelineEntry['type'],
    title: row.title as string,
    description: row.description as string,
    filePath: row.file_path as string | undefined,
    targetPath: row.target_path as string | undefined,
    metadata: JSON.parse((row.metadata as string) || '{}'),
    timestamp: new Date(row.timestamp as number),
  }
}
