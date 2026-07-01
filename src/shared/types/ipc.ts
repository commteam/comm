import type { ScanResult } from './file'
import type { OrganizationSession, Recommendation, MoveOperation } from './organization'
import type { FolderProfile, ProtectedFolder } from './folder'
import type { TimelineEntry } from './session'
import type { AppSettings } from './settings'
import type { UserDecision } from './ai'

export type IPCChannel =
  | 'app:ready'
  | 'app:quit'
  | 'app:minimize'
  | 'app:maximize'
  | 'app:get-version'
  | 'scanner:scan-desktop'
  | 'scanner:get-status'
  | 'scanner:stop'
  | 'folders:get-profiles'
  | 'folders:get-profile'
  | 'folders:update-profile'
  | 'folders:set-protected'
  | 'folders:remove-protected'
  | 'organization:start-session'
  | 'organization:get-recommendations'
  | 'organization:approve-recommendation'
  | 'organization:skip-recommendation'
  | 'organization:reject-recommendation'
  | 'organization:approve-all'
  | 'organization:execute-session'
  | 'organization:cancel-session'
  | 'undo:get-history'
  | 'undo:perform'
  | 'undo:undo-all-session'
  | 'timeline:get-entries'
  | 'settings:get'
  | 'settings:update'
  | 'settings:reset'
  | 'ai:record-decision'
  | 'ai:get-stats'
  | 'notification:get-all'
  | 'notification:mark-read'
  | 'notification:clear-all'
  | 'dialog:open-folder'
  | 'dialog:select-folder'

export interface IPCRequest<T = unknown> {
  channel: IPCChannel
  payload?: T
}

export interface IPCResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface IPCEventMap {
  'scanner:scan-desktop': { desktopPath?: string }
  'folders:get-profiles': void
  'organization:start-session': { mode: 'simulation' | 'live' }
  'organization:approve-recommendation': { recommendationId: string }
  'organization:skip-recommendation': { recommendationId: string }
  'organization:reject-recommendation': { recommendationId: string; reason?: string }
  'undo:perform': { operationId: string }
  'settings:update': Partial<AppSettings>
  'ai:record-decision': UserDecision
}

export interface IPCResponseMap {
  'scanner:scan-desktop': ScanResult
  'folders:get-profiles': FolderProfile[]
  'organization:start-session': OrganizationSession
  'organization:get-recommendations': Recommendation[]
  'undo:get-history': MoveOperation[]
  'timeline:get-entries': TimelineEntry[]
  'settings:get': AppSettings
  'folders:set-protected': ProtectedFolder
}
