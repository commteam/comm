import { ipcMain } from 'electron'
import log from 'electron-log'
import { fileRepo, folderRepo, orgRepo, timelineRepo } from '../database/repository'
import { getAIProvider } from '../services/ai/provider-factory'
import { generateId } from '../../../src/shared/utils'
import type { OrganizationSession, Recommendation } from '../../../src/shared/types'

const activeSessions = new Map<string, { session: OrganizationSession; recommendations: Recommendation[] }>()

export function registerOrganizationHandlers(): void {
  ipcMain.handle('organization:start-session', async (_event, payload: { mode: 'simulation' | 'live' }) => {
    try {
      const ai = getAIProvider()
      const files = fileRepo.findAll()
      const profiles = folderRepo.findAll()

      const session: OrganizationSession = {
        id: generateId(),
        mode: payload.mode,
        status: 'running',
        totalFiles: files.length,
        processedFiles: 0,
        approvedCount: 0,
        skippedCount: 0,
        autoAppliedCount: 0,
        startedAt: new Date(),
      }

      orgRepo.insertSession(session)

      // Generate recommendations for all files
      const allRecs: Recommendation[] = []
      for (const file of files) {
        const recs = await ai.recommend(file, profiles)
        for (const rec of recs) {
          rec.sessionId = session.id
          orgRepo.insertRecommendation(rec)
          allRecs.push(rec)
        }
      }

      session.totalFiles = allRecs.length
      orgRepo.updateSession(session)

      activeSessions.set(session.id, { session, recommendations: allRecs })

      timelineRepo.insert({
        id: generateId(),
        sessionId: session.id,
        type: 'session_started',
        title: 'Organization session started',
        description: `${payload.mode} mode — ${allRecs.length} recommendations generated`,
        timestamp: new Date(),
      })

      return { success: true, data: session }
    } catch (err) {
      log.error('Failed to start organization session:', err)
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('organization:get-recommendations', (_event, sessionId: string) => {
    try {
      const entry = activeSessions.get(sessionId)
      return { success: true, data: entry?.recommendations ?? [] }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('organization:approve-recommendation', async (_event, payload: { recommendationId: string; sessionId: string }) => {
    try {
      orgRepo.updateRecommendationStatus(payload.recommendationId, 'approved')
      const entry = activeSessions.get(payload.sessionId)
      if (entry) {
        const rec = entry.recommendations.find(r => r.id === payload.recommendationId)
        if (rec) rec.status = 'approved'
        entry.session.approvedCount++
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('organization:skip-recommendation', (_event, payload: { recommendationId: string; sessionId: string }) => {
    try {
      orgRepo.updateRecommendationStatus(payload.recommendationId, 'skipped')
      const entry = activeSessions.get(payload.sessionId)
      if (entry) {
        const rec = entry.recommendations.find(r => r.id === payload.recommendationId)
        if (rec) rec.status = 'skipped'
        entry.session.skippedCount++
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('organization:cancel-session', (_event, sessionId: string) => {
    try {
      const entry = activeSessions.get(sessionId)
      if (entry) {
        entry.session.status = 'cancelled'
        orgRepo.updateSession({ ...entry.session, completedAt: new Date() })
        activeSessions.delete(sessionId)
      }
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
