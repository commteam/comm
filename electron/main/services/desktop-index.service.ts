import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import { getFileCategory, extractKeywords } from '../../../src/shared/utils/file'
import type { DesktopIndexEntry, OrganizationStatus } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

// Quick hash using first 64KB + file size + mtime
function quickHash(filePath: string, size: number, mtime: number): string {
  try {
    const buf = Buffer.alloc(Math.min(65536, size))
    const fd = fs.openSync(filePath, 'r')
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0)
    fs.closeSync(fd)
    return crypto
      .createHash('md5')
      .update(buf.slice(0, bytesRead))
      .update(String(size))
      .update(String(mtime))
      .digest('hex')
  } catch {
    return crypto.createHash('md5').update(String(size)).update(String(mtime)).digest('hex')
  }
}

function makeId(filePath: string): string {
  return crypto.createHash('md5').update(filePath).digest('hex')
}

function deserialize(row: Record<string, unknown>): DesktopIndexEntry {
  return {
    id: row.id as string,
    absolutePath: row.absolute_path as string,
    currentFolder: row.current_folder as string,
    originalFolder: row.original_folder as string,
    filename: row.filename as string,
    extension: row.extension as string,
    fileSize: row.file_size as number,
    createdDate: new Date(row.created_date as number),
    modifiedDate: new Date(row.modified_date as number),
    lastSeenDate: new Date(row.last_seen_date as number),
    quickHash: row.quick_hash as string,
    sha256Hash: row.sha256_hash as string | undefined,
    fileCategory: row.file_category as string,
    aiCategory: row.ai_category as string,
    organizationStatus: row.organization_status as OrganizationStatus,
    confidence: row.confidence as number,
    lastRecommendation: row.last_recommendation as string | undefined,
    ruleUsed: row.rule_used as string | undefined,
    folderProfileUsed: row.folder_profile_used as string | undefined,
    manualOverride: Boolean(row.manual_override),
    ignored: Boolean(row.ignored),
    pinned: Boolean(row.pinned),
    favorite: Boolean(row.favorite),
    deleted: Boolean(row.deleted),
    archived: Boolean(row.archived),
    scanVersion: row.scan_version as number,
    workspaceId: row.workspace_id as string,
  }
}

