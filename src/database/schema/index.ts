export const SCHEMA_SQL = `
-- Files discovered on desktop
CREATE TABLE IF NOT EXISTS desktop_files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  extension TEXT NOT NULL,
  category TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  size INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  modified_at INTEGER NOT NULL,
  accessed_at INTEGER NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  keywords TEXT NOT NULL DEFAULT '[]',
  hash TEXT,
  first_seen_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL
);

-- Metadata attached to files
CREATE TABLE IF NOT EXISTS file_metadata (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL REFERENCES desktop_files(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Folder profiles discovered on desktop
CREATE TABLE IF NOT EXISTS folder_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  is_protected INTEGER NOT NULL DEFAULT 0,
  is_user_created INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  dominant_categories TEXT NOT NULL DEFAULT '[]',
  keywords TEXT NOT NULL DEFAULT '[]',
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0.0,
  last_updated INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Rules associated with folder profiles
CREATE TABLE IF NOT EXISTS folder_rules (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL REFERENCES folder_profiles(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  value TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  confidence REAL NOT NULL DEFAULT 0.0,
  applied_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Protected folder paths
CREATE TABLE IF NOT EXISTS protected_folders (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT '',
  added_at INTEGER NOT NULL
);

-- Organization sessions
CREATE TABLE IF NOT EXISTS organization_sessions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT 'simulation',
  status TEXT NOT NULL DEFAULT 'pending',
  total_files INTEGER NOT NULL DEFAULT 0,
  processed_files INTEGER NOT NULL DEFAULT 0,
  approved_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  auto_applied_count INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER NOT NULL,
  completed_at INTEGER
);

-- Recommendations made during sessions
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES organization_sessions(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES desktop_files(id) ON DELETE CASCADE,
  target_folder_id TEXT NOT NULL REFERENCES folder_profiles(id) ON DELETE CASCADE,
  reasons TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0.0,
  confidence_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  is_auto_applicable INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER
);

-- Move operations (the actual file moves)
CREATE TABLE IF NOT EXISTS move_operations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES organization_sessions(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  source_path TEXT NOT NULL,
  destination_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at INTEGER,
  undone_at INTEGER,
  error TEXT
);

-- User decisions for learning
CREATE TABLE IF NOT EXISTS user_decisions (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_folder_id TEXT,
  corrected_folder_id TEXT,
  feedback TEXT,
  confidence REAL NOT NULL DEFAULT 0.0,
  decided_at INTEGER NOT NULL
);

-- Timeline of all events
CREATE TABLE IF NOT EXISTS timeline_entries (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_path TEXT,
  target_path TEXT,
  metadata TEXT NOT NULL DEFAULT '{}',
  timestamp INTEGER NOT NULL
);

-- Application settings (key-value store)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Application sessions (usage tracking)
CREATE TABLE IF NOT EXISTS app_sessions (
  id TEXT PRIMARY KEY,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  files_scanned INTEGER NOT NULL DEFAULT 0,
  files_organized INTEGER NOT NULL DEFAULT 0,
  recommendations_generated INTEGER NOT NULL DEFAULT 0,
  decisions_recorded INTEGER NOT NULL DEFAULT 0
);

-- Scan state for incremental scanning
CREATE TABLE IF NOT EXISTS scan_state (
  id TEXT PRIMARY KEY DEFAULT 'current',
  last_scan_at INTEGER,
  last_scan_duration INTEGER,
  files_count INTEGER NOT NULL DEFAULT 0,
  desktop_path TEXT NOT NULL DEFAULT ''
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_category ON desktop_files(category);
CREATE INDEX IF NOT EXISTS idx_files_extension ON desktop_files(extension);
CREATE INDEX IF NOT EXISTS idx_files_modified ON desktop_files(modified_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_session ON recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_move_ops_session ON move_operations(session_id);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_entries(type);
CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON timeline_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_decisions_file ON user_decisions(file_id);
CREATE INDEX IF NOT EXISTS idx_folder_rules_folder ON folder_rules(folder_id);
`
