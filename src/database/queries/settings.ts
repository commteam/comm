export const SETTINGS_QUERIES = {
  GET: `SELECT value FROM app_settings WHERE key = ?`,
  SET: `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
  DELETE: `DELETE FROM app_settings WHERE key = ?`,
  GET_ALL: `SELECT key, value FROM app_settings`,
} as const

export const TIMELINE_QUERIES = {
  INSERT: `
    INSERT INTO timeline_entries
      (id, session_id, type, title, description, file_path, target_path, metadata, timestamp)
    VALUES
      (@id, @sessionId, @type, @title, @description, @filePath, @targetPath, @metadata, @timestamp)
  `,
  FIND_RECENT: `SELECT * FROM timeline_entries ORDER BY timestamp DESC LIMIT ?`,
  FIND_BY_TYPE: `SELECT * FROM timeline_entries WHERE type = ? ORDER BY timestamp DESC LIMIT ?`,
  FIND_BY_SESSION: `SELECT * FROM timeline_entries WHERE session_id = ? ORDER BY timestamp DESC`,
} as const

export const DECISION_QUERIES = {
  INSERT: `
    INSERT INTO user_decisions
      (id, file_id, action, target_folder_id, corrected_folder_id, feedback, confidence, decided_at)
    VALUES
      (@id, @fileId, @action, @targetFolderId, @correctedFolderId, @feedback, @confidence, @decidedAt)
  `,
  FIND_BY_FILE: `SELECT * FROM user_decisions WHERE file_id = ? ORDER BY decided_at DESC`,
  COUNT_BY_ACTION: `SELECT action, COUNT(*) as count FROM user_decisions GROUP BY action`,
} as const
