import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type {
  LearningEvent,
  LearningEventType,
  DecisionOutcome,
} from '../../../src/shared/types/intelligence'
import { folderRepo } from '../database/repository'
import { ruleManagerService } from './rule-manager.service'
import { folderProfileUpdaterService } from './folder-profile-updater.service'
import { habitLearningService } from './habit-learning.service'
import log from 'electron-log'

function deserialize(row: Record<string, unknown>): LearningEvent {
  return {
    id: row.id as string,
    type: row.type as LearningEventType,
    fileId: row.file_id as string,
    filename: row.filename as string,
    sourceFolderId: row.source_folder_id as string | undefined,
    targetFolderId: row.target_folder_id as string | undefined,
    previousConfidence: row.previous_confidence as number,
    newConfidence: row.new_confidence as number,
    workspaceId: row.workspace_id as string,
    occurredAt: new Date(row.occurred_at as number),
    metadata: JSON.parse((row.metadata as string) || '{}'),
    reversed: Boolean(row.reversed),
  }
}

export const learningEngineService = {
  /**
   * Called when user confirms a recommendation.
   */
  onConfirmed(
    fileId: string,
    filename: string,
    targetFolderId: string,
    sourceFolderId: string | undefined,
    previousConfidence: number,
    workspaceId: string,
    sessionId?: string,
  ): LearningEvent {
    const newConfidence = Math.min(1, previousConfidence + 0.05)

    // Record decision history
    this._insertDecisionHistory(fileId, filename, targetFolderId, targetFolderId, 'accepted', previousConfidence, workspaceId, sessionId)

    // Strengthen rule
    ruleManagerService.recordConfirmation(targetFolderId, filename, workspaceId)

    // Evolve folder profile
    folderProfileUpdaterService.onFileOrganized(fileId, filename, targetFolderId)

    // Record habit
    habitLearningService.record(targetFolderId, '', filename, workspaceId)

    return this._emit('confirmed_recommendation', fileId, filename, sourceFolderId, targetFolderId, previousConfidence, newConfidence, workspaceId)
  },

  /**
   * Called when user rejects a recommendation and picks a different folder.
   */
  onChanged(
    fileId: string,
    filename: string,
    recommendedFolderId: string,
    actualFolderId: string,
    previousConfidence: number,
    workspaceId: string,
    sessionId?: string,
  ): LearningEvent {
    const newConfidence = Math.max(0, previousConfidence - 0.1)

    this._insertDecisionHistory(fileId, filename, recommendedFolderId, actualFolderId, 'modified', previousConfidence, workspaceId, sessionId)

    // Weaken the recommended folder's rule
    ruleManagerService.recordRejection(recommendedFolderId, filename, workspaceId)

    // Strengthen the actual folder
    ruleManagerService.recordConfirmation(actualFolderId, filename, workspaceId)
    folderProfileUpdaterService.onFileOrganized(fileId, filename, actualFolderId)

    return this._emit('changed_recommendation', fileId, filename, recommendedFolderId, actualFolderId, previousConfidence, newConfidence, workspaceId)
  },

  /**
   * Called when user skips a recommendation.
   */
  onSkipped(
    fileId: string,
    filename: string,
    recommendedFolderId: string,
    previousConfidence: number,
    workspaceId: string,
    sessionId?: string,
  ): LearningEvent {
    const newConfidence = Math.max(0, previousConfidence - 0.02)
    this._insertDecisionHistory(fileId, filename, recommendedFolderId, undefined, 'skipped', previousConfidence, workspaceId, sessionId)
    return this._emit('skipped_recommendation', fileId, filename, recommendedFolderId, undefined, previousConfidence, newConfidence, workspaceId)
  },

  /**
   * Called when user ignores a file.
   */
  onIgnored(
    fileId: string,
    filename: string,
    workspaceId: string,
  ): LearningEvent {
    return this._emit('ignored_file', fileId, filename, undefined, undefined, 0, 0, workspaceId)
  },

  /**
   * Called when user pins a file.
   */
  onPinned(
    fileId: string,
    filename: string,
    workspaceId: string,
  ): LearningEvent {
    return this._emit('pinned_file', fileId, filename, undefined, undefined, 0, 0, workspaceId)
  },

  /**
   * Reverse a learning event (called on undo).
   */
  reverse(learningEventId: string): void {
    getDatabase()
      .prepare('UPDATE learning_events SET reversed = 1 WHERE id = ?')
      .run(learningEventId)

    const row = getDatabase()
      .prepare('SELECT * FROM learning_events WHERE id = ?')
      .get(learningEventId) as Record<string, unknown> | undefined

    if (!row) return

    const event = deserialize(row)

    if (event.type === 'confirmed_recommendation' && event.targetFolderId) {
      ruleManagerService.recordRejection(event.targetFolderId, event.filename, event.workspaceId)
    }

    log.info(`Learning event reversed: ${learningEventId}`)
  },

  getRecent(workspaceId: string, limit = 50): LearningEvent[] {
    const rows = getDatabase()
      .prepare('SELECT * FROM learning_events WHERE workspace_id = ? AND reversed = 0 ORDER BY occurred_at DESC LIMIT ?')
      .all(workspaceId, limit) as Record<string, unknown>[]
    return rows.map(deserialize)
  },

  _emit(
    type: LearningEventType,
    fileId: string,
    filename: string,
    sourceFolderId: string | undefined,
    targetFolderId: string | undefined,
    previousConfidence: number,
    newConfidence: number,
    workspaceId: string,
    metadata: Record<string, unknown> = {},
  ): LearningEvent {
    const event: LearningEvent = {
      id: generateId(),
      type,
      fileId,
      filename,
      sourceFolderId,
      targetFolderId,
      previousConfidence,
      newConfidence,
      workspaceId,
      occurredAt: new Date(),
      metadata,
      reversed: false,
    }

    getDatabase().prepare(`
      INSERT INTO learning_events (id, type, file_id, filename, source_folder_id, target_folder_id, previous_confidence, new_confidence, workspace_id, occurred_at, metadata, reversed)
      VALUES (@id, @type, @fileId, @filename, @sourceFolderId, @targetFolderId, @previousConfidence, @newConfidence, @workspaceId, @occurredAt, @metadata, @reversed)
    `).run({
      id: event.id,
      type: event.type,
      fileId: event.fileId,
      filename: event.filename,
      sourceFolderId: event.sourceFolderId ?? null,
      targetFolderId: event.targetFolderId ?? null,
      previousConfidence: event.previousConfidence,
      newConfidence: event.newConfidence,
      workspaceId: event.workspaceId,
      occurredAt: event.occurredAt.getTime(),
      metadata: JSON.stringify(event.metadata),
      reversed: 0,
    })

    return event
  },

  _insertDecisionHistory(
    fileId: string,
    filename: string,
    recommendedFolderId: string,
    actualFolderId: string | undefined,
    outcome: DecisionOutcome,
    confidence: number,
    workspaceId: string,
    sessionId?: string,
  ): void {
    const folder = folderRepo.findById(recommendedFolderId)
    const actualFolder = actualFolderId ? folderRepo.findById(actualFolderId) : null

    getDatabase().prepare(`
      INSERT INTO decision_history (id, file_id, filename, recommended_folder_id, recommended_folder_name, actual_folder_id, actual_folder_name, outcome, confidence, workspace_id, timestamp, session_id, undone)
      VALUES (@id, @fileId, @filename, @recommendedFolderId, @recommendedFolderName, @actualFolderId, @actualFolderName, @outcome, @confidence, @workspaceId, @timestamp, @sessionId, 0)
    `).run({
      id: generateId(),
      fileId,
      filename,
      recommendedFolderId,
      recommendedFolderName: folder?.name ?? 'Unknown',
      actualFolderId: actualFolderId ?? null,
      actualFolderName: actualFolder?.name ?? null,
      outcome,
      confidence,
      workspaceId,
      timestamp: Date.now(),
      sessionId: sessionId ?? null,
    })
  },
}
