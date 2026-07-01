import type { DesktopFile } from './file'
import type { FolderProfile } from './folder'

export type RecommendationStatus =
  | 'pending'
  | 'approved'
  | 'skipped'
  | 'auto_applied'
  | 'rejected'
  | 'undone'

export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high'

export interface Recommendation {
  id: string
  sessionId: string
  file: DesktopFile
  targetFolder: FolderProfile
  reasons: RecommendationReason[]
  confidence: number
  confidenceLevel: ConfidenceLevel
  status: RecommendationStatus
  isAutoApplicable: boolean
  createdAt: Date
  resolvedAt?: Date
}

export interface RecommendationReason {
  type: ReasonType
  description: string
  weight: number
}

export type ReasonType =
  | 'keyword_match'
  | 'extension_match'
  | 'category_match'
  | 'previous_decision'
  | 'pattern_match'
  | 'similar_files'
  | 'folder_profile'
  | 'user_correction'

export interface OrganizationSession {
  id: string
  mode: SessionMode
  status: SessionStatus
  totalFiles: number
  processedFiles: number
  approvedCount: number
  skippedCount: number
  autoAppliedCount: number
  startedAt: Date
  completedAt?: Date
}

export type SessionMode = 'simulation' | 'live'
export type SessionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled'

export interface MoveOperation {
  id: string
  sessionId: string
  recommendationId: string
  fileId: string
  sourcePath: string
  destinationPath: string
  status: MoveStatus
  executedAt?: Date
  undoneAt?: Date
  error?: string
}

export type MoveStatus = 'pending' | 'completed' | 'failed' | 'undone'
