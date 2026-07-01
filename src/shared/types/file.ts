export type FileExtension = string

export type FileCategory =
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'executable'
  | 'font'
  | 'data'
  | 'unknown'

export interface DesktopFile {
  id: string
  name: string
  extension: FileExtension
  category: FileCategory
  path: string
  size: number
  createdAt: Date
  modifiedAt: Date
  accessedAt: Date
  isHidden: boolean
  isSystem: boolean
  keywords: string[]
  hash?: string
}

export interface FileMetadata {
  id: string
  fileId: string
  key: string
  value: string
  createdAt: Date
}

export interface ScanResult {
  files: DesktopFile[]
  totalFiles: number
  totalSize: number
  newFiles: DesktopFile[]
  modifiedFiles: DesktopFile[]
  removedFileIds: string[]
  scanDuration: number
  scannedAt: Date
}
