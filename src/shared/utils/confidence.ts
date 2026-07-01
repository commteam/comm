import type { ConfidenceLevel } from '../types'
import { CONFIDENCE_THRESHOLDS } from '../constants'

export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'very_high'
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high'
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}

export function getConfidenceLabel(score: number): string {
  const percentage = Math.round(score * 100)
  return `${percentage}%`
}

export function getConfidenceColor(level: ConfidenceLevel): string {
  const colors: Record<ConfidenceLevel, string> = {
    very_high: 'text-green-600',
    high: 'text-blue-600',
    medium: 'text-yellow-600',
    low: 'text-red-600',
  }
  return colors[level]
}

export function shouldAutoApply(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLDS.AUTO_APPLY
}
