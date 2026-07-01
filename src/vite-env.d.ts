/// <reference types="vite/client" />
/// <reference types="vite-plugin-electron-renderer/electron-env" />

import type { ElectronAPI } from '../electron/preload'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
