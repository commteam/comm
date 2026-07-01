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
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
