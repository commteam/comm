import type { DesktopFile } from './file'
import type { FolderProfile } from './folder'
import type { Recommendation } from './organization'

export interface AIProvider {
  readonly name: string
  readonly version: string
  readonly isLocal: boolean
  classify(file: DesktopFile): Promise<AIClassification>
  recommend(file: DesktopFile, profiles: FolderProfile[]): Promise<Recommendation[]>
  learn(decision: UserDecision): Promise<void>
  isAvailable(): Promise<boolean>
}

export interface AIClassification {
  fileId: string
  category: string
  keywords: string[]
  confidence: number
  suggestedFolderIds: string[]
  metadata: Record<string, string>
}

export interface UserDecision {
  fileId: string
  action: 'approved' | 'skipped' | 'rejected' | 'corrected'
  targetFolderId?: string
  correctedFolderId?: string
  feedback?: string
  decidedAt: Date
}

export interface LearningEntry {
  id: string
  fileId: string
  decision: UserDecision
  confidence: number
  applied: boolean
  createdAt: Date
}

export type AIProviderType = 'local' | 'openai' | 'claude' | 'gemini' | 'ollama' | 'lmstudio'

export interface AIConfig {
  providerType: AIProviderType
  confidenceThreshold: number
  autoApplyThreshold: number
  maxRecommendationsPerSession: number
  learningEnabled: boolean
}
