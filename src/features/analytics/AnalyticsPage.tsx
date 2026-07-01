import { BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card, CardHeader, CardTitle } from '../../app/components/ui/Card'
import { AnimatedCounter } from '../../app/components/ui/AnimatedCounter'
import { useDecisionHistory, useDesktopStats } from '../../hooks/useIntelligence'

const CHART_COLORS = ['#0078D4', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
const chartFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

export function AnalyticsPage() {
  const { stats, history } = useDesktopStats()
  const { history: decisionHistory, stats: decisionStats } = useDecisionHistory(undefined, 200)

  const healthTrend = history.map((h, i) => ({
    date: `Day ${history.length - i}`,
    score: Math.round(h.score),
  })).reverse()

  const acceptanceRate = decisionStats?.acceptanceRate ?? 0
  const accuracyTrend = healthTrend.map(h => ({
    date: h.date,
    accuracy: Math.round(acceptanceRate * 100),
  }))

  const folderCounts: Record<string, number> = {}
  for (const d of decisionHistory) {
    if (d.actualFolderName) {
      folderCounts[d.actualFolderName] = (folderCounts[d.actualFolderName] ?? 0) + 1
    }
  }
  const topFolders = Object.entries(folderCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], i) => ({ name, sizeMb: count, color: CHART_COLORS[i] }))

  const categoryData = (() => {
    const cats: Record<string, number> = {}
    for (const d of decisionHistory) {
      const cat = d.recommendedFolderName || 'Unknown'
      cats[cat] = (cats[cat] ?? 0) + 1
    }
    const total = Object.values(cats).reduce((a, b) => a + b, 0) || 1
    return Object.entries(cats).slice(0, 5).map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      color: CHART_COLORS[i],
    }))
  })()

  return (
    <PageWrapper maxWidth="xl">
      <PageHeader
        title="Analytics"
        description="Insights and trends from DeskPilot AI"
        icon={<BarChart3 size={18} />}
      />

      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Files Organized', value: decisionStats?.accepted ?? 0 },
          { label: 'Decisions Made', value: decisionStats?.total ?? 0 },
          { label: 'Files Skipped', value: decisionStats?.skipped ?? 0 },
          { label: 'Health Score', value: Math.round(stats?.healthScore ?? 0) },
        ].map(kpi => (
          <Card key={kpi.label} padding="md">
            <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
              <AnimatedCounter value={kpi.value} />
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div {...chartFade} transition={{ delay: 0.05 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Desktop Health Trend</CardTitle>
              <TrendingUp size={14} className="text-green-500" />
            </CardHeader>
            {healthTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={healthTrend}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0078D4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#0078D4" strokeWidth={2} fill="url(#healthGrad)" dot={{ r: 3, fill: '#0078D4' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Run more sessions to see your health trend" />
            )}
          </Card>
        </motion.div>

        <motion.div {...chartFade} transition={{ delay: 0.1 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>AI Acceptance Rate</CardTitle>
            </CardHeader>
            {accuracyTrend.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={accuracyTrend}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} fill="url(#accGrad)" dot={{ r: 3, fill: '#22c55e' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Make more decisions to see accuracy trend" />
            )}
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <motion.div {...chartFade} transition={{ delay: 0.15 }} className="col-span-2">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Most Used Folders</CardTitle>
            </CardHeader>
            {topFolders.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={topFolders} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sizeMb" fill="#0078D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Approve file moves to see folder usage" />
            )}
          </Card>
        </motion.div>

        <motion.div {...chartFade} transition={{ delay: 0.2 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Top Destinations</CardTitle>
            </CardHeader>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value">
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(val) => [`${val}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {categoryData.map(cat => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-fluent-neutral-80 dark:text-fluent-neutral-80 truncate">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart message="No data yet" />
            )}
          </Card>
        </motion.div>
      </div>

      {topFolders.length > 0 && (
        <motion.div {...chartFade} transition={{ delay: 0.25 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Top Folders by Activity</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {topFolders.map(folder => {
                const max = topFolders[0]?.sizeMb ?? 1
                const pct = (folder.sizeMb / max) * 100
                return (
                  <div key={folder.name} className="flex items-center gap-3">
                    <span className="text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50 w-24 shrink-0 truncate">{folder.name}</span>
                    <div className="flex-1 h-2 bg-fluent-neutral-30 dark:bg-fluent-neutral-120 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-fluent-accent"
                      />
                    </div>
                    <span className="text-xs text-fluent-neutral-80 w-12 text-right">{folder.sizeMb} files</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </PageWrapper>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-center">
      <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90">{message}</p>
    </div>
  )
}
