import { Settings, Palette, Bell, Shield, Database, Brain, Zap, Monitor } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper, PageHeader } from '../../app/components/layout/PageWrapper'
import { Card } from '../../app/components/ui/Card'
import { Switch } from '../../app/components/ui/Switch'
import { Button } from '../../app/components/ui/Button'
import { Select } from '../../app/components/ui/Select'
import { Badge } from '../../app/components/ui/Badge'
import { Separator } from '../../app/components/ui/Separator'
import { useSettingsStore } from '../../app/stores/settings.store'
import { useToast } from '../../hooks/useToast'
import { useElectron } from '../../hooks/useElectron'
import { cn } from '../../shared/utils/cn'

type Section = 'general' | 'appearance' | 'notifications' | 'ai' | 'protected' | 'database' | 'performance' | 'advanced'

const SECTIONS: { key: Section; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'general', label: 'General', icon: Settings, description: 'Desktop path and startup' },
  { key: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display' },
  { key: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts and sounds' },
  { key: 'ai', label: 'AI & Learning', icon: Brain, description: 'AI provider and thresholds' },
  { key: 'protected', label: 'Protected Folders', icon: Shield, description: 'Folders DeskPilot won\'t touch' },
  { key: 'database', label: 'Database', icon: Database, description: 'Storage and maintenance' },
  { key: 'performance', label: 'Performance', icon: Zap, description: 'Scan intervals' },
  { key: 'advanced', label: 'Advanced', icon: Monitor, description: 'Developer options' },
]

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('general')
  const { settings, updateSettings, resetSettings } = useSettingsStore()
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

  return (
    <PageWrapper maxWidth="xl">
      <PageHeader title="Settings" description="Customize how DeskPilot AI works" icon={<Settings size={18} />} />

      <div className="flex gap-5">
        {/* Section nav */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map(section => {
              const Icon = section.icon
              const isActive = activeSection === section.key
              return (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-fluent text-left transition-all',
                    isActive
                      ? 'bg-fluent-accent/10 dark:bg-fluent-accent/15 text-fluent-accent dark:text-fluent-accent-light'
                      : 'text-fluent-neutral-110 dark:text-fluent-neutral-60 hover:bg-fluent-neutral-20 dark:hover:bg-fluent-neutral-130',
                  )}
                >
                  <Icon size={15} strokeWidth={isActive ? 2 : 1.75} className="shrink-0" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeSection === 'general' && (
                <SettingsSection title="General">
                  <SettingsRow label="Desktop Path" description="The folder DeskPilot AI monitors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-fluent-neutral-80 dark:text-fluent-neutral-80 max-w-48 truncate">
                        {settings.general.desktopPath}
                      </span>
                      <Button variant="secondary" size="sm" onClick={handleSelectDesktopPath}>Change</Button>
                    </div>
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Launch at startup" description="Start DeskPilot AI when Windows starts">
                    <Switch checked={settings.general.launchAtStartup} onChange={v => updateSettings({ general: { ...settings.general, launchAtStartup: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Minimize to tray" description="Keep running in the system tray when closed">
                    <Switch checked={settings.general.minimizeToTray} onChange={v => updateSettings({ general: { ...settings.general, minimizeToTray: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Language" description="Application interface language">
                    <Select
                      value="en"
                      onChange={() => {}}
                      options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }, { value: 'fr', label: 'Français' }]}
                      className="w-32"
                    />
                  </SettingsRow>
                </SettingsSection>
              )}

              {activeSection === 'appearance' && (
                <SettingsSection title="Appearance">
                  <SettingsRow label="Theme" description="Light, dark, or follow system setting">
                    <div className="flex gap-1">
                      {(['light', 'system', 'dark'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => updateSettings({ ui: { ...settings.ui, theme: t } })}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-fluent capitalize font-medium transition-all',
                            settings.ui.theme === t
                              ? 'bg-fluent-accent text-white shadow-fluent-2'
                              : 'bg-fluent-neutral-20 dark:bg-fluent-neutral-120 text-fluent-neutral-100 dark:text-fluent-neutral-70 hover:bg-fluent-neutral-30',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Font size" description="Application text size">
                    <Select
                      value={settings.ui.fontSize}
                      onChange={v => updateSettings({ ui: { ...settings.ui, fontSize: v as 'small' | 'medium' | 'large' } })}
                      options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]}
                      className="w-28"
                    />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Animations" description="Smooth transitions and micro-animations">
                    <Switch checked={settings.ui.animationsEnabled} onChange={v => updateSettings({ ui: { ...settings.ui, animationsEnabled: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Compact mode" description="Reduce spacing for more content">
                    <Switch checked={settings.ui.compactMode} onChange={v => updateSettings({ ui: { ...settings.ui, compactMode: v } })} />
                  </SettingsRow>
                </SettingsSection>
              )}

              {activeSection === 'notifications' && (
                <SettingsSection title="Notifications">
                  <SettingsRow label="Enable notifications" description="Show system notifications">
                    <Switch checked={settings.notifications.enabled} onChange={v => updateSettings({ notifications: { ...settings.notifications, enabled: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="On organize" description="Notify when files are moved">
                    <Switch checked={settings.notifications.showOnOrganize} onChange={v => updateSettings({ notifications: { ...settings.notifications, showOnOrganize: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="On scan" description="Notify when scans complete">
                    <Switch checked={settings.notifications.showOnScan} onChange={v => updateSettings({ notifications: { ...settings.notifications, showOnScan: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="On error" description="Notify when errors occur">
                    <Switch checked={settings.notifications.showOnError} onChange={v => updateSettings({ notifications: { ...settings.notifications, showOnError: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Notification sound" description="Play a sound for notifications">
                    <Switch checked={settings.notifications.soundEnabled} onChange={v => updateSettings({ notifications: { ...settings.notifications, soundEnabled: v } })} />
                  </SettingsRow>
                </SettingsSection>
              )}

              {activeSection === 'ai' && (
                <SettingsSection title="AI & Learning">
                  <SettingsRow label="AI Provider" description="Backend used for recommendations">
                    <Badge variant="accent">Local AI</Badge>
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Learning enabled" description="Learn from your decisions to improve over time">
                    <Switch checked={settings.ai.learningEnabled} onChange={v => updateSettings({ ai: { ...settings.ai, learningEnabled: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow
                    label="Confidence threshold"
                    description={`Show recommendations above ${Math.round(settings.ai.confidenceThreshold * 100)}%`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min={0} max={100} step={5}
                        value={Math.round(settings.ai.confidenceThreshold * 100)}
                        onChange={e => updateSettings({ ai: { ...settings.ai, confidenceThreshold: parseInt(e.target.value) / 100 } })}
                        className="w-24 accent-fluent-accent"
                      />
                      <span className="text-sm font-bold text-fluent-accent w-10">{Math.round(settings.ai.confidenceThreshold * 100)}%</span>
                    </div>
                  </SettingsRow>
                  <Separator />
                  <SettingsRow
                    label="Auto-apply threshold"
                    description={`Automatically move files above ${Math.round(settings.ai.autoApplyThreshold * 100)}%`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min={50} max={100} step={5}
                        value={Math.round(settings.ai.autoApplyThreshold * 100)}
                        onChange={e => updateSettings({ ai: { ...settings.ai, autoApplyThreshold: parseInt(e.target.value) / 100 } })}
                        className="w-24 accent-fluent-accent"
                      />
                      <span className="text-sm font-bold text-fluent-accent w-10">{Math.round(settings.ai.autoApplyThreshold * 100)}%</span>
                    </div>
                  </SettingsRow>
                </SettingsSection>
              )}

              {activeSection === 'protected' && (
                <SettingsSection title="Protected Folders">
                  <p className="text-sm text-fluent-neutral-80 dark:text-fluent-neutral-80 mb-4">
                    DeskPilot AI will <strong>never</strong> move files into or out of these folders.
                  </p>
                  {['C:/Windows', 'C:/Program Files', 'Important'].map(path => (
                    <div key={path} className="flex items-center gap-3 py-2 border-b border-fluent-neutral-30 dark:border-fluent-neutral-120 last:border-0">
                      <Shield size={14} className="text-red-500 shrink-0" />
                      <span className="text-sm font-mono flex-1 truncate">{path}</span>
                      <Button variant="ghost" size="xs" className="text-red-500 hover:text-red-600">Remove</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" icon={<Shield size={13} />} className="mt-3">
                    Add Protected Folder
                  </Button>
                </SettingsSection>
              )}

              {activeSection === 'database' && (
                <SettingsSection title="Database">
                  <SettingsRow label="Database location" description="Where DeskPilot AI stores its data">
                    <span className="text-xs font-mono text-fluent-neutral-80 dark:text-fluent-neutral-80">%AppData%/deskpilot.db</span>
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Database size" description="Current storage used">
                    <Badge variant="default">2.4 MB</Badge>
                  </SettingsRow>
                  <Separator />
                  <div className="flex flex-col gap-2 pt-2">
                    <Button variant="secondary" size="sm">Export Data</Button>
                    <Button variant="secondary" size="sm">Import Data</Button>
                    <Button variant="danger" size="sm" className="mt-2">Reset All Learning Data</Button>
                  </div>
                </SettingsSection>
              )}

              {activeSection === 'performance' && (
                <SettingsSection title="Performance">
                  <SettingsRow label="Scan on startup" description="Scan your desktop when the app launches">
                    <Switch checked={settings.scanner.scanOnStartup} onChange={v => updateSettings({ scanner: { ...settings.scanner, scanOnStartup: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Ignore hidden files" description="Skip files starting with a dot">
                    <Switch checked={settings.scanner.ignoreHiddenFiles} onChange={v => updateSettings({ scanner: { ...settings.scanner, ignoreHiddenFiles: v } })} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Max file size" description={`Skip files larger than ${settings.scanner.maxFileSizeMb} MB`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min={100} max={2000} step={100}
                        value={settings.scanner.maxFileSizeMb}
                        onChange={e => updateSettings({ scanner: { ...settings.scanner, maxFileSizeMb: parseInt(e.target.value) } })}
                        className="w-24 accent-fluent-accent"
                      />
                      <span className="text-sm font-bold text-fluent-accent w-16">{settings.scanner.maxFileSizeMb} MB</span>
                    </div>
                  </SettingsRow>
                </SettingsSection>
              )}

              {activeSection === 'advanced' && (
                <SettingsSection title="Advanced">
                  <SettingsRow label="Simulation mode" description="Always preview before moving (recommended)">
                    <Switch checked onChange={() => {}} />
                  </SettingsRow>
                  <Separator />
                  <SettingsRow label="Analytics" description="Help improve DeskPilot AI (no personal data)">
                    <Switch checked={settings.privacy.analyticsEnabled} onChange={v => updateSettings({ privacy: { ...settings.privacy, analyticsEnabled: v } })} />
                  </SettingsRow>
                  <Separator />
                  <div className="pt-4 border-t border-fluent-neutral-30 dark:border-fluent-neutral-120 mt-2">
                    <Button variant="secondary" size="sm" onClick={async () => { await resetSettings(); toast.info('Settings reset to defaults') }}>
                      Reset All Settings
                    </Button>
                  </div>
                </SettingsSection>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card padding="md">
      <h2 className="text-sm font-bold text-fluent-neutral-130 dark:text-fluent-neutral-20 mb-4">{title}</h2>
      <div className="space-y-0">{children}</div>
    </Card>
  )
}

function SettingsRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-fluent-neutral-130 dark:text-fluent-neutral-20">{label}</p>
        <p className="text-xs text-fluent-neutral-70 dark:text-fluent-neutral-90 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
