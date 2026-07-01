import type { AIProviderType } from './ai'

export interface AppSettings {
  general: GeneralSettings
  ai: AISettings
  scanner: ScannerSettings
  ui: UISettings
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface GeneralSettings {
  desktopPath: string
  launchAtStartup: boolean
  minimizeToTray: boolean
  language: string
  firstRunCompleted: boolean
  onboardingCompleted: boolean
}

export interface AISettings {
  providerType: AIProviderType
  confidenceThreshold: number
  autoApplyThreshold: number
  learningEnabled: boolean
  apiKey?: string
  apiEndpoint?: string
  modelName?: string
}

export interface ScannerSettings {
  scanInterval: number
  scanOnStartup: boolean
  ignoreHiddenFiles: boolean
  ignoreSystemFiles: boolean
  ignoredExtensions: string[]
  ignoredPaths: string[]
  maxFileSizeMb: number
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system'
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
  animationsEnabled: boolean
  compactMode: boolean
}

export interface NotificationSettings {
  enabled: boolean
  showOnOrganize: boolean
  showOnScan: boolean
  showOnError: boolean
  soundEnabled: boolean
}

export interface PrivacySettings {
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  sendUsageData: boolean
}
