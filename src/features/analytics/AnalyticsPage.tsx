import { BarChart3, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card, CardHeader, CardTitle } from '../../app/components/ui/Card'
import { AnimatedCounter } from '../../app/components/ui/AnimatedCounter'
import {
  mockHealthTrend, mockSessionHistory, mockCategoryBreakdown,
  mockFolderSizes, mockAIAccuracyTrend,
} from '../../shared/mock'

const chartFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

export function AnalyticsPage() {
  return (
    <PageWrapper maxWidth="xl">
      <PageHeader
        title="Analytics"
        description="Insights and trends from DeskPilot AI"
        icon={<BarChart3 size={18} />}
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Files Organized', value: 1248, suffix: '' },
          { label: 'Sessions Run', value: 18, suffix: '' },
          { label: 'Rules Learned', value: 43, suffix: '' },
          { label: 'Hours Saved', value: 12, suffix: 'h' },
        ].map(kpi => (
          <Card key={kpi.label} padding="md">
            <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-1">{kpi.label}</p>
            <p className="text-3xl font-bold text-fluent-neutral-140 dark:text-fluent-neutral-10">
              <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Health Trend */}
        <motion.div {...chartFade} transition={{ delay: 0.05 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Desktop Health Trend</CardTitle>
              <TrendingUp size={14} className="text-green-500" />
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={mockHealthTrend}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0078D4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0078D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#0078D4" strokeWidth={2} fill="url(#healthGrad)" dot={{ r: 3, fill: '#0078D4' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* AI Accuracy */}
        <motion.div {...chartFade} transition={{ delay: 0.1 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>AI Accuracy Over Time</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={mockAIAccuracyTrend}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} fill="url(#accGrad)" dot={{ r: 3, fill: '#22c55e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Sessions */}
        <motion.div {...chartFade} transition={{ delay: 0.15 }} className="col-span-2">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Files Organized per Session</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={mockSessionHistory} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }} />
                <Bar dataKey="files" fill="#0078D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Category pie */}
        <motion.div {...chartFade} transition={{ delay: 0.2 }}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>File Categories</CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={mockCategoryBreakdown}
                  cx="50%" cy="50%"
                  innerRadius={42} outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockCategoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(val) => [`${val}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {mockCategoryBreakdown.map(cat => (
                <div key={cat.name} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                  <span className="text-fluent-neutral-80 dark:text-fluent-neutral-80 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Folder sizes */}
      <motion.div {...chartFade} transition={{ delay: 0.25 }}>
        <Card padding="md">
          <CardHeader>
            <CardTitle>Largest Folders</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {mockFolderSizes
              .sort((a, b) => b.sizeMb - a.sizeMb)
              .map(folder => {
                const max = mockFolderSizes[0]?.sizeMb ?? 1
                const pct = (folder.sizeMb / max) * 100
                return (
                  <div key={folder.name} className="flex items-center gap-3">
                    <span className="text-sm text-fluent-neutral-110 dark:text-fluent-neutral-50 w-24 shrink-0">{folder.name}</span>
                    <div className="flex-1 h-2 bg-fluent-neutral-30 dark:bg-fluent-neutral-120 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-fluent-accent"
                      />
                    </div>
                    <span className="text-xs text-fluent-neutral-80 w-16 text-right">{folder.sizeMb >= 1000 ? `${(folder.sizeMb / 1024).toFixed(1)} GB` : `${folder.sizeMb} MB`}</span>
                  </div>
                )
              })}
          </div>
        </Card>
      </motion.div>
    </PageWrapper>
  )
}
