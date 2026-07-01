export const mockDashboardStats = {
  healthScore: 84,
  healthLabel: 'Good' as const,
  healthTrend: +6,
  newFiles: 12,
  needsReview: 4,
  aiAccuracy: 97.2,
  learnedRules: 43,
  protectedFolders: 3,
  storageUsed: 2.4,
  storageTotalGb: 8.1,
  lastOrganized: new Date(Date.now() - 1000 * 60 * 60 * 2),
  totalFilesOrganized: 1248,
  sessionsCompleted: 18,
}

export const mockAIMessage = {
  filesFound: 12,
  autoOrganizable: 8,
  needsReview: 4,
  lastScan: new Date(Date.now() - 1000 * 60 * 30),
}

export type HealthLabel = 'Excellent' | 'Good' | 'Fair' | 'Poor'

export function getHealthColor(score: number): string {
  if (score >= 90) return '#22c55e'
  if (score >= 70) return '#3b82f6'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function getHealthLabel(score: number): HealthLabel {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Poor'
}
