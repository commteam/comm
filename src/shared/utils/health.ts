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
