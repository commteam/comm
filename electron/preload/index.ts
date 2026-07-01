import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // App
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  quit: () => ipcRenderer.invoke('app:quit'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),

  // Scanner (legacy)
  scanDesktop: () => ipcRenderer.invoke('scanner:scan-desktop'),
  getScanStatus: () => ipcRenderer.invoke('scanner:get-status'),
  onScanProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on('scanner:progress', (_event, progress) => callback(progress))
    return () => ipcRenderer.removeAllListeners('scanner:progress')
  },

  // Folders
  getFolderProfiles: () => ipcRenderer.invoke('folders:get-profiles'),
  getFolderProfile: (id: string) => ipcRenderer.invoke('folders:get-profile', id),
  setFolderProtected: (folderId: string, reason: string) =>
    ipcRenderer.invoke('folders:set-protected', { folderId, reason }),
  removeFolderProtected: (folderId: string) =>
    ipcRenderer.invoke('folders:remove-protected', folderId),

  // Organization
  startSession: (mode: 'simulation' | 'live') =>
    ipcRenderer.invoke('organization:start-session', { mode }),
  getRecommendations: (sessionId: string) =>
    ipcRenderer.invoke('organization:get-recommendations', sessionId),
  approveRecommendation: (recommendationId: string, sessionId: string) =>
    ipcRenderer.invoke('organization:approve-recommendation', { recommendationId, sessionId }),
  skipRecommendation: (recommendationId: string, sessionId: string) =>
    ipcRenderer.invoke('organization:skip-recommendation', { recommendationId, sessionId }),
  cancelSession: (sessionId: string) =>
    ipcRenderer.invoke('organization:cancel-session', sessionId),

  // Undo
  getUndoHistory: (sessionId: string) => ipcRenderer.invoke('undo:get-history', sessionId),
  undoSession: (sessionId: string) => ipcRenderer.invoke('undo:undo-all-session', sessionId),

  // Timeline
  getTimelineEntries: (limit?: number) => ipcRenderer.invoke('timeline:get-entries', limit),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (partial: unknown) => ipcRenderer.invoke('settings:update', partial),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),

  // Intelligence — Workspace
  getWorkspaces: () => ipcRenderer.invoke('intelligence:get-workspaces'),
  getActiveWorkspace: () => ipcRenderer.invoke('intelligence:get-active-workspace'),

  // Intelligence — Scan
  intelligenceScan: (payload: { desktopPath: string; mode?: string }) =>
    ipcRenderer.invoke('intelligence:scan', payload),
  getLastScan: () => ipcRenderer.invoke('intelligence:get-last-scan'),
  onScanProgressIntelligence: (callback: (data: { progress: number; message: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { progress: number; message: string }) => callback(data)
    ipcRenderer.on('intelligence:scan-progress', listener)
    return () => ipcRenderer.removeListener('intelligence:scan-progress', listener)
  },

  // Intelligence — Stats & Index
  getDesktopStats: (payload?: { workspaceId?: string }) =>
    ipcRenderer.invoke('intelligence:get-stats', payload ?? {}),
  getLatestStats: (payload?: { workspaceId?: string }) =>
    ipcRenderer.invoke('intelligence:get-latest-stats', payload ?? {}),
  getDesktopIndex: (payload?: { workspaceId?: string; status?: string }) =>
    ipcRenderer.invoke('intelligence:get-index', payload ?? {}),
  setIgnored: (id: string, ignored: boolean) =>
    ipcRenderer.invoke('intelligence:set-ignored', { id, ignored }),
  setPinned: (id: string, pinned: boolean) =>
    ipcRenderer.invoke('intelligence:set-pinned', { id, pinned }),

  // Intelligence — Decision Engine
  evaluateFile: (fileId: string, workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:evaluate-file', { fileId, workspaceId }),

  // Intelligence — Learning
  confirmRecommendation: (payload: {
    fileId: string
    filename: string
    targetFolderId: string
    sourceFolderId?: string
    previousConfidence: number
    workspaceId?: string
    sessionId?: string
  }) => ipcRenderer.invoke('intelligence:confirm', payload),
  changeRecommendation: (payload: {
    fileId: string
    filename: string
    recommendedFolderId: string
    actualFolderId: string
    previousConfidence: number
    workspaceId?: string
  }) => ipcRenderer.invoke('intelligence:change-recommendation', payload),
  skipFile: (payload: {
    fileId: string
    filename: string
    recommendedFolderId: string
    previousConfidence: number
    workspaceId?: string
  }) => ipcRenderer.invoke('intelligence:skip', payload),

  // Intelligence — Rules
  getRules: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:get-rules', { workspaceId }),
  deactivateRule: (id: string) =>
    ipcRenderer.invoke('intelligence:deactivate-rule', { id }),
  applyRuleDecay: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:apply-rule-decay', { workspaceId }),

  // Intelligence — History & Habits
  getDecisionHistory: (payload?: { workspaceId?: string; limit?: number }) =>
    ipcRenderer.invoke('intelligence:get-decision-history', payload ?? {}),
  getHabits: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:get-habits', { workspaceId }),

  // Intelligence — Simulation
  runSimulation: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:simulate', { workspaceId }),

  // Intelligence — Change Events
  getChangeEvents: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:get-change-events', { workspaceId }),

  // Intelligence — File Watcher
  startWatcher: (desktopPath: string) =>
    ipcRenderer.invoke('intelligence:start-watcher', { desktopPath }),
  stopWatcher: () => ipcRenderer.invoke('intelligence:stop-watcher'),
  getWatcherStatus: () => ipcRenderer.invoke('intelligence:watcher-status'),
  onWatcherFileAdded: (callback: (data: { path: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { path: string }) => callback(data)
    ipcRenderer.on('watcher:file-added', listener)
    return () => ipcRenderer.removeListener('watcher:file-added', listener)
  },
  onWatcherFileChanged: (callback: (data: { path: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { path: string }) => callback(data)
    ipcRenderer.on('watcher:file-changed', listener)
    return () => ipcRenderer.removeListener('watcher:file-changed', listener)
  },
  onWatcherFileDeleted: (callback: (data: { path: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { path: string }) => callback(data)
    ipcRenderer.on('watcher:file-deleted', listener)
    return () => ipcRenderer.removeListener('watcher:file-deleted', listener)
  },

  // Intelligence — Manual Move Detection
  getManualMoveDetections: (workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:get-manual-move-detections', { workspaceId }),
  respondToManualMove: (detectionId: string, response: string, workspaceId?: string) =>
    ipcRenderer.invoke('intelligence:respond-to-manual-move', { detectionId, response, workspaceId }),

  // Organization Engine
  startOrgSession: (payload: { workspaceId?: string; mode?: string }) =>
    ipcRenderer.invoke('org:start-session', payload),
  generateOrgGroups: (payload: { sessionId: string; workspaceId?: string }) =>
    ipcRenderer.invoke('org:generate-groups', payload),
  generateOrgPreview: (payload: { sessionId: string; groups: unknown; workspaceId?: string }) =>
    ipcRenderer.invoke('org:generate-preview', payload),
  executeOrg: (payload: { sessionId: string; approvedGroups: unknown; workspaceId?: string }) =>
    ipcRenderer.invoke('org:execute', payload),
  cancelOrgSession: (sessionId: string) =>
    ipcRenderer.invoke('org:cancel-session', { sessionId }),
  getOrgSession: (sessionId: string) =>
    ipcRenderer.invoke('org:get-session', { sessionId }),
  onOrgExecuteProgress: (callback: (data: { done: number; total: number; filename: string }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { done: number; total: number; filename: string }) => callback(data)
    ipcRenderer.on('org:execute-progress', listener)
    return () => ipcRenderer.removeListener('org:execute-progress', listener)
  },

  // Undo Snapshots
  getOrgSnapshots: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-snapshots', { workspaceId }),
  undoOrgSnapshot: (payload: { snapshotId: string }) =>
    ipcRenderer.invoke('org:undo-snapshot', payload),
  deleteOrgSnapshot: (snapshotId: string) =>
    ipcRenderer.invoke('org:delete-snapshot', { snapshotId }),

  // Session Reports
  getOrgReport: (payload: { reportId?: string; sessionId?: string }) =>
    ipcRenderer.invoke('org:get-report', payload),
  getAllOrgReports: (payload?: { workspaceId?: string; limit?: number }) =>
    ipcRenderer.invoke('org:get-all-reports', payload ?? {}),

  // Archive
  analyzeArchive: (payload?: { workspaceId?: string; yearsThreshold?: number }) =>
    ipcRenderer.invoke('org:analyze-archive', payload ?? {}),
  getArchiveCandidates: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-archive-candidates', { workspaceId }),
  respondArchive: (id: string, status: string) =>
    ipcRenderer.invoke('org:respond-archive', { id, status }),

  // Downloads
  analyzeDownloads: (downloadsPath?: string) =>
    ipcRenderer.invoke('org:analyze-downloads', { downloadsPath }),

  // Duplicates
  findDuplicates: (workspaceId?: string) =>
    ipcRenderer.invoke('org:find-duplicates', { workspaceId }),

  // Large Files
  getLargeFiles: (payload?: { workspaceId?: string; thresholdMb?: number }) =>
    ipcRenderer.invoke('org:get-large-files', payload ?? {}),

  // Protected Folders
  getProtectedFolders: () =>
    ipcRenderer.invoke('org:get-protected-folders'),
  protectFolder: (folderId: string, reason?: string) =>
    ipcRenderer.invoke('org:protect-folder', { folderId, reason }),
  unprotectFolder: (folderId: string) =>
    ipcRenderer.invoke('org:unprotect-folder', { folderId }),

  // Pinned & Ignored
  getPinnedFiles: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-pinned-files', { workspaceId }),
  getIgnoredFiles: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-ignored-files', { workspaceId }),
  clearIgnoreList: (workspaceId?: string) =>
    ipcRenderer.invoke('org:clear-ignore-list', { workspaceId }),

  // Background Monitor
  startMonitor: (desktopPath: string) =>
    ipcRenderer.invoke('org:start-monitor', { desktopPath }),
  stopMonitor: () =>
    ipcRenderer.invoke('org:stop-monitor'),
  getMonitorStatus: () =>
    ipcRenderer.invoke('org:monitor-status'),
  onMonitorNewFiles: (callback: (data: { count: number }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { count: number }) => callback(data)
    ipcRenderer.on('monitor:new-files', listener)
    return () => ipcRenderer.removeListener('monitor:new-files', listener)
  },

  // Schedules
  getSchedules: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-schedules', { workspaceId }),
  createSchedule: (payload: { workspaceId?: string; scheduleType: string; taskType: string }) =>
    ipcRenderer.invoke('org:create-schedule', payload),
  setScheduleEnabled: (id: string, enabled: boolean) =>
    ipcRenderer.invoke('org:set-schedule-enabled', { id, enabled }),
  deleteSchedule: (id: string) =>
    ipcRenderer.invoke('org:delete-schedule', { id }),

  // Health Suggestions
  getHealthSuggestions: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-health-suggestions', { workspaceId }),

  // Recovery
  checkRecovery: (workspaceId?: string) =>
    ipcRenderer.invoke('org:check-recovery', { workspaceId }),

  // Export / Import
  exportWorkspace: (workspaceId?: string) =>
    ipcRenderer.invoke('org:export-workspace', { workspaceId }),
  importWorkspace: (workspaceId?: string) =>
    ipcRenderer.invoke('org:import-workspace', { workspaceId }),

  // Productivity Insights
  getInsights: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-insights', { workspaceId }),

  // Privacy Audit
  getPrivacyAudit: (workspaceId?: string) =>
    ipcRenderer.invoke('org:get-privacy-audit', { workspaceId }),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
