import { desktopIndexService } from './desktop-index.service'
import type { DesktopIndexEntry } from '../../../src/shared/types/intelligence'

export const pinnedFileManagerService = {
  pin(fileId: string): void { desktopIndexService.setPinned(fileId, true) },
  unpin(fileId: string): void { desktopIndexService.setPinned(fileId, false) },
  getPinned(workspaceId: string): DesktopIndexEntry[] { return desktopIndexService.findPinned(workspaceId) },
  isPinned(fileId: string): boolean { return desktopIndexService.findByPath(fileId)?.pinned ?? false },
}
