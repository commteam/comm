import fs from 'fs'
import path from 'path'
import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { ChangeEvent, ChangeEventType } from '../../../src/shared/types/intelligence'
import { desktopIndexService } from './desktop-index.service'
import log from 'electron-log'

const LARGE_FILE_THRESHOLD_MB = 100

function deserialize(row: Record<string, unknown>): ChangeEvent {
  return {
    id: row.id as string,
    type: row.type as ChangeEventType,
    filePath: row.file_path as string,
    previousPath: row.previous_path as string | undefined,
    fileSize: row.file_size as number,
    detectedAt: new Date(row.detected_at as number),
    workspaceId: row.workspace_id as string,
    processed: Boolean(row.processed),
    metadata: JSON.parse((row.metadata as string) || '{}'),
  }
}

export const changeDetectorService = {
  detectChanges(
    currentPaths: string[],
    workspaceId: string,
    scanVersion: number,
  ): ChangeEvent[] {
    const db = getDatabase()
    const known = desktopIndexService.getKnownPaths(workspaceId)
    const currentSet = new Set(currentPaths)
    const events: ChangeEvent[] = []

    // Detect new and modified files
    for (const filePath of currentPaths) {
      if (!fs.existsSync(filePath)) continue

      let stat: fs.Stats
      try {
        stat = fs.statSync(filePath)
      } catch {
        continue
      }

      if (!known.has(filePath)) {
        // New file
        const eventType: ChangeEventType =
          stat.size > LARGE_FILE_THRESHOLD_MB * 1024 * 1024 ? 'large_file' : 'new_file'
        events.push(this._emit(eventType, filePath, stat.size, workspaceId))
      } else {
        // Check if modified
        const prevHash = desktopIndexService.getPreviousHash(filePath)
        if (prevHash !== null) {
          const existing = desktopIndexService.findByPath(filePath)
          if (existing && existing.modifiedDate.getTime() !== stat.mtimeMs) {
            events.push(this._emit('modified_file', filePath, stat.size, workspaceId))
          }
        }
      }

      // Check large file (even if known)
      if (stat.size > LARGE_FILE_THRESHOLD_MB * 1024 * 1024) {
        const existing = desktopIndexService.findByPath(filePath)
        if (!existing) {
          events.push(this._emit('large_file', filePath, stat.size, workspaceId))
        }
      }
    }

    // Detect deleted files
    for (const knownPath of known) {
      if (!currentSet.has(knownPath) && !fs.existsSync(knownPath)) {
        desktopIndexService.markDeleted(knownPath)
        events.push(this._emit('deleted_file', knownPath, 0, workspaceId))
      }
    }

    // Detect duplicates
    const duplicateGroups = desktopIndexService.findDuplicates(workspaceId)
    for (const group of duplicateGroups) {
      for (const entry of group.slice(1)) {
        events.push(this._emit('duplicate_file', entry.absolutePath, entry.fileSize, workspaceId, { duplicateOf: group[0].absolutePath }))
      }
    }

    // Persist events
    if (events.length > 0) {
      const insert = db.prepare(`
        INSERT INTO change_events (id, type, file_path, previous_path, file_size, detected_at, workspace_id, processed, metadata)
        VALUES (@id, @type, @filePath, @previousPath, @fileSize, @detectedAt, @workspaceId, @processed, @metadata)
      `)
      const insertMany = db.transaction((evts: ChangeEvent[]) => {
        for (const e of evts) {
          insert.run({
            id: e.id,
            type: e.type,
            filePath: e.filePath,
            previousPath: e.previousPath ?? null,
            fileSize: e.fileSize,
            detectedAt: e.detectedAt.getTime(),
            workspaceId: e.workspaceId,
            processed: 0,
            metadata: JSON.stringify(e.metadata),
          })
        }
      })
      insertMany(events)
      log.info(`Detected ${events.length} change events`)
    }

    return events
  },

  _emit(
    type: ChangeEventType,
    filePath: string,
    fileSize: number,
    workspaceId: string,
    metadata: Record<string, unknown> = {},
    previousPath?: string,
  ): ChangeEvent {
    return {
      id: generateId(),
      type,
      filePath,
      previousPath,
      fileSize,
      detectedAt: new Date(),
      workspaceId,
      processed: false,
      metadata,
    }
  },

  emitManual(
    type: ChangeEventType,
    filePath: string,
    fileSize: number,
    workspaceId: string,
    previousPath?: string,
  ): ChangeEvent {
    const event = this._emit(type, filePath, fileSize, workspaceId, {}, previousPath)
    getDatabase().prepare(`
      INSERT INTO change_events (id, type, file_path, previous_path, file_size, detected_at, workspace_id, processed, metadata)
      VALUES (@id, @type, @filePath, @previousPath, @fileSize, @detectedAt, @workspaceId, @processed, @metadata)
    `).run({
      id: event.id,
      type: event.type,
      filePath: event.filePath,
      previousPath: event.previousPath ?? null,
      fileSize: event.fileSize,
      detectedAt: event.detectedAt.getTime(),
      workspaceId: event.workspaceId,
      processed: 0,
      metadata: '{}',
    })
    return event
  },

  markProcessed(id: string): void {
    getDatabase().prepare('UPDATE change_events SET processed = 1 WHERE id = ?').run(id)
  },

  getPending(workspaceId: string): ChangeEvent[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM change_events WHERE workspace_id = ? AND processed = 0 ORDER BY detected_at DESC')
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  getRecent(workspaceId: string, limit = 50): ChangeEvent[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM change_events WHERE workspace_id = ? ORDER BY detected_at DESC LIMIT ?')
      .all(workspaceId, limit) as Record<string, unknown>[]
    return rows.map(deserialize)
  },
}
