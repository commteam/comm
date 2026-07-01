export const ORGANIZATION_QUERIES = {
  INSERT_SESSION: `
    INSERT INTO organization_sessions
      (id, mode, status, total_files, processed_files, approved_count, skipped_count, auto_applied_count, started_at)
    VALUES
      (@id, @mode, @status, @totalFiles, @processedFiles, @approvedCount, @skippedCount, @autoAppliedCount, @startedAt)
  `,
  UPDATE_SESSION: `
    UPDATE organization_sessions
    SET status = @status, processed_files = @processedFiles, approved_count = @approvedCount,
        skipped_count = @skippedCount, auto_applied_count = @autoAppliedCount, completed_at = @completedAt
    WHERE id = @id
  `,
  FIND_SESSION_BY_ID: `SELECT * FROM organization_sessions WHERE id = ?`,
  FIND_RECENT_SESSIONS: `SELECT * FROM organization_sessions ORDER BY started_at DESC LIMIT ?`,
  INSERT_RECOMMENDATION: `
    INSERT INTO recommendations
      (id, session_id, file_id, target_folder_id, reasons, confidence, confidence_level,
       status, is_auto_applicable, created_at)
    VALUES
      (@id, @sessionId, @fileId, @targetFolderId, @reasons, @confidence, @confidenceLevel,
       @status, @isAutoApplicable, @createdAt)
  `,
  UPDATE_RECOMMENDATION_STATUS: `
    UPDATE recommendations SET status = @status, resolved_at = @resolvedAt WHERE id = @id
  `,
  FIND_RECOMMENDATIONS_BY_SESSION: `
    SELECT * FROM recommendations WHERE session_id = ? ORDER BY confidence DESC
  `,
  INSERT_MOVE_OPERATION: `
    INSERT INTO move_operations
      (id, session_id, recommendation_id, file_id, source_path, destination_path, status)
    VALUES
      (@id, @sessionId, @recommendationId, @fileId, @sourcePath, @destinationPath, @status)
  `,
  UPDATE_MOVE_OPERATION: `
    UPDATE move_operations SET status = @status, executed_at = @executedAt, error = @error WHERE id = @id
  `,
  UNDO_MOVE_OPERATION: `
    UPDATE move_operations SET status = 'undone', undone_at = ? WHERE id = ?
  `,
  FIND_MOVE_OPS_BY_SESSION: `SELECT * FROM move_operations WHERE session_id = ? ORDER BY executed_at DESC`,
} as const
