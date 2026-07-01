// Type-safe hook to access the Electron API from renderer
export function useElectron() {
  if (typeof window === 'undefined' || !window.electronAPI) {
    throw new Error('electronAPI not available — are you running inside Electron?')
  }
  return window.electronAPI
}
