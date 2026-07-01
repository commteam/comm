import { ipcMain } from 'electron'
import log from 'electron-log'
import { incrementalScannerService } from '../services/incremental-scanner.service'
import { desktopStatsService } from '../services/desktop-stats.service'
import { desktopIndexService } from '../services/desktop-index.service'
import { workspaceService } from '../services/workspace.service'
import { changeDetectorService } from '../services/change-detector.service'
import { fileWatcherService } from '../services/file-watcher.service'
import { decisionEngineService } from '../services/decision-engine.service'
import { recommendationExplainerService } from '../services/recommendation-explainer.service'
import { learningEngineService } from '../services/learning-engine.service'
import { ruleManagerService } from '../services/rule-manager.service'
import { ruleDecayService } from '../services/rule-decay.service'
import { decisionHistoryService } from '../services/decision-history.service'
import { habitLearningService } from '../services/habit-learning.service'
import { manualMoveDetectorService } from '../services/manual-move-detector.service'
import { simulationService } from '../services/simulation.service'
import { folderProfileUpdaterService } from '../services/folder-profile-updater.service'
import { settingsRepo } from '../database/repository'

function ok<T>(data: T) {
  return { success: true, data }
}
function err(message: string) {
  return { success: false, error: message }
}

export function registerIntelligenceHandlers(): void {
  // ─── Workspace ─────────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-workspaces', () => {
    try {
      return ok(workspaceService.getAll())
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:get-active-workspace', () => {
    try {
      return ok(workspaceService.getActive())
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Incremental Scan ──────────────────────────────────────────────────────

  ipcMain.handle('intelligence:scan', async (_event, payload: {
    desktopPath: string
    mode?: string
  }) => {
    try {
      const settings = settingsRepo.get<{ general: { desktopPath: string } }>('app_settings')
      const desktopPath = payload?.desktopPath ?? settings?.general?.desktopPath ?? ''

      const result = await incrementalScannerService.scan(desktopPath, (payload?.mode as any) ?? 'incremental', {
        onProgress: (p, msg) => {
          _event.sender.send('intelligence:scan-progress', { progress: p, message: msg })
        },
      })
      return ok(result)
    } catch (e) {
      log.error('Scan error:', e)
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:get-last-scan', () => {
    try {
      return ok({ lastScanAt: incrementalScannerService.getLastScanAt(), isFirstRun: incrementalScannerService.isFirstRun() })
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Desktop Statistics ────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-stats', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const stats = desktopStatsService.calculate(wsId)
      const breakdown = desktopStatsService.getHealthBreakdown(stats)
      const history = desktopStatsService.getHistoricalScores(wsId)
      return ok({ stats, breakdown, history })
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:get-latest-stats', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(desktopStatsService.getLatest(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Desktop Index ─────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-index', (_event, payload: { workspaceId?: string; status?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      if (payload?.status === 'needs_review') {
        return ok(desktopIndexService.findNeedsReview(wsId))
      }
      return ok(desktopIndexService.findAll(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:set-ignored', (_event, payload: { id: string; ignored: boolean }) => {
    try {
      desktopIndexService.setIgnored(payload.id, payload.ignored)
      learningEngineService.onIgnored(payload.id, '', workspaceService.getActiveId())
      return ok(true)
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:set-pinned', (_event, payload: { id: string; pinned: boolean }) => {
    try {
      desktopIndexService.setPinned(payload.id, payload.pinned)
      if (payload.pinned) {
        learningEngineService.onPinned(payload.id, '', workspaceService.getActiveId())
      }
      return ok(true)
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Decision Engine ───────────────────────────────────────────────────────

  ipcMain.handle('intelligence:evaluate-file', (_event, payload: { fileId: string; workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const entry = desktopIndexService.findByPath(payload.fileId) ?? null
      if (!entry) return ok(null)

      const scores = decisionEngineService.evaluate(entry, wsId)
      const best = scores[0]
      if (!best) return ok({ scores, explanation: null })

      const explanation = recommendationExplainerService.explain(entry, best.folderName, best.folderId, best.breakdown, wsId)
      return ok({ scores, explanation, best })
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Learning ─────────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:confirm', (_event, payload: {
    fileId: string
    filename: string
    targetFolderId: string
    sourceFolderId?: string
    previousConfidence: number
    workspaceId?: string
    sessionId?: string
  }) => {
    try {
      const wsId = payload.workspaceId ?? workspaceService.getActiveId()
      const event = learningEngineService.onConfirmed(
        payload.fileId, payload.filename, payload.targetFolderId,
        payload.sourceFolderId, payload.previousConfidence, wsId, payload.sessionId
      )
      desktopIndexService.updateStatus(payload.fileId, 'organized', payload.previousConfidence)
      return ok(event)
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:change-recommendation', (_event, payload: {
    fileId: string
    filename: string
    recommendedFolderId: string
    actualFolderId: string
    previousConfidence: number
    workspaceId?: string
  }) => {
    try {
      const wsId = payload.workspaceId ?? workspaceService.getActiveId()
      const event = learningEngineService.onChanged(
        payload.fileId, payload.filename, payload.recommendedFolderId,
        payload.actualFolderId, payload.previousConfidence, wsId
      )
      return ok(event)
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:skip', (_event, payload: {
    fileId: string
    filename: string
    recommendedFolderId: string
    previousConfidence: number
    workspaceId?: string
  }) => {
    try {
      const wsId = payload.workspaceId ?? workspaceService.getActiveId()
      const event = learningEngineService.onSkipped(
        payload.fileId, payload.filename, payload.recommendedFolderId,
        payload.previousConfidence, wsId
      )
      desktopIndexService.updateStatus(payload.fileId, 'skipped')
      return ok(event)
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Rules ─────────────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-rules', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(ruleManagerService.getAll(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:deactivate-rule', (_event, payload: { id: string }) => {
    try {
      ruleManagerService.deactivate(payload.id)
      return ok(true)
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:apply-rule-decay', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      ruleDecayService.applyDecay(wsId)
      return ok(ruleDecayService.getDecayReport(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Decision History ──────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-decision-history', (_event, payload: { workspaceId?: string; limit?: number }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok({
        history: decisionHistoryService.getAll(wsId, payload?.limit),
        stats: decisionHistoryService.getStats(wsId),
        recentByFolder: decisionHistoryService.getRecentByFolder(wsId),
      })
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Habits ────────────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-habits', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(habitLearningService.getAll(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Simulation ────────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:simulate', async (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const result = await simulationService.run(wsId)
      return ok(result)
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Change Events ─────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-change-events', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(changeDetectorService.getRecent(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── File Watcher ──────────────────────────────────────────────────────────

  ipcMain.handle('intelligence:start-watcher', (_event, payload: { desktopPath: string }) => {
    try {
      fileWatcherService.start(payload.desktopPath)
      return ok({ watching: true, path: payload.desktopPath })
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:stop-watcher', () => {
    try {
      fileWatcherService.stop()
      return ok({ watching: false })
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:watcher-status', () => {
    try {
      return ok({ running: fileWatcherService.isRunning(), path: fileWatcherService.getDesktopPath() })
    } catch (e) {
      return err(String(e))
    }
  })

  // ─── Manual Move Detection ─────────────────────────────────────────────────

  ipcMain.handle('intelligence:get-manual-move-detections', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(manualMoveDetectorService.getPending(wsId))
    } catch (e) {
      return err(String(e))
    }
  })

  ipcMain.handle('intelligence:respond-to-manual-move', (_event, payload: {
    detectionId: string
    response: string
    workspaceId?: string
  }) => {
    try {
      const wsId = payload.workspaceId ?? workspaceService.getActiveId()
      manualMoveDetectorService.recordResponse(payload.detectionId, payload.response as any, wsId)
      return ok(true)
    } catch (e) {
      return err(String(e))
    }
  })

  log.info('Intelligence IPC handlers registered')
}
