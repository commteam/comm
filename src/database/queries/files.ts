export const FILE_QUERIES = {
  INSERT: `
    INSERT OR REPLACE INTO desktop_files
      (id, name, extension, category, path, size, created_at, modified_at, accessed_at,
       is_hidden, is_system, keywords, hash, first_seen_at, last_seen_at)
    VALUES
      (@id, @name, @extension, @category, @path, @size, @createdAt, @modifiedAt, @accessedAt,
       @isHidden, @isSystem, @keywords, @hash, @firstSeenAt, @lastSeenAt)
  `,
  FIND_BY_ID: `SELECT * FROM desktop_files WHERE id = ?`,
  FIND_BY_PATH: `SELECT * FROM desktop_files WHERE path = ?`,
  FIND_ALL: `SELECT * FROM desktop_files ORDER BY modified_at DESC`,
  FIND_BY_CATEGORY: `SELECT * FROM desktop_files WHERE category = ? ORDER BY modified_at DESC`,
  DELETE_BY_PATH: `DELETE FROM desktop_files WHERE path = ?`,
  DELETE_BY_ID: `DELETE FROM desktop_files WHERE id = ?`,
  COUNT: `SELECT COUNT(*) as count FROM desktop_files`,
  UPDATE_LAST_SEEN: `UPDATE desktop_files SET last_seen_at = ? WHERE id = ?`,
} as const
