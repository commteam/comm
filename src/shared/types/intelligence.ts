// ─── Desktop Index ────────────────────────────────────────────────────────────

export type OrganizationStatus =
  | 'new'
  | 'organized'
  | 'skipped'
  | 'ignored'
  | 'pinned'
  | 'favorite'
  | 'needs_review'
  | 'auto_applied'
  | 'manual_override'

export interface DesktopIndexEntry {
  id: string
  absolutePath: string
  currentFolder: string
  originalFolder: string
  filename: string
  extension: string
  fileSize: number
  createdDate: Date
  modifiedDate: Date
  lastSeenDate: Date
  quickHash: string
  sha256Hash?: string
  fileCategory: string
  aiCategory: string
  organizationStatus: OrganizationStatus
  confidence: number
  lastRecommendation?: string
  ruleUsed?: string
  folderProfileUsed?: string
  manualOverride: boolean
  ignored: boolean
  pinned: boolean
  favorite: boolean
  deleted: boolean
  archived: boolean
  scanVersion: number
  workspaceId: string
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string
  name: string
  description: string
  desktopPath: string
  isActive: boolean
  createdAt: Date
  lastActiveAt: Date
  totalFilesOrganized: number
  totalSessions: number
  color: string
  icon: string
}

// ─── Change Events ────────────────────────────────────────────────────────────

export type ChangeEventType =
  | 'new_file'
  | 'modified_file'
  | 'renamed_file'
  | 'moved_file'
  | 'deleted_file'
  | 'duplicate_file'
  | 'large_file'
  | 'unknown_file'

export interface ChangeEvent {
  id: string
  type: ChangeEventType
  filePath: string
  previousPath?: string
  fileSize: number
  detectedAt: Date
  workspaceId: string
  processed: boolean
  metadata: Record<string, unknown>
}

// ─── Desktop Statistics ───────────────────────────────────────────────────────

export interface DesktopStatistics {
  workspaceId: string
  calculatedAt: Date
  totalFiles: number
  newFiles: number
  modifiedFiles: number
  renamedFiles: number
  alreadyOrganized: number
  needsReview: number
  duplicateFiles: number
  largeFiles: number
  oldFiles: number
  estimatedReviewMinutes: number
  healthScore: number
  previousHealthScore: number
  healthDelta: number
  ignoredFiles: number
  pinnedFiles: number
}

export interface HealthBreakdown {
  score: number
  label: string
  color: string
  factors: HealthFactor[]
}

export interface HealthFactor {
  name: string
  score: number
  weight: number
  description: string
}

// ─── Scan Modes ───────────────────────────────────────────────────────────────

export type ScanMode = 'quick' | 'incremental' | 'deep' | 'workspace' | 'simulation' | 'background'

export interface IntelligenceScanResult {
  scanId: string
  mode: ScanMode
  workspaceId: string
  startedAt: Date
  completedAt: Date
  durationMs: number
  filesScanned: number
  filesIndexed: number
  newFiles: number
  modifiedFiles: number
  deletedFiles: number
  renamedFiles: number
  changeEvents: ChangeEvent[]
  wasIncremental: boolean
}

// ─── Decision Engine ──────────────────────────────────────────────────────────

export interface DecisionFactors {
  filenameKeywords: number    // 0-1, weight 0.30
  folderProfileMatch: number  // 0-1, weight 0.25
  historicalDecisions: number // 0-1, weight 0.20
  recentBehavior: number      // 0-1, weight 0.10
  workspaceContext: number    // 0-1, weight 0.10
  fileExtension: number       // 0-1, weight 0.05
}

export interface DecisionFactorWeights {
  filenameKeywords: number
  folderProfileMatch: number
  historicalDecisions: number
  recentBehavior: number
  workspaceContext: number
  fileExtension: number
}

export const DEFAULT_FACTOR_WEIGHTS: DecisionFactorWeights = {
  filenameKeywords: 0.30,
  folderProfileMatch: 0.25,
  historicalDecisions: 0.20,
  recentBehavior: 0.10,
  workspaceContext: 0.10,
  fileExtension: 0.05,
}

export interface ConfidenceBreakdown {
  overall: number
  factors: {
    filenameKeywords: number
    folderProfileMatch: number
    historicalDecisions: number
    recentBehavior: number
    workspaceContext: number
    fileExtension: number
  }
  matchedKeywords: string[]
  matchedRules: string[]
  similarFileCount: number
  confirmationCount: number
}

