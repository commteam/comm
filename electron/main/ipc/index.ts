import { registerScannerHandlers } from './scanner.handlers'
import { registerFolderHandlers } from './folder.handlers'
import { registerOrganizationHandlers } from './organization.handlers'
import { registerSettingsHandlers } from './settings.handlers'
import { registerTimelineHandlers } from './timeline.handlers'
import { registerUndoHandlers } from './undo.handlers'
import { registerAppHandlers } from './app.handlers'
import log from 'electron-log'

export function registerAllIPCHandlers(): void {
  log.info('Registering IPC handlers...')
  registerAppHandlers()
  registerScannerHandlers()
  registerFolderHandlers()
  registerOrganizationHandlers()
  registerSettingsHandlers()
  registerTimelineHandlers()
  registerUndoHandlers()
  log.info('All IPC handlers registered')
}
