import { desktopIndexService } from './desktop-index.service'
import type { DesktopIndexEntry } from '../../../src/shared/types/intelligence'

export const ignoreManagerService = {
  ignore(fileId: string): void { desktopIndexService.setIgnored(fileId, true) },
  unignore(fileId: string): void { desktopIndexService.setIgnored(fileId, false) },
  getIgnored(workspaceId: string): DesktopIndexEntry[] { return desktopIndexService.findAll(workspaceId).filter(e => e.ignored) },
  isIgnored(fileId: string): boolean { return desktopIndexService.findByPath(fileId)?.ignored ?? false },
  clearAll(workspaceId: string): void {
    const ignored = desktopIndexService.findAll(workspaceId).filter(e => e.ignored)
    for (const entry of ignored) desktopIndexService.setIgnored(entry.id, false)
  },
}
