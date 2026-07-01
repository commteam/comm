import { getDatabase } from '../database/connection'
import { generateId } from '../../../src/shared/utils'
import type { ProductivityInsight } from '../../../src/shared/types/intelligence'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function deserialize(row: Record<string, unknown>): ProductivityInsight {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    insightType: row.insight_type as string,
    title: row.title as string,
    description: row.description as string,
    value: row.value as number,
    trend: row.trend as ProductivityInsight['trend'],
    generatedAt: new Date(row.generated_at as number),
  }
}

export const productivityInsightsService = {
  generate(workspaceId: string): ProductivityInsight[] {
    const db = getDatabase()
    const insights: ProductivityInsight[] = []

    const dayRows = db.prepare(`
      SELECT CAST(strftime('%w', datetime(occurred_at/1000, 'unixepoch')) AS INTEGER) as dow, COUNT(*) as cnt
      FROM learning_events WHERE workspace_id = ? AND type = 'confirmed_recommendation'
      GROUP BY dow ORDER BY cnt DESC LIMIT 1
    `).get(workspaceId) as { dow: number; cnt: number } | undefined

    if (dayRows && dayRows.cnt > 0) {
      const insight: ProductivityInsight = {
        id: generateId(),
        workspaceId,
        insightType: 'peak_day',
        title: `Most organized on ${DAY_NAMES[dayRows.dow]}s`,
        description: `You confirm the most file recommendations on ${DAY_NAMES[dayRows.dow]}s.`,
        value: dayRows.cnt,
        trend: 'stable',
        generatedAt: new Date(),
      }
      db.prepare(`INSERT OR REPLACE INTO productivity_insights (id, workspace_id, insight_type, title, description, value, trend, generated_at) VALUES (@id, @workspaceId, @insightType, @title, @description, @value, @trend, @generatedAt)`)
        .run({ ...insight, generatedAt: insight.generatedAt.getTime() })
      insights.push(insight)
    }

    const folderRow = db.prepare(`
      SELECT recommended_folder_name, COUNT(*) as cnt FROM decision_history
      WHERE workspace_id = ? AND outcome = 'accepted'
      GROUP BY recommended_folder_name ORDER BY cnt DESC LIMIT 1
    `).get(workspaceId) as { recommended_folder_name: string; cnt: number } | undefined

    if (folderRow && folderRow.cnt > 2) {
      const insight: ProductivityInsight = {
        id: generateId(),
        workspaceId,
        insightType: 'top_folder',
        title: `${folderRow.recommended_folder_name} is your most used folder`,
        description: `${folderRow.cnt} files have been organized into ${folderRow.recommended_folder_name}.`,
        value: folderRow.cnt,
        trend: 'up',
        generatedAt: new Date(),
      }
      db.prepare(`INSERT OR REPLACE INTO productivity_insights (id, workspace_id, insight_type, title, description, value, trend, generated_at) VALUES (@id, @workspaceId, @insightType, @title, @description, @value, @trend, @generatedAt)`)
        .run({ ...insight, generatedAt: insight.generatedAt.getTime() })
      insights.push(insight)
    }

    return insights
  },

  getAll(workspaceId: string): ProductivityInsight[] {
    const rows = getDatabase().prepare('SELECT * FROM productivity_insights WHERE workspace_id = ? ORDER BY generated_at DESC LIMIT 20')
      .all(workspaceId) as Record<string, unknown>[]
    return rows.map(deserialize)
  },
}
