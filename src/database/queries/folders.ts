export const FOLDER_QUERIES = {
  INSERT: `
    INSERT OR REPLACE INTO folder_profiles
      (id, name, path, is_protected, is_user_created, description, dominant_categories,
       keywords, file_count, total_size, confidence, last_updated, created_at)
    VALUES
      (@id, @name, @path, @isProtected, @isUserCreated, @description, @dominantCategories,
       @keywords, @fileCount, @totalSize, @confidence, @lastUpdated, @createdAt)
  `,
  FIND_ALL: `SELECT * FROM folder_profiles ORDER BY confidence DESC`,
  FIND_BY_ID: `SELECT * FROM folder_profiles WHERE id = ?`,
  FIND_BY_PATH: `SELECT * FROM folder_profiles WHERE path = ?`,
  UPDATE_STATS: `
    UPDATE folder_profiles
    SET file_count = @fileCount, total_size = @totalSize, last_updated = @lastUpdated
    WHERE id = @id
  `,
  UPDATE_CONFIDENCE: `UPDATE folder_profiles SET confidence = ? WHERE id = ?`,
  DELETE_BY_ID: `DELETE FROM folder_profiles WHERE id = ?`,
  INSERT_RULE: `
    INSERT INTO folder_rules
      (id, folder_id, rule_type, value, priority, is_active, confidence, applied_count, created_at, updated_at)
    VALUES
      (@id, @folderId, @ruleType, @value, @priority, @isActive, @confidence, @appliedCount, @createdAt, @updatedAt)
  `,
  FIND_RULES_BY_FOLDER: `SELECT * FROM folder_rules WHERE folder_id = ? AND is_active = 1 ORDER BY priority DESC`,
  INCREMENT_RULE_APPLIED: `UPDATE folder_rules SET applied_count = applied_count + 1 WHERE id = ?`,
} as const
