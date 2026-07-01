export interface AppSession {
  id: string
  startedAt: Date
  endedAt?: Date
  filesScanned: number
  filesOrganized: number
  recommendationsGenerated: number
  decisionsRecorded: number
}

export interface TimelineEntry {
  id: string
  sessionId?: string
  type: TimelineEntryType
  title: string
  description: string
  filePath?: string
  targetPath?: string
  metadata?: Record<string, string>
  timestamp: Date
}

export type TimelineEntryType =
  | 'file_moved'
  | 'file_skipped'
  | 'file_rejected'
  | 'folder_created'
  | 'rule_created'
  | 'session_started'
  | 'session_completed'
  | 'undo_performed'
  | 'scan_completed'
  | 'first_run'
