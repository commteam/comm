import fs from 'fs'
import path from 'path'
import log from 'electron-log'
import type { FolderProfile } from '../../../src/shared/types'
import { generateId } from '../../../src/shared/utils'
import { getFileCategory, extractKeywords } from '../../../src/shared/utils'
import { folderRepo } from '../database/repository'

export async function discoverFolders(desktopPath: string): Promise<FolderProfile[]> {
  log.info(`Discovering folders in: ${desktopPath}`)

  if (!fs.existsSync(desktopPath)) {
    throw new Error(`Desktop path does not exist: ${desktopPath}`)
  }

  const entries = fs.readdirSync(desktopPath, { withFileTypes: true })
  const directories = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'))

  const profiles: FolderProfile[] = []

  for (const dir of directories) {
    const folderPath = path.join(desktopPath, dir.name)
    try {
      const profile = await buildFolderProfile(folderPath, dir.name)
      profiles.push(profile)
      folderRepo.upsert(profile)
    } catch (err) {
      log.warn(`Failed to profile folder: ${folderPath}`, err)
    }
  }

  log.info(`Discovered ${profiles.length} folders`)
  return profiles
}

async function buildFolderProfile(folderPath: string, name: string): Promise<FolderProfile> {
  const existing = folderRepo.findAll().find(f => f.path === folderPath)
  const id = existing?.id ?? generateId()
  const now = new Date()

  // Analyze contents
  let fileCount = 0
  let totalSize = 0
  const categoryCounts: Record<string, number> = {}
  const allKeywords: string[] = []

  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
    for (const file of files) {
      if (!file.isFile()) continue
      const ext = path.extname(file.name).toLowerCase()
      const filePath = path.join(folderPath, file.name)
      const category = getFileCategory(ext)
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1
      allKeywords.push(...extractKeywords(file.name))
      fileCount++
      try {
        const stats = fs.statSync(filePath)
        totalSize += stats.size
      } catch { /* ignore */ }
    }
  } catch { /* folder may be inaccessible */ }

  const dominantCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat) as FolderProfile['dominantCategories']

  const uniqueKeywords = [...new Set([...extractKeywords(name), ...allKeywords])].slice(0, 20)

  const confidence = existing ? Math.min(existing.confidence + 0.05, 1.0) : 0.5

  return {
    id,
    name,
    path: folderPath,
    isProtected: false,
    isUserCreated: true,
    description: generateFolderDescription(name, dominantCategories),
    dominantCategories,
    keywords: uniqueKeywords,
    fileCount,
    totalSize,
    confidence,
    lastUpdated: now,
    createdAt: existing?.createdAt ?? now,
  }
}

function generateFolderDescription(name: string, categories: string[]): string {
  if (categories.length === 0) return `Folder: ${name}`
  const topCat = categories[0]
  return `${name} — primarily contains ${topCat} files`
}
