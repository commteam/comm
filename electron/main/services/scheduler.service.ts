import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { ScheduledTask, ScheduleType } from '../../../src/shared/types/intelligence'
import log from 'electron-log'

function deserialize(row: Record<string, unknown>): ScheduledTask {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    scheduleType: row.schedule_type as ScheduleType,
    cronExpression: row.cron_expression as string,
    lastRunAt: row.last_run_at ? new Date(row.last_run_at as number) : undefined,
    nextRunAt: row.next_run_at ? new Date(row.next_run_at as number) : undefined,
    enabled: Boolean(row.enabled),
    taskType: row.task_type as ScheduledTask['taskType'],
    createdAt: new Date(row.created_at as number),
  }
}

function computeNext(scheduleType: ScheduleType): number | null {
  const now = Date.now()
  switch (scheduleType) {
    case 'daily': return now + 24 * 60 * 60 * 1000
    case 'weekly': return now + 7 * 24 * 60 * 60 * 1000
    case 'monthly': return now + 30 * 24 * 60 * 60 * 1000
    default: return null
  }
}

export const schedulerService = {
  create(workspaceId: string, scheduleType: ScheduleType, taskType: ScheduledTask['taskType']): ScheduledTask {
    const id = generateId()
    const nextRunAt = computeNext(scheduleType)
    getDatabase().prepare(`
      INSERT INTO scheduled_tasks (id, workspace_id, schedule_type, cron_expression, next_run_at, enabled, task_type, created_at)
      VALUES (@id, @workspaceId, @scheduleType, '', @nextRunAt, 1, @taskType, @createdAt)
    `).run({ id, workspaceId, scheduleType, nextRunAt, taskType, createdAt: Date.now() })
    log.info(`Scheduled task created: ${taskType} ${scheduleType}`)
    return this.get(id)!
  },
  get(id: string): ScheduledTask | null {
    const row = getDatabase().prepare('SELECT * FROM scheduled_tasks WHERE id = ?').get(id) as Record<string, unknown> | undefined
    return row ? deserialize(row) : null
  },
  getAll(workspaceId: string): ScheduledTask[] {
    return (getDatabase().prepare('SELECT * FROM scheduled_tasks WHERE workspace_id = ? ORDER BY created_at DESC').all(workspaceId) as Record<string, unknown>[]).map(deserialize)
  },
  setEnabled(id: string, enabled: boolean): void {
    getDatabase().prepare('UPDATE scheduled_tasks SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id)
  },
  delete(id: string): void {
    getDatabase().prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id)
  },
  markRan(id: string): void {
    const task = this.get(id)
    if (!task) return
    getDatabase().prepare('UPDATE scheduled_tasks SET last_run_at = ?, next_run_at = ? WHERE id = ?')
      .run(Date.now(), computeNext(task.scheduleType), id)
  },
  getDue(): ScheduledTask[] {
    return (getDatabase().prepare('SELECT * FROM scheduled_tasks WHERE enabled = 1 AND next_run_at IS NOT NULL AND next_run_at <= ?').all(Date.now()) as Record<string, unknown>[]).map(deserialize)
  },
}
