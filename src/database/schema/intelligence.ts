export const INTELLIGENCE_SCHEMA_SQL = `
-- Desktop file index (comprehensive per-file intelligence record)
CREATE TABLE IF NOT EXISTS desktop_index (
  id TEXT PRIMARY KEY,
  absolute_path TEXT NOT NULL UNIQUE,
  current_folder TEXT NOT NULL,
  original_folder TEXT NOT NULL,
  filename TEXT NOT NULL,
  extension TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  created_date INTEGER NOT NULL,
  modified_date INTEGER NOT NULL,
  last_seen_date INTEGER NOT NULL,
  quick_hash TEXT NOT NULL DEFAULT '',
  sha256_hash TEXT,
  file_category TEXT NOT NULL DEFAULT 'unknown',
  ai_category TEXT NOT NULL DEFAULT 'unknown',
  organization_status TEXT NOT NULL DEFAULT 'new',
  confidence REAL NOT NULL DEFAULT 0.0,
  last_recommendation TEXT,
  rule_used TEXT,
  folder_profile_used TEXT,
  manual_override INTEGER NOT NULL DEFAULT 0,
  ignored INTEGER NOT NULL DEFAULT 0,
  pinned INTEGER NOT NULL DEFAULT 0,
  favorite INTEGER NOT NULL DEFAULT 0,
  deleted INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  scan_version INTEGER NOT NULL DEFAULT 1,
  workspace_id TEXT NOT NULL DEFAULT 'default'
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  desktop_path TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_active_at INTEGER NOT NULL,
  total_files_organized INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#0078D4',
  icon TEXT NOT NULL DEFAULT 'monitor'
);

-- File change events
CREATE TABLE IF NOT EXISTS change_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  previous_path TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  detected_at INTEGER NOT NULL,
  workspace_id TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  metadata TEXT NOT NULL DEFAULT '{}'
);

-- Decision history (every recommendation outcome ever)
CREATE TABLE IF NOT EXISTS decision_history (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  recommended_folder_id TEXT NOT NULL,
  recommended_folder_name TEXT NOT NULL,
  actual_folder_id TEXT,
  actual_folder_name TEXT,
  outcome TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.0,
  rule_used TEXT,
  workspace_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  session_id TEXT,
  undone INTEGER NOT NULL DEFAULT 0
);

-- Learning events
CREATE TABLE IF NOT EXISTS learning_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  file_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  source_folder_id TEXT,
  target_folder_id TEXT,
  previous_confidence REAL NOT NULL DEFAULT 0.0,
  new_confidence REAL NOT NULL DEFAULT 0.0,
  workspace_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',
  reversed INTEGER NOT NULL DEFAULT 0
);

-- Managed rules with strength and decay
CREATE TABLE IF NOT EXISTS managed_rules (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  value TEXT NOT NULL,
  strength TEXT NOT NULL DEFAULT 'weak',
  confidence REAL NOT NULL DEFAULT 0.0,
  confirmation_count INTEGER NOT NULL DEFAULT 0,
  rejection_count INTEGER NOT NULL DEFAULT 0,
  last_used_at INTEGER,
  created_at INTEGER NOT NULL,
  decay_factor REAL NOT NULL DEFAULT 1.0,
  is_active INTEGER NOT NULL DEFAULT 1,
  workspace_id TEXT NOT NULL
);

-- Habit patterns
CREATE TABLE IF NOT EXISTS habit_patterns (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  folder_id TEXT NOT NULL,
  folder_name TEXT NOT NULL,
  file_category TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '[]',
  extensions TEXT NOT NULL DEFAULT '[]',
  confirmation_count INTEGER NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0.0,
  last_seen_at INTEGER NOT NULL,
  day_of_week_pattern TEXT NOT NULL DEFAULT '[]',
  hour_pattern TEXT NOT NULL DEFAULT '[]'
);

-- Folder candidates from discovery
CREATE TABLE IF NOT EXISTS folder_candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  dominant_categories TEXT NOT NULL DEFAULT '[]',
  suggested_purpose TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_name TEXT,
  workspace_id TEXT NOT NULL,
  discovered_at INTEGER NOT NULL
);

-- Folder profile version history
CREATE TABLE IF NOT EXISTS folder_profile_versions (
  id TEXT PRIMARY KEY,
  folder_id TEXT NOT NULL,
  keywords TEXT NOT NULL DEFAULT '[]',
  dominant_categories TEXT NOT NULL DEFAULT '[]',
  confidence REAL NOT NULL DEFAULT 0.0,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  captured_at INTEGER NOT NULL
);

-- Manual move detections
CREATE TABLE IF NOT EXISTS manual_move_detections (
  id TEXT PRIMARY KEY,
  files TEXT NOT NULL DEFAULT '[]',
  target_folder TEXT NOT NULL,
  detected_at INTEGER NOT NULL,
  user_response TEXT,
  workspace_id TEXT NOT NULL
);

-- Desktop statistics snapshots
CREATE TABLE IF NOT EXISTS desktop_stats_snapshots (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  calculated_at INTEGER NOT NULL,
  total_files INTEGER NOT NULL DEFAULT 0,
  new_files INTEGER NOT NULL DEFAULT 0,
  modified_files INTEGER NOT NULL DEFAULT 0,
  renamed_files INTEGER NOT NULL DEFAULT 0,
  already_organized INTEGER NOT NULL DEFAULT 0,
  needs_review INTEGER NOT NULL DEFAULT 0,
  duplicate_files INTEGER NOT NULL DEFAULT 0,
  large_files INTEGER NOT NULL DEFAULT 0,
  old_files INTEGER NOT NULL DEFAULT 0,
  estimated_review_minutes INTEGER NOT NULL DEFAULT 0,
  health_score REAL NOT NULL DEFAULT 0.0,
  previous_health_score REAL NOT NULL DEFAULT 0.0,
  health_delta REAL NOT NULL DEFAULT 0.0,
  ignored_files INTEGER NOT NULL DEFAULT 0,
  pinned_files INTEGER NOT NULL DEFAULT 0
);

-- Intelligence indexes
CREATE INDEX IF NOT EXISTS idx_index_workspace ON desktop_index(workspace_id);
CREATE INDEX IF NOT EXISTS idx_index_status ON desktop_index(organization_status);
CREATE INDEX IF NOT EXISTS idx_index_category ON desktop_index(ai_category);
CREATE INDEX IF NOT EXISTS idx_index_modified ON desktop_index(modified_date);
CREATE INDEX IF NOT EXISTS idx_change_events_workspace ON change_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_change_events_processed ON change_events(processed);
CREATE INDEX IF NOT EXISTS idx_decision_history_file ON decision_history(file_id);
CREATE INDEX IF NOT EXISTS idx_decision_history_workspace ON decision_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_workspace ON learning_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON learning_events(type);
CREATE INDEX IF NOT EXISTS idx_managed_rules_folder ON managed_rules(folder_id);
CREATE INDEX IF NOT EXISTS idx_managed_rules_workspace ON managed_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_habit_patterns_workspace ON habit_patterns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_stats_workspace ON desktop_stats_snapshots(workspace_id);
`
