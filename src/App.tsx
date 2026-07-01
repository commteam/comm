import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppLayout } from './app/components/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { ScanPage } from './features/scanner/ScanPage'
import { OrganizePage } from './features/organization/OrganizePage'
import { TimelinePage } from './features/timeline/TimelinePage'
import { ActivityPage } from './features/activity/ActivityPage'
import { AnalyticsPage } from './features/analytics/AnalyticsPage'
import { RulesPage } from './features/rules/RulesPage'
import { FolderProfilesPage } from './features/folder-profiles/FolderProfilesPage'
import { DownloadsPage } from './features/downloads/DownloadsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { HelpPage } from './features/help/HelpPage'
import { AboutPage } from './features/about/AboutPage'
import { useSettingsStore } from './app/stores/settings.store'
import { useTheme } from './hooks/useTheme'
import { ROUTES } from './shared/constants'
import { motion } from 'framer-motion'

export default function App() {
  const { settings, loadSettings } = useSettingsStore()
  const [initialized, setInitialized] = useState(false)
  useTheme(settings?.ui.theme)

  useEffect(() => {
    loadSettings().finally(() => setInitialized(true))
  }, [loadSettings])

  if (!initialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-fluent-neutral-10 dark:bg-fluent-neutral-140">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-fluent-accent flex items-center justify-center shadow-fluent-16">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="2" fill="white" />
              <rect x="14" y="2" width="8" height="8" rx="2" fill="white" opacity="0.7" />
              <rect x="2" y="14" width="8" height="8" rx="2" fill="white" opacity="0.7" />
              <rect x="14" y="14" width="8" height="8" rx="2" fill="white" opacity="0.4" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-fluent-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80">Starting DeskPilot AI…</p>
        </motion.div>
      </div>
    )
  }

  const isOnboardingComplete = settings?.general.onboardingCompleted ?? false

  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={isOnboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.SCAN} element={<ScanPage />} />
          <Route path={ROUTES.ORGANIZE} element={<OrganizePage />} />
          <Route path={ROUTES.TIMELINE} element={<TimelinePage />} />
          <Route path={ROUTES.ACTIVITY} element={<ActivityPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.RULES} element={<RulesPage />} />
          <Route path={ROUTES.FOLDER_PROFILES} element={<FolderProfilesPage />} />
          <Route path={ROUTES.DOWNLOADS} element={<DownloadsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.HELP} element={<HelpPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
