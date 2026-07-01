import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { ManualMoveDetection, ManualMoveResponse } from '../../../src/shared/types/intelligence'
import { desktopIndexService } from './desktop-index.service'
import { learningEngineService } from './learning-engine.service'
import { folderRepo } from '../database/repository'
import log from 'electron-log'

function deserialize(row: Record<string, unknown>): ManualMoveDetection {
  return {
    id: row.id as string,
    files: JSON.parse((row.files as string) || '[]'),
    targetFolder: row.target_folder as string,
    detectedAt: new Date(row.detected_at as number),
    userResponse: row.user_response as ManualMoveResponse | undefined,
    workspaceId: row.workspace_id as string,
  }
}

export const manualMoveDetectorService = {
  /**
   * Compare current desktop state to last known state and detect manually moved files.
   * Called during incremental scans.
   */
  detectManualMoves(currentPaths: string[], workspaceId: string): ManualMoveDetection[] {
    const db = getDatabase()
    const detections: ManualMoveDetection[] = []

    // Find files that were on the desktop but are now gone (and weren't just deleted)
    const knownEntries = desktopIndexService.findAll(workspaceId)
    const currentSet = new Set(currentPaths)

    // Group missing files by their likely new location
    const missingFiles = knownEntries.filter(e =>
      !currentSet.has(e.absolutePath) &&
      !e.deleted &&
      e.organizationStatus !== 'organized'
    )

    if (missingFiles.length === 0) return []

    // Group by target folder (inferred from current location via file system check)
    const byTargetFolder = new Map<string, typeof missingFiles>()
    for (const entry of missingFiles) {
      // Check if file exists somewhere else (simplified: check same filename in tracked folders)
      const folders = folderRepo.findAll()
      for (const folder of folders) {
        const potentialPath = `${folder.path}\\${entry.filename}`
        try {
          const fs = require('fs')
          if (fs.existsSync(potentialPath)) {
            const bucket = byTargetFolder.get(folder.path) ?? []
            bucket.push(entry)
            byTargetFolder.set(folder.path, bucket)
            break
          }
        } catch { /* skip */ }
      }
    }

    // Create detections for groups of 2+ files moved to same folder
    for (const [targetFolder, files] of byTargetFolder) {
      if (files.length < 1) continue

      const detection: ManualMoveDetection = {
        id: generateId(),
        files: files.map(f => ({
          filename: f.filename,
          fromPath: f.absolutePath,
          toPath: `${targetFolder}\\${f.filename}`,
        })),
        targetFolder,
        detectedAt: new Date(),
        workspaceId,
      }

      db.prepare(`
        INSERT INTO manual_move_detections (id, files, target_folder, detected_at, user_response, workspace_id)
        VALUES (@id, @files, @targetFolder, @detectedAt, NULL, @workspaceId)
      `).run({
        id: detection.id,
        files: JSON.stringify(detection.files),
        targetFolder: detection.targetFolder,
        detectedAt: detection.detectedAt.getTime(),
        workspaceId: detection.workspaceId,
      })

      detections.push(detection)
      log.info(`Manual move detected: ${files.length} files → ${targetFolder}`)
    }

    return detections
  },

  recordResponse(detectionId: string, response: ManualMoveResponse, workspaceId: string): void {
    const db = getDatabase()
    db.prepare('UPDATE manual_move_detections SET user_response = ? WHERE id = ?').run(response, detectionId)

    if (response === 'always_learn' || response === 'learn_once') {
      const detection = db.prepare('SELECT * FROM manual_move_detections WHERE id = ?').get(detectionId) as Record<string, unknown> | undefined
      if (!detection) return

      const d = deserialize(detection)
      const folders = folderRepo.findAll()
      const targetFolder = folders.find(f => f.path === d.targetFolder)
      if (!targetFolder) return

      for (const file of d.files) {
        learningEngineService.onConfirmed(
          generateId(),
          file.filename,
          targetFolder.id,
          undefined,
          0,
          workspaceId,
        )
      }
    }
  },

  getPending(workspaceId: string): ManualMoveDetection[] {
    const rows = getDatabase().prepare(
      'SELECT * FROM manual_move_detections WHERE workspace_id = ? AND user_response IS NULL ORDER BY detected_at DESC'
    ).all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },
}
