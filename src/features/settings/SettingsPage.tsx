import { motion } from 'framer-motion'
import { useSettingsStore } from '../../app/stores/settings.store'
import { useToast } from '../../hooks/useToast'
import { useElectron } from '../../hooks/useElectron'

export function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore()
  const toast = useToast()
  const electron = useElectron()

  if (!settings) return null

  async function handleSelectDesktopPath() {
    const folder = await electron.selectFolder()
    if (folder) {
      await updateSettings({ general: { ...settings!.general, desktopPath: folder } })
      toast.success('Desktop path updated')
    }
  }

  async function handleThemeChange(theme: 'light' | 'dark' | 'system') {
    await updateSettings({ ui: { ...settings!.ui, theme } })
    toast.success('Theme updated')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="p-6 max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-fluent-neutral-140 dark:text-fluent-neutral-10">
          Settings
        </h1>
        <p className="text-fluent-neutral-100 dark:text-fluent-neutral-70 mt-1">
          Customize how DeskPilot AI works.
        </p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <SettingsSection title="General">
          <SettingsRow
            label="Desktop Path"
            description="The folder DeskPilot AI monitors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-fluent-neutral-90 dark:text-fluent-neutral-70 truncate max-w-40">
                {settings.general.desktopPath.split(/[\\/]/).pop()}
              </span>
              <button className="fluent-btn-secondary text-xs px-2 py-1" onClick={handleSelectDesktopPath}>
                Change
              </button>
            </div>
          </SettingsRow>
          <SettingsRow
            label="Launch at startup"
            description="Start DeskPilot AI when Windows starts"
          >
            <Toggle
              value={settings.general.launchAtStartup}
              onChange={v => updateSettings({ general: { ...settings.general, launchAtStartup: v } })}
            />
          </SettingsRow>
          <SettingsRow
            label="Minimize to tray"
            description="Keep running in the system tray when closed"
          >
            <Toggle
              value={settings.general.minimizeToTray}
              onChange={v => updateSettings({ general: { ...settings.general, minimizeToTray: v } })}
            />
          </SettingsRow>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsRow label="Theme" description="Light, dark, or follow system">
            <div className="flex gap-1">
              {(['light', 'system', 'dark'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-3 py-1 text-xs rounded-fluent capitalize transition-colors ${
                    settings.ui.theme === t
                      ? 'bg-fluent-accent text-white'
                      : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70 hover:bg-fluent-neutral-30 dark:hover:bg-fluent-neutral-110'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingsRow>
          <SettingsRow label="Animations" description="Smooth transitions throughout the UI">
            <Toggle
              value={settings.ui.animationsEnabled}
              onChange={v => updateSettings({ ui: { ...settings.ui, animationsEnabled: v } })}
            />
          </SettingsRow>
        </SettingsSection>

        {/* AI */}
        <SettingsSection title="AI &amp; Learning">
          <SettingsRow label="Learning enabled" description="DeskPilot AI learns from your decisions">
            <Toggle
              value={settings.ai.learningEnabled}
              onChange={v => updateSettings({ ai: { ...settings.ai, learningEnabled: v } })}
            />
          </SettingsRow>
          <SettingsRow
            label="Auto-apply threshold"
            description={`Files above ${Math.round(settings.ai.autoApplyThreshold * 100)}% confidence are applied automatically`}
          >
            <span className="text-sm font-semibold text-fluent-accent">
              {Math.round(settings.ai.autoApplyThreshold * 100)}%
            </span>
          </SettingsRow>
        </SettingsSection>
      </div>
    </motion.div>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-fluent-neutral-90 dark:text-fluent-neutral-70 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <div className="fluent-card divide-y divide-fluent-neutral-40/50 dark:divide-fluent-neutral-120/50">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20">{label}</p>
        <p className="text-xs text-fluent-neutral-80 dark:text-fluent-neutral-80 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
        value ? 'bg-fluent-accent' : 'bg-fluent-neutral-50 dark:bg-fluent-neutral-100'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          value ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
