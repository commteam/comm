import type { FileCategory } from './file'

export interface FolderProfile {
  id: string
  name: string
  path: string
  isProtected: boolean
  isUserCreated: boolean
  description: string
  dominantCategories: FileCategory[]
  keywords: string[]
  fileCount: number
  totalSize: number
  confidence: number
  lastUpdated: Date
  createdAt: Date
}

export interface FolderRule {
  id: string
  folderId: string
  ruleType: FolderRuleType
  value: string
  priority: number
  isActive: boolean
  confidence: number
  appliedCount: number
  createdAt: Date
  updatedAt: Date
}

export type FolderRuleType =
  | 'extension'
  | 'keyword'
  | 'category'
  | 'prefix'
  | 'suffix'
  | 'size_range'
  | 'date_range'
  | 'pattern'

export interface ProtectedFolder {
  id: string
  path: string
  reason: string
  addedAt: Date
}