// ─── Recommendation Explanation ───────────────────────────────────────────────

export interface ExplanationPoint {
  type: 'keyword' | 'extension' | 'profile' | 'history' | 'habit' | 'similarity' | 'rule'
  text: string
  weight: number
}

export interface RecommendationExplanation {
  fileId: string
  filename: string
  recommendedFolder: string
  confidenceBreakdown: ConfidenceBreakdown
  points: ExplanationPoint[]
  similarFiles: SimilarFile[]
  autoSelectSuggested: boolean
  whyThisFolder: string
}

export interface SimilarFile {
  filename: string
  folder: string
  confirmedAt?: Date
  confidence: number
}

// ─── Learning ────────────────────────────────────────────────────────────────

export type LearningEventType =
  | 'confirmed_recommendation'
  | 'changed_recommendation'
  | 'skipped_recommendation'
  | 'ignored_file'
  | 'pinned_file'
  | 'created_folder'
  | 'manual_file_move'
  | 'manual_folder_selection'
  | 'undo_performed'

export interface LearningEvent {
  id: string
  type: LearningEventType
  fileId: string
  filename: string
  sourceFolderId?: string
  targetFolderId?: string
  previousConfidence: number
  newConfidence: number
  workspaceId: string
  occurredAt: Date
  metadata: Record<string, unknown>
  reversed: boolean
}

// ─── Rule Management ──────────────────────────────────────────────────────────

export type RuleStrength = 'weak' | 'stable' | 'strong' | 'trusted'

export interface ManagedRule {
  id: string
  folderId: string
  folderName: string
  ruleType: 'keyword' | 'extension' | 'category' | 'pattern'
  value: string
  strength: RuleStrength
  confidence: number
  confirmationCount: number
  rejectionCount: number
  lastUsedAt?: Date
  createdAt: Date
  decayFactor: number
  isActive: boolean
  workspaceId: string
}

export const RULE_STRENGTH_THRESHOLDS = {
  weak: 3,
  stable: 10,
  strong: 25,
  trusted: 50,
} as const

// ─── Decision History ─────────────────────────────────────────────────────────

export type DecisionOutcome = 'accepted' | 'rejected' | 'modified' | 'ignored' | 'skipped'

export interface DecisionHistoryEntry {
  id: string
  fileId: string
  filename: string
  recommendedFolderId: string
  recommendedFolderName: string
  actualFolderId?: string
  actualFolderName?: string
  outcome: DecisionOutcome
  confidence: number
  ruleUsed?: string
  workspaceId: string
  timestamp: Date
  sessionId?: string
  undone: boolean
}

// ─── Habit Model ──────────────────────────────────────────────────────────────

export interface HabitPattern {
  id: string
  workspaceId: string
  folderId: string
  folderName: string
  fileCategory: string
  keywords: string[]
  extensions: string[]
  confirmationCount: number
  confidence: number
  lastSeenAt: Date
  dayOfWeekPattern?: number[] // 0=Sun…6=Sat
  hourPattern?: number[]      // 0-23
}

// ─── Folder Discovery ─────────────────────────────────────────────────────────

export type FolderCandidateStatus = 'pending' | 'confirmed' | 'skipped' | 'renamed'

