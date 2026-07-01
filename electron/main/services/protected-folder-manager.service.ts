import { getDatabase } from '../database/connection'

export const protectedFolderManagerService = {
  isProtected(folderId: string): boolean {
    const row = getDatabase().prepare('SELECT protected FROM folder_profiles WHERE id = ?').get(folderId) as { protected: number } | undefined
    return Boolean(row?.protected)
  },
  protect(folderId: string, reason = ''): void {
    getDatabase().prepare('UPDATE folder_profiles SET protected = 1, protected_reason = ? WHERE id = ?').run(reason, folderId)
  },
  unprotect(folderId: string): void {
    getDatabase().prepare('UPDATE folder_profiles SET protected = 0, protected_reason = NULL WHERE id = ?').run(folderId)
  },
  getAll(): Array<{ id: string; name: string; path: string; reason: string }> {
    return getDatabase().prepare("SELECT id, name, path, protected_reason as reason FROM folder_profiles WHERE protected = 1").all() as any[]
  },
}
