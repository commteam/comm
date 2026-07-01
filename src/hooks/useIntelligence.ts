import { useState, useEffect, useCallback } from 'react'
import type {
  DesktopStatistics,
  HealthBreakdown,
  IntelligenceScanResult,
  DesktopIndexEntry,
  SimulationResult,
  DecisionHistoryEntry,
  HabitPattern,
  ManagedRule,
  Workspace,
} from '../shared/types/intelligence'

type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

async function call<T>(fn: () => Promise<IpcResult<T>>): Promise<T> {
  const res = await fn()
  if (!res.success) throw new Error(res.error)
  return res.data
}

const api = () => (window as any).electronAPI

// ─── Scan ──────────────────────────────────────────────────────────────────

export function useIntelligenceScan() {
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [result, setResult] = useState<IntelligenceScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scan = useCallback(async (desktopPath: string, mode = 'incremental') => {
    setScanning(true)
    setError(null)
    setProgress(0)
    const unsub = api().onScanProgressIntelligence(({ progress: p, message }: { progress: number; message: string }) => {
      setProgress(p)
      setProgressMessage(message)
    })
    try {
      const r = await call<IntelligenceScanResult>(() => api().intelligenceScan({ desktopPath, mode }))
      setResult(r)
    } catch (e) {
      setError(String(e))
    } finally {
      unsub()
      setScanning(false)
    }
  }, [])

  return { scan, scanning, progress, progressMessage, result, error }
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export function useDesktopStats(workspaceId?: string) {
  const [stats, setStats] = useState<DesktopStatistics | null>(null)
  const [breakdown, setBreakdown] = useState<HealthBreakdown | null>(null)
  const [history, setHistory] = useState<{ score: number; recordedAt: Date }[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await call<{ stats: DesktopStatistics; breakdown: HealthBreakdown; history: { score: number; recordedAt: Date }[] }>(
        () => api().getDesktopStats({ workspaceId })
      )
      setStats(res.stats)
      setBreakdown(res.breakdown)
      setHistory(res.history)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  return { stats, breakdown, history, loading, refresh }
}

// ─── Index ─────────────────────────────────────────────────────────────────

export function useDesktopIndex(workspaceId?: string, status?: string) {
  const [entries, setEntries] = useState<DesktopIndexEntry[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await call<DesktopIndexEntry[]>(() => api().getDesktopIndex({ workspaceId, status }))
      setEntries(data)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [workspaceId, status])

  useEffect(() => { refresh() }, [refresh])

  const setIgnored = useCallback(async (id: string, ignored: boolean) => {
    await call(() => api().setIgnored(id, ignored))
    await refresh()
  }, [refresh])

  const setPinned = useCallback(async (id: string, pinned: boolean) => {
    await call(() => api().setPinned(id, pinned))
    await refresh()
  }, [refresh])

  return { entries, loading, refresh, setIgnored, setPinned }
}

// ─── Workspace ─────────────────────────────────────────────────────────────

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    call<Workspace | null>(() => api().getActiveWorkspace())
      .then(setWorkspace)
      .catch(() => { })
  }, [])

  return { workspace }
}

// ─── Simulation ────────────────────────────────────────────────────────────

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [running, setRunning] = useState(false)

  const run = useCallback(async (workspaceId?: string) => {
    setRunning(true)
    try {
      const r = await call<SimulationResult>(() => api().runSimulation(workspaceId))
      setResult(r)
    } catch { /* silent */ } finally {
      setRunning(false)
    }
  }, [])

  return { result, running, run }
}

// ─── Decision History ──────────────────────────────────────────────────────

export function useDecisionHistory(workspaceId?: string, limit?: number) {
  const [history, setHistory] = useState<DecisionHistoryEntry[]>([])
  const [stats, setStats] = useState<{ total: number; accepted: number; rejected: number; modified: number; skipped: number; acceptanceRate: number } | null>(null)

  useEffect(() => {
    call<{ history: DecisionHistoryEntry[]; stats: typeof stats; recentByFolder: unknown }>(
      () => api().getDecisionHistory({ workspaceId, limit })
    ).then(res => {
      setHistory(res.history)
      setStats(res.stats)
    }).catch(() => { })
  }, [workspaceId, limit])

  return { history, stats }
}

// ─── Habits ────────────────────────────────────────────────────────────────

export function useHabits(workspaceId?: string) {
  const [habits, setHabits] = useState<HabitPattern[]>([])

  useEffect(() => {
    call<HabitPattern[]>(() => api().getHabits(workspaceId))
      .then(setHabits)
      .catch(() => { })
  }, [workspaceId])

  return { habits }
}

// ─── Rules ─────────────────────────────────────────────────────────────────

export function useRules(workspaceId?: string) {
  const [rules, setRules] = useState<ManagedRule[]>([])

  const refresh = useCallback(async () => {
    const data = await call<ManagedRule[]>(() => api().getRules(workspaceId))
    setRules(data)
  }, [workspaceId])

  useEffect(() => { refresh() }, [refresh])

  const deactivate = useCallback(async (id: string) => {
    await call(() => api().deactivateRule(id))
    await refresh()
  }, [refresh])

  return { rules, refresh, deactivate }
}
