import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AppLayout } from './app/components/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { OnboardingPage } from './features/onboarding/OnboardingPage'
import { OrganizePage } from './features/organization/OrganizePage'
import { TimelinePage } from './features/timeline/TimelinePage'
import { RulesPage } from './features/rules/RulesPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { useSettingsStore } from './app/stores/settings.store'
import { useTheme } from './hooks/useTheme'
import { ROUTES } from './shared/constants'

export default function App() {
  const { settings, loadSettings } = useSettingsStore()
  const [initialized, setInitialized] = useState(false)
  useTheme(settings?.ui.theme)

  useEffect(() => {
    loadSettings().finally(() => setInitialized(true))
  }, [loadSettings])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-fluent-neutral-10 dark:bg-fluent-neutral-140">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-fluent-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-fluent-neutral-100 dark:text-fluent-neutral-60 text-sm">Starting DeskPilot AI...</p>
        </div>
      </div>
    )
  }

  const isOnboardingComplete = settings?.general.onboardingCompleted ?? false

  return (
    <HashRouter>
      <Routes>
        <Route
          path={ROUTES.ONBOARDING}
          element={<OnboardingPage />}
        />
        <Route element={<AppLayout />}>
          <Route
            index
            element={
              <Navigate
                to={isOnboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING}
                replace
              />
            }
          />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.ORGANIZE} element={<OrganizePage />} />
          <Route path={ROUTES.TIMELINE} element={<TimelinePage />} />
          <Route path={ROUTES.RULES} element={<RulesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
