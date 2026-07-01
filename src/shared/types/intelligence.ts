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
