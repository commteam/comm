import { ipcMain, dialog } from 'electron'
import log from 'electron-log'
import { workspaceService } from '../services/workspace.service'
import { organizationEngineService } from '../services/organization-engine.service'
import { previewGeneratorService } from '../services/preview-generator.service'
import { undoSnapshotService } from '../services/undo-snapshot.service'
import { sessionReportService } from '../services/session-report.service'
import { archiveAdvisorService } from '../services/archive-advisor.service'
import { downloadsAnalyzerService } from '../services/downloads-analyzer.service'
import { duplicateDetectionService } from '../services/duplicate-detection.service'
import { largeFileAnalyzerService } from '../services/large-file-analyzer.service'
import { protectedFolderManagerService } from '../services/protected-folder-manager.service'
import { pinnedFileManagerService } from '../services/pinned-file-manager.service'
import { ignoreManagerService } from '../services/ignore-manager.service'
import { backgroundMonitorService } from '../services/background-monitor.service'
import { schedulerService } from '../services/scheduler.service'
import { desktopHealthEngineService } from '../services/desktop-health-engine.service'
import { recoveryManagerService } from '../services/recovery-manager.service'
import { exportImportService } from '../services/export-import.service'
import { productivityInsightsService } from '../services/productivity-insights.service'
import { desktopStatsService } from '../services/desktop-stats.service'
import { settingsRepo } from '../database/repository'
import type { RecommendationGroup } from '../../../src/shared/types/intelligence'

function ok<T>(data: T) {
  return { success: true, data }
}
function err(message: string) {
  return { success: false, error: message }
}

