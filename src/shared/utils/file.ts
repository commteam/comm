import type { FileCategory } from '../types'
import { FILE_CATEGORIES } from '../constants'

export function getFileCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase()
  for (const [category, extensions] of Object.entries(FILE_CATEGORIES)) {
    if ((extensions as readonly string[]).includes(ext)) {
      return category as FileCategory
    }
  }
  return 'unknown'
}

export function extractKeywords(filename: string): string[] {
  const withoutExtension = filename.replace(/\.[^/.]+$/, '')
  const words = withoutExtension
    .replace(/[_\-\.]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.toLowerCase())

  return [...new Set(words)]
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function getFileExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/)
  return match ? match[0].toLowerCase() : ''
}

export function getFileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export function getParentPath(path: string): string {
  const parts = path.split(/[\\/]/)
  parts.pop()
  return parts.join('/')
}
