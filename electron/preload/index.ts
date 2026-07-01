import { contextBridge, ipcRenderer } from 'electron'

// Type-safe IPC bridge exposed to the renderer process
const electronAPI = {
  // App
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  quit: () => ipcRenderer.invoke('app:quit'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),

  // Scanner
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
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