export const desktopIndexService = {
  indexFile(filePath: string, workspaceId: string, currentScanVersion: number): DesktopIndexEntry {
    const db = getDatabase()
    const stat = fs.statSync(filePath)
    const filename = path.basename(filePath)
    const ext = path.extname(filename).toLowerCase()
    const folder = path.dirname(filePath)
    const id = makeId(filePath)
    const hash = quickHash(filePath, stat.size, stat.mtimeMs)
    const category = getFileCategory(ext)

    const existing = db.prepare('SELECT * FROM desktop_index WHERE id = ?').get(id) as Record<string, unknown> | undefined

    const now = Date.now()
    const entry: DesktopIndexEntry = {
      id,
      absolutePath: filePath,
      currentFolder: folder,
      originalFolder: existing ? (existing.original_folder as string) : folder,
      filename,
      extension: ext,
      fileSize: stat.size,
      createdDate: new Date(stat.birthtimeMs),
      modifiedDate: new Date(stat.mtimeMs),
      lastSeenDate: new Date(now),
      quickHash: hash,
      fileCategory: category,
      aiCategory: existing ? (existing.ai_category as string) : category,
      organizationStatus: existing ? (existing.organization_status as OrganizationStatus) : 'new',
      confidence: existing ? (existing.confidence as number) : 0,
      lastRecommendation: existing?.last_recommendation as string | undefined,
      ruleUsed: existing?.rule_used as string | undefined,
      folderProfileUsed: existing?.folder_profile_used as string | undefined,
      manualOverride: existing ? Boolean(existing.manual_override) : false,
      ignored: existing ? Boolean(existing.ignored) : false,
      pinned: existing ? Boolean(existing.pinned) : false,
      favorite: existing ? Boolean(existing.favorite) : false,
      deleted: false,
      archived: false,
      scanVersion: currentScanVersion,
      workspaceId,
    }

    db.prepare(`
      INSERT INTO desktop_index (
        id, absolute_path, current_folder, original_folder, filename, extension,
        file_size, created_date, modified_date, last_seen_date, quick_hash,
        file_category, ai_category, organization_status, confidence,
        last_recommendation, rule_used, folder_profile_used, manual_override,
        ignored, pinned, favorite, deleted, archived, scan_version, workspace_id
      ) VALUES (
        @id, @absolutePath, @currentFolder, @originalFolder, @filename, @extension,
        @fileSize, @createdDate, @modifiedDate, @lastSeenDate, @quickHash,
        @fileCategory, @aiCategory, @organizationStatus, @confidence,
        @lastRecommendation, @ruleUsed, @folderProfileUsed, @manualOverride,
        @ignored, @pinned, @favorite, @deleted, @archived, @scanVersion, @workspaceId
      ) ON CONFLICT(id) DO UPDATE SET
        current_folder = excluded.current_folder,
        filename = excluded.filename,
        file_size = excluded.file_size,
        modified_date = excluded.modified_date,
        last_seen_date = excluded.last_seen_date,
        quick_hash = excluded.quick_hash,
        file_category = excluded.file_category,
        scan_version = excluded.scan_version
    `).run({
      id: entry.id,
      absolutePath: entry.absolutePath,
      currentFolder: entry.currentFolder,
      originalFolder: entry.originalFolder,
      filename: entry.filename,
      extension: entry.extension,
      fileSize: entry.fileSize,
      createdDate: entry.createdDate.getTime(),
      modifiedDate: entry.modifiedDate.getTime(),
      lastSeenDate: entry.lastSeenDate.getTime(),
      quickHash: entry.quickHash,
      fileCategory: entry.fileCategory,
      aiCategory: entry.aiCategory,
      organizationStatus: entry.organizationStatus,
      confidence: entry.confidence,
      lastRecommendation: entry.lastRecommendation ?? null,
      ruleUsed: entry.ruleUsed ?? null,
      folderProfileUsed: entry.folderProfileUsed ?? null,
      manualOverride: entry.manualOverride ? 1 : 0,
      ignored: entry.ignored ? 1 : 0,
      pinned: entry.pinned ? 1 : 0,
      favorite: entry.favorite ? 1 : 0,
      deleted: 0,
      archived: 0,
      scanVersion: entry.scanVersion,
      workspaceId: entry.workspaceId,
    })

    return entry
  },

  markDeleted(absolutePath: string): void {
    getDatabase()
      .prepare('UPDATE desktop_index SET deleted = 1, last_seen_date = ? WHERE absolute_path = ?')
      .run(Date.now(), absolutePath)
  },

  findByPath(absolutePath: string): DesktopIndexEntry | null {
    const row = getDatabase()
      .prepare('SELECT * FROM desktop_index WHERE absolute_path = ?')
      .get(absolutePath) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },

  findAll(workspaceId: string): DesktopIndexEntry[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM desktop_index WHERE workspace_id = ? AND deleted = 0 ORDER BY modified_date DESC')
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  findNew(workspaceId: string): DesktopIndexEntry[] {
    const rows = getDatabase()
      .prepare("SELECT * FROM desktop_index WHERE workspace_id = ? AND organization_status = 'new' AND deleted = 0 AND ignored = 0")
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  findNeedsReview(workspaceId: string): DesktopIndexEntry[] {
    const rows = getDatabase()
      .prepare("SELECT * FROM desktop_index WHERE workspace_id = ? AND organization_status IN ('new', 'needs_review') AND deleted = 0 AND ignored = 0 AND pinned = 0")
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  findPinned(workspaceId: string): DesktopIndexEntry[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM desktop_index WHERE workspace_id = ? AND pinned = 1 AND deleted = 0')
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  updateStatus(id: string, status: OrganizationStatus, confidence?: number): void {
    const db = getDatabase()
    if (confidence !== undefined) {
      db.prepare('UPDATE desktop_index SET organization_status = ?, confidence = ? WHERE id = ?').run(status, confidence, id)
    } else {
      db.prepare('UPDATE desktop_index SET organization_status = ? WHERE id = ?').run(status, id)
    }
  },

  setIgnored(id: string, ignored: boolean): void {
    getDatabase().prepare('UPDATE desktop_index SET ignored = ? WHERE id = ?').run(ignored ? 1 : 0, id)
  },

  setPinned(id: string, pinned: boolean): void {
    getDatabase().prepare('UPDATE desktop_index SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, id)
  },

  setFavorite(id: string, favorite: boolean): void {
    getDatabase().prepare('UPDATE desktop_index SET favorite = ? WHERE id = ?').run(favorite ? 1 : 0, id)
  },

  countByStatus(workspaceId: string): Record<OrganizationStatus, number> {
    const rows = getDatabase()
      .prepare('SELECT organization_status, COUNT(*) as count FROM desktop_index WHERE workspace_id = ? AND deleted = 0 GROUP BY organization_status')
      .all(workspaceId) as { organization_status: string; count: number }[]
    const result: Record<string, number> = {}
    for (const r of rows) result[r.organization_status] = r.count
    return result as Record<OrganizationStatus, number>
  },

  findDuplicates(workspaceId: string): DesktopIndexEntry[][] {
    const rows = getDatabase()
      .prepare('SELECT * FROM desktop_index WHERE workspace_id = ? AND deleted = 0 AND quick_hash != "" ORDER BY quick_hash')
      .all(workspaceId) as Record<string, unknown>[]
    const byHash = new Map<string, DesktopIndexEntry[]>()
    for (const r of rows) {
      const e = deserialize(r)
      const bucket = byHash.get(e.quickHash) ?? []
      bucket.push(e)
      byHash.set(e.quickHash, bucket)
    }
    return [...byHash.values()].filter(g => g.length > 1)
  },

  findLargeFiles(workspaceId: string, thresholdMb = 100): DesktopIndexEntry[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM desktop_index WHERE workspace_id = ? AND deleted = 0 AND file_size > ? ORDER BY file_size DESC')
      .all(workspaceId, thresholdMb * 1024 * 1024) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  findOldFiles(workspaceId: string, daysOld = 365): DesktopIndexEntry[] {
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000
    const rows = getDatabase()
      .prepare("SELECT * FROM desktop_index WHERE workspace_id = ? AND deleted = 0 AND organization_status = 'new' AND modified_date < ? ORDER BY modified_date ASC")
      .all(workspaceId, cutoff) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getPreviousHash(absolutePath: string): string | null {
    const row = getDatabase()
      .prepare('SELECT quick_hash FROM desktop_index WHERE absolute_path = ?')
      .get(absolutePath) as { quick_hash: string } | undefined
    return row?.quick_hash ?? null
  },

  updateRecommendation(id: string, recommendation: string, folderId: string, ruleId?: string): void {
    getDatabase().prepare(
      'UPDATE desktop_index SET last_recommendation = ?, folder_profile_used = ?, rule_used = ? WHERE id = ?'
    ).run(recommendation, folderId, ruleId ?? null, id)
  },

  getKnownPaths(workspaceId: string): Set<string> {
    const rows = getDatabase()
      .prepare('SELECT absolute_path FROM desktop_index WHERE workspace_id = ? AND deleted = 0')
      .all(workspaceId) as { absolute_path: string }[]
    return new Set(rows.map(r => r.absolute_path))
  },

  count(workspaceId: string): number {
    const result = getDatabase()
      .prepare('SELECT COUNT(*) as count FROM desktop_index WHERE workspace_id = ? AND deleted = 0')
      .get(workspaceId) as { count: number }
    return result.count
  },
}
