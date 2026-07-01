import type { TimelineEntry } from '../types'

export const mockTimelineEntries: TimelineEntry[] = [
  { id: 't1', type: 'file_moved', title: 'Proposal_Q2_2024.pdf moved', description: 'Desktop → Projects', filePath: 'Desktop/Proposal_Q2_2024.pdf', targetPath: 'Projects/Proposal_Q2_2024.pdf', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 't2', type: 'file_moved', title: 'Meeting_Notes_March.docx moved', description: 'Desktop → Documents', filePath: 'Desktop/Meeting_Notes_March.docx', targetPath: 'Documents/Meeting_Notes_March.docx', timestamp: new Date(Date.now() - 1000 * 60 * 6) },
  { id: 't3', type: 'file_moved', title: 'Screenshot_2024-03-14.png moved', description: 'Desktop → Screenshots', filePath: 'Desktop/Screenshot_2024-03-14.png', targetPath: 'Screenshots/', timestamp: new Date(Date.now() - 1000 * 60 * 6) },
  { id: 't4', type: 'file_skipped', title: 'FINAL_v8_REAL_LAST.pdf skipped', description: 'Low confidence — user skipped', filePath: 'Desktop/FINAL_v8_REAL_LAST.pdf', timestamp: new Date(Date.now() - 1000 * 60 * 7) },
  { id: 't5', type: 'session_completed', title: 'Organization session completed', description: '6 files moved · 1 skipped · 0 errors', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 't6', type: 'rule_created', title: 'New rule learned', description: '"invoice" → Finance folder', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
  { id: 't7', type: 'scan_completed', title: 'Desktop scan complete', description: 'Found 12 files · 183ms', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  { id: 't8', type: 'session_started', title: 'Organization session started', description: 'Simulation mode', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
  { id: 't9', type: 'file_moved', title: 'Budget_2024.xlsx moved', description: 'Desktop → Finance', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
  { id: 't10', type: 'file_moved', title: 'Contract_NDA_signed.pdf moved', description: 'Desktop → Important', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 't11', type: 'rule_created', title: 'New rule learned', description: '"proposal" → Projects folder', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) },
  { id: 't12', type: 'scan_completed', title: 'Desktop scan complete', description: 'Found 8 files · 142ms', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7) },
  { id: 't13', type: 'undo_performed', title: 'Move undone', description: 'Restored report_draft.docx to Desktop', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: 't14', type: 'session_completed', title: 'Organization session completed', description: '11 files moved · 2 skipped', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  { id: 't15', type: 'first_run', title: 'DeskPilot AI installed', description: 'Welcome! First scan complete.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) },
]