export function registerOrganizationEngineHandlers(): void {
  // ─── Organization Engine ────────────────────────────────────────────────────

  ipcMain.handle('org:start-session', async (_event, payload: { workspaceId?: string; mode?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const session = await organizationEngineService.startSession(wsId, (payload?.mode as any) ?? 'manual')
      return ok(session)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:generate-groups', (_event, payload: { sessionId: string; workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const groups = organizationEngineService.generateGroups(wsId, payload.sessionId)
      return ok(groups)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:generate-preview', (_event, payload: { sessionId: string; groups: RecommendationGroup[]; workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const preview = previewGeneratorService.generate(payload.sessionId, wsId, payload.groups)
      return ok(preview)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:execute', async (_event, payload: {
    sessionId: string
    approvedGroups: RecommendationGroup[]
    workspaceId?: string
  }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const result = await organizationEngineService.executeApproved(
        payload.sessionId, wsId, payload.approvedGroups,
        (done, total, filename) => {
          _event.sender.send('org:execute-progress', { done, total, filename })
        }
      )
      return ok(result)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:cancel-session', (_event, payload: { sessionId: string }) => {
    try {
      organizationEngineService.cancelSession(payload.sessionId)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:get-session', (_event, payload: { sessionId: string }) => {
    try {
      return ok(organizationEngineService.getSession(payload.sessionId))
    } catch (e) { return err(String(e)) }
  })

  // ─── Undo ───────────────────────────────────────────────────────────────────

  ipcMain.handle('org:get-snapshots', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(undoSnapshotService.getAll(wsId))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:undo-snapshot', async (_event, payload: { snapshotId: string }) => {
    try {
      const result = await undoSnapshotService.undo(payload.snapshotId)
      return ok(result)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:delete-snapshot', (_event, payload: { snapshotId: string }) => {
    try {
      undoSnapshotService.delete(payload.snapshotId)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  // ─── Reports ────────────────────────────────────────────────────────────────

  ipcMain.handle('org:get-report', (_event, payload: { reportId?: string; sessionId?: string }) => {
    try {
      const report = payload.reportId
        ? sessionReportService.get(payload.reportId)
        : payload.sessionId ? sessionReportService.getForSession(payload.sessionId) : null
      return ok(report)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:get-all-reports', (_event, payload: { workspaceId?: string; limit?: number }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(sessionReportService.getAll(wsId, payload?.limit))
    } catch (e) { return err(String(e)) }
  })

  // ─── Archive Advisor ────────────────────────────────────────────────────────

  ipcMain.handle('org:analyze-archive', (_event, payload: { workspaceId?: string; yearsThreshold?: number }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(archiveAdvisorService.analyze(wsId, payload?.yearsThreshold))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:get-archive-candidates', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(archiveAdvisorService.getPending(wsId))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:respond-archive', (_event, payload: { id: string; status: string }) => {
    try {
      archiveAdvisorService.respond(payload.id, payload.status as any)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  // ─── Downloads Analyzer ─────────────────────────────────────────────────────

  ipcMain.handle('org:analyze-downloads', (_event, payload: { downloadsPath?: string }) => {
    try {
      const settings = settingsRepo.get<{ general: { downloadsPath: string } }>('app_settings')
      const downloadsPath = payload?.downloadsPath ?? settings?.general?.downloadsPath ?? ''
      return ok(downloadsAnalyzerService.analyze(downloadsPath))
    } catch (e) { return err(String(e)) }
  })

  // ─── Duplicates ─────────────────────────────────────────────────────────────

  ipcMain.handle('org:find-duplicates', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(duplicateDetectionService.findDuplicates(wsId))
    } catch (e) { return err(String(e)) }
  })

  // ─── Large Files ────────────────────────────────────────────────────────────

  ipcMain.handle('org:get-large-files', (_event, payload: { workspaceId?: string; thresholdMb?: number }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const threshold = (payload?.thresholdMb ?? 100) * 1024 * 1024
      return ok(largeFileAnalyzerService.getLargeFiles(wsId, threshold))
    } catch (e) { return err(String(e)) }
  })

  // ─── Protected Folders ──────────────────────────────────────────────────────

  ipcMain.handle('org:get-protected-folders', () => {
    try { return ok(protectedFolderManagerService.getAll()) } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:protect-folder', (_event, payload: { folderId: string; reason?: string }) => {
    try {
      protectedFolderManagerService.protect(payload.folderId, payload.reason)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:unprotect-folder', (_event, payload: { folderId: string }) => {
    try {
      protectedFolderManagerService.unprotect(payload.folderId)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  // ─── Pinned Files ───────────────────────────────────────────────────────────

  ipcMain.handle('org:get-pinned-files', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(pinnedFileManagerService.getPinned(wsId))
    } catch (e) { return err(String(e)) }
  })

  // ─── Ignore List ────────────────────────────────────────────────────────────

  ipcMain.handle('org:get-ignored-files', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(ignoreManagerService.getIgnored(wsId))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:clear-ignore-list', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      ignoreManagerService.clearAll(wsId)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  // ─── Background Monitor ─────────────────────────────────────────────────────

  ipcMain.handle('org:start-monitor', (_event, payload: { desktopPath: string }) => {
    try {
      backgroundMonitorService.start(payload.desktopPath)
      return ok({ active: true })
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:stop-monitor', () => {
    try {
      backgroundMonitorService.stop()
      return ok({ active: false })
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:monitor-status', () => {
    try {
      return ok({ active: backgroundMonitorService.isActive(), count: backgroundMonitorService.getCount() })
    } catch (e) { return err(String(e)) }
  })

  // ─── Scheduler ──────────────────────────────────────────────────────────────

  ipcMain.handle('org:get-schedules', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(schedulerService.getAll(wsId))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:create-schedule', (_event, payload: { workspaceId?: string; scheduleType: string; taskType: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok(schedulerService.create(wsId, payload.scheduleType as any, payload.taskType as any))
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:set-schedule-enabled', (_event, payload: { id: string; enabled: boolean }) => {
    try {
      schedulerService.setEnabled(payload.id, payload.enabled)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:delete-schedule', (_event, payload: { id: string }) => {
    try {
      schedulerService.delete(payload.id)
      return ok(true)
    } catch (e) { return err(String(e)) }
  })

  // ─── Health Engine ──────────────────────────────────────────────────────────

  ipcMain.handle('org:get-health-suggestions', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const stats = desktopStatsService.getLatest(wsId) ?? desktopStatsService.calculate(wsId)
      const suggestions = desktopHealthEngineService.getSuggestions(stats)
      const trend = desktopHealthEngineService.getTrend(wsId)
      return ok({ suggestions, trend })
    } catch (e) { return err(String(e)) }
  })

  // ─── Recovery ───────────────────────────────────────────────────────────────

  ipcMain.handle('org:check-recovery', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      return ok({
        hasPending: recoveryManagerService.hasPending(wsId),
        state: recoveryManagerService.get(wsId),
      })
    } catch (e) { return err(String(e)) }
  })

  // ─── Export / Import ────────────────────────────────────────────────────────

  ipcMain.handle('org:export-workspace', async (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const { filePath } = await dialog.showSaveDialog({
        title: 'Export Workspace Settings',
        defaultPath: `deskpilot-workspace-${new Date().toISOString().split('T')[0]}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (!filePath) return ok({ cancelled: true })
      exportImportService.exportToFile(wsId, filePath)
      return ok({ exported: true, filePath })
    } catch (e) { return err(String(e)) }
  })

  ipcMain.handle('org:import-workspace', async (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      const { filePaths } = await dialog.showOpenDialog({
        title: 'Import Workspace Settings',
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile'],
      })
      if (!filePaths[0]) return ok({ cancelled: true })
      const result = exportImportService.importFromFile(filePaths[0], wsId)
      return ok(result)
    } catch (e) { return err(String(e)) }
  })

  // ─── Productivity Insights ──────────────────────────────────────────────────

  ipcMain.handle('org:get-insights', (_event, payload: { workspaceId?: string }) => {
    try {
      const wsId = payload?.workspaceId ?? workspaceService.getActiveId()
      productivityInsightsService.generate(wsId)
      return ok(productivityInsightsService.getAll(wsId))
    } catch (e) { return err(String(e)) }
  })

  log.info('Organization Engine IPC handlers registered')
}
