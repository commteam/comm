import { app } from 'electron'
import path from 'path'
import { settingsRepo } from '../database/repository'
import type { AppSettings } from '../../../src/shared/types'
import {
  DEFAULT_IGNORED_EXTENSIONS,
  DEFAULT_IGNORED_PATHS,
} from '../../../src/shared/constants'

const SETTINGS_KEY = 'app_settings'

function getDefaultDesktopPath(): string {
  return path.join(app.getPath('home'), 'Desktop')
}

export function getDefaultSettings(): AppSettings {
  return {
    general: {
      desktopPath: getDefaultDesktopPath(),
      launchAtStartup: false,
      minimizeToTray: true,
      language: 'en',
      firstRunCompleted: false,
      onboardingCompleted: false,
    },
    ai: {
      providerType: 'local',
      confidenceThreshold: 0.5,
      autoApplyThreshold: 0.95,
      learningEnabled: true,
    },
    scanner: {
      scanInterval: 3600000,
      scanOnStartup: true,
      ignoreHiddenFiles: true,
      ignoreSystemFiles: true,
      ignoredExtensions: DEFAULT_IGNORED_EXTENSIONS,
      ignoredPaths: DEFAULT_IGNORED_PATHS,
      maxFileSizeMb: 500,
    },
    ui: {
      theme: 'system',
      accentColor: '#0078D4',
      fontSize: 'medium',
      animationsEnabled: true,
      compactMode: false,
    },
    notifications: {
      enabled: true,
      showOnOrganize: true,
      showOnScan: false,
      showOnError: true,
      soundEnabled: false,
    },
    privacy: {
      analyticsEnabled: false,
      crashReportingEnabled: false,
      sendUsageData: false,
    },
  }
}

export function loadSettings(): AppSettings {
  const stored = settingsRepo.get<AppSettings>(SETTINGS_KEY)
  if (!stored) return getDefaultSettings()

  const defaults = getDefaultSettings()
  // Deep merge to handle new settings added in updates
  return deepMerge(defaults, stored) as AppSettings
}

export function saveSettings(settings: AppSettings): void {
  settingsRepo.set(SETTINGS_KEY, settings)
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings()
  const updated = deepMerge(current, partial) as AppSettings
  saveSettings(updated)
  return updated
}

export function resetSettings(): AppSettings {
  const defaults = getDefaultSettings()
  saveSettings(defaults)
  return defaults
}

function deepMerge(target: unknown, source: unknown): unknown {
  if (typeof source !== 'object' || source === null) return source ?? target
  if (typeof target !== 'object' || target === null) return source

  const result = { ...(target as Record<string, unknown>) }
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const srcVal = (source as Record<string, unknown>)[key]
    const tgtVal = (target as Record<string, unknown>)[key]
    result[key] = deepMerge(tgtVal, srcVal)
  }
  return result
}