export interface FolderCandidate {
  id: string
  name: string
  path: string
  fileCount: number
  dominantCategories: string[]
  suggestedPurpose: string
  status: FolderCandidateStatus
  confirmedName?: string
  workspaceId: string
  discoveredAt: Date
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationResult {
  sessionId: string
  before: SimulationState
  after: SimulationState
  changes: SimulationChange[]
  predictedHealthScore: number
  predictedTimeSavedMinutes: number
  totalFilesToMove: number
  autoApplicable: number
  requiresReview: number
}

export interface SimulationState {
  desktopFiles: number
  organizedFiles: number
  chaosScore: number
  categories: Record<string, number>
}

export interface SimulationChange {
  fileId: string
  filename: string
  fromPath: string
  toPath: string
  folderName: string
  confidence: number
  isAutoApplicable: boolean
}

// ─── Manual Move Detection ────────────────────────────────────────────────────

export type ManualMoveResponse = 'always_learn' | 'learn_once' | 'ignore' | 'never_ask'

export interface ManualMoveDetection {
  id: string
  files: Array<{ filename: string; fromPath: string; toPath: string }>
  targetFolder: string
  detectedAt: Date
  userResponse?: ManualMoveResponse
  workspaceId: string
}

// ─── Organization Engine ──────────────────────────────────────────────────────

export type OrgSessionStatus = 'pending' | 'analyzing' | 'reviewing' | 'previewing' | 'executing' | 'complete' | 'cancelled' | 'failed' | 'recovering'

export interface OrgSessionV2 {
  id: string
  workspaceId: string
  status: OrgSessionStatus
  mode: 'manual' | 'scheduled' | 'background'
  totalFiles: number
  approvedCount: number
  skippedCount: number
  failedCount: number
  executedCount: number
  startedAt: Date
  completedAt?: Date
  undoSnapshotId?: string
  reportId?: string
  recoveryData: Record<string, unknown>
}

export interface RecommendationGroup {
  id: string
  label: string
  fileCount: number
  targetFolderName: string
  targetFolderId: string
  targetFolderPath: string
  confidence: number
  reason: string
  items: GroupedFile[]
  expanded: boolean
  approved: boolean | null
}

export interface GroupedFile {
  fileId: string
  filename: string
  fromPath: string
  toPath: string
  confidence: number
  approved: boolean | null
}

export interface OrganizationPreview {
  sessionId: string
  groups: RecommendationGroup[]
  totalFiles: number
  estimatedDurationMs: number
  healthBefore: number
  healthAfter: number
  foldersUsed: number
}

export interface FileMoveRecord {
  id: string
  sessionId: string
  fileId: string
  filename: string
  fromPath: string
  toPath: string
  status: 'pending' | 'success' | 'failed' | 'skipped'
  error?: string
  executedAt?: Date
  workspaceId: string
}

export interface UndoSnapshot {
  id: string
  sessionId: string
  workspaceId: string
  createdAt: Date
  fileMoves: FileMoveRecord[]
  learningEventIds: string[]
  ruleStates: Array<{ ruleId: string; confidenceBefore: number; activeBefore: boolean }>
  folderProfileStates: Array<{ folderId: string; snapshotId: string }>
  deleted: boolean
  label: string
}

export interface SessionReport {
  id: string
  sessionId: string
  workspaceId: string
  filesOrganized: number
  filesSkipped: number
  filesFailed: number
  rulesLearned: number
  healthBefore: number
  healthAfter: number
  timeSavedMinutes: number
  durationMs: number
  createdAt: Date
  exported: boolean
}

// ─── Archive, Downloads, Duplicates ──────────────────────────────────────────

export interface ArchiveCandidate {
  id: string
  fileId: string
  filename: string
  absolutePath: string
  fileSize: number
  lastModified: Date
  reason: string
  suggestedArchivePath: string
  status: 'pending' | 'archived' | 'ignored' | 'never_ask'
  workspaceId: string
  detectedAt: Date
}

export interface DownloadsAnalysis {
  totalSize: number
  totalFiles: number
  oldInstallers: DownloadFile[]
  duplicates: DownloadFile[]
  tempFiles: DownloadFile[]
  compressed: DownloadFile[]
  unusedInstallers: DownloadFile[]
}

export interface DownloadFile {
  filename: string
  path: string
  size: number
  lastModified: Date
  category: 'installer' | 'duplicate' | 'temp' | 'compressed' | 'unknown'
  reason: string
}

export interface DuplicateGroup {
  hash: string
  size: number
  files: Array<{ filename: string; path: string; lastModified: Date; workspaceId: string }>
  keepIndex: number
  totalWasted: number
}

export interface LargeFile {
  fileId: string
  filename: string
  absolutePath: string
  fileSize: number
  lastModified: Date
  category: string
  recommendation: 'move' | 'archive' | 'ignore'
}

// ─── Scheduling & Insights ────────────────────────────────────────────────────

export type ScheduleType = 'manual' | 'daily' | 'weekly' | 'monthly' | 'startup'

export interface ScheduledTask {
  id: string
  workspaceId: string
  scheduleType: ScheduleType
  cronExpression: string
  lastRunAt?: Date
  nextRunAt?: Date
  enabled: boolean
  taskType: 'scan' | 'analysis' | 'archive_check' | 'downloads_check'
  createdAt: Date
}

export interface ProductivityInsight {
  id: string
  workspaceId: string
  insightType: string
  title: string
  description: string
  value: number
  trend: 'up' | 'down' | 'stable'
  generatedAt: Date
}

export interface RecoveryState {
  id: string
  workspaceId: string
  sessionId: string
  pendingMoves: FileMoveRecord[]
  undoSnapshotId?: string
  savedAt: Date
  recovered: boolean
}
