import type { DesktopFile } from '../types'

export const mockDesktopFiles: DesktopFile[] = [
  { id: '1', name: 'Proposal_Q2_2024.pdf', extension: '.pdf', category: 'pdf', path: 'C:/Users/User/Desktop/Proposal_Q2_2024.pdf', size: 2_400_000, createdAt: new Date('2024-03-01'), modifiedAt: new Date('2024-03-15'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['proposal', 'q2', '2024'] },
  { id: '2', name: 'Meeting_Notes_March.docx', extension: '.docx', category: 'document', path: 'C:/Users/User/Desktop/Meeting_Notes_March.docx', size: 45_000, createdAt: new Date('2024-03-10'), modifiedAt: new Date('2024-03-10'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['meeting', 'notes', 'march'] },
  { id: '3', name: 'Screenshot_2024-03-14.png', extension: '.png', category: 'image', path: 'C:/Users/User/Desktop/Screenshot_2024-03-14.png', size: 890_000, createdAt: new Date('2024-03-14'), modifiedAt: new Date('2024-03-14'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['screenshot'] },
  { id: '4', name: 'Invoice_CLIENT_003.xlsx', extension: '.xlsx', category: 'spreadsheet', path: 'C:/Users/User/Desktop/Invoice_CLIENT_003.xlsx', size: 128_000, createdAt: new Date('2024-03-12'), modifiedAt: new Date('2024-03-12'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['invoice', 'client'] },
  { id: '5', name: 'FINAL_v8_REAL_LAST.pdf', extension: '.pdf', category: 'pdf', path: 'C:/Users/User/Desktop/FINAL_v8_REAL_LAST.pdf', size: 5_100_000, createdAt: new Date('2024-02-20'), modifiedAt: new Date('2024-03-01'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['final'] },
  { id: '6', name: 'Presentation_Q1_Review.pptx', extension: '.pptx', category: 'presentation', path: 'C:/Users/User/Desktop/Presentation_Q1_Review.pptx', size: 12_000_000, createdAt: new Date('2024-01-15'), modifiedAt: new Date('2024-01-20'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['presentation', 'q1', 'review'] },
  { id: '7', name: 'node_setup_v20.exe', extension: '.exe', category: 'executable', path: 'C:/Users/User/Desktop/node_setup_v20.exe', size: 28_000_000, createdAt: new Date('2024-03-05'), modifiedAt: new Date('2024-03-05'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['node', 'setup'] },
  { id: '8', name: 'Budget_2024.xlsx', extension: '.xlsx', category: 'spreadsheet', path: 'C:/Users/User/Desktop/Budget_2024.xlsx', size: 234_000, createdAt: new Date('2024-01-01'), modifiedAt: new Date('2024-03-10'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['budget', '2024'] },
  { id: '9', name: 'photo_vacation_001.jpg', extension: '.jpg', category: 'image', path: 'C:/Users/User/Desktop/photo_vacation_001.jpg', size: 3_400_000, createdAt: new Date('2024-02-28'), modifiedAt: new Date('2024-02-28'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['photo', 'vacation'] },
  { id: '10', name: 'Contract_NDA_signed.pdf', extension: '.pdf', category: 'pdf', path: 'C:/Users/User/Desktop/Contract_NDA_signed.pdf', size: 890_000, createdAt: new Date('2024-03-08'), modifiedAt: new Date('2024-03-08'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['contract', 'nda', 'signed'] },
  { id: '11', name: 'archive_backup_2023.zip', extension: '.zip', category: 'archive', path: 'C:/Users/User/Desktop/archive_backup_2023.zip', size: 450_000_000, createdAt: new Date('2023-12-31'), modifiedAt: new Date('2023-12-31'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['archive', 'backup'] },
  { id: '12', name: 'Team_photo_2024.png', extension: '.png', category: 'image', path: 'C:/Users/User/Desktop/Team_photo_2024.png', size: 2_100_000, createdAt: new Date('2024-03-13'), modifiedAt: new Date('2024-03-13'), accessedAt: new Date(), isHidden: false, isSystem: false, keywords: ['team', 'photo'] },
]

export interface MockRecommendation {
  fileId: string
  fileName: string
  targetFolder: string
  targetPath: string
  reasons: string[]
  confidence: number
  category: string
  fileSize: number
  modifiedAt: Date
  isLowConfidence?: boolean
  isAutoApplicable?: boolean
}

export const mockRecommendations: MockRecommendation[] = [
  { fileId: '1', fileName: 'Proposal_Q2_2024.pdf', targetFolder: 'Projects', targetPath: 'C:/Users/User/Desktop/Projects', reasons: ['Contains keyword "proposal"', 'Similar to 18 previous files', 'PDF document'], confidence: 0.98, category: 'pdf', fileSize: 2_400_000, modifiedAt: new Date('2024-03-15'), isAutoApplicable: true },
  { fileId: '2', fileName: 'Meeting_Notes_March.docx', targetFolder: 'Documents', targetPath: 'C:/Users/User/Desktop/Documents', reasons: ['Contains keyword "meeting"', 'Word document', 'Previously moved similar files here'], confidence: 0.94, category: 'document', fileSize: 45_000, modifiedAt: new Date('2024-03-10'), isAutoApplicable: true },
  { fileId: '3', fileName: 'Screenshot_2024-03-14.png', targetFolder: 'Screenshots', targetPath: 'C:/Users/User/Desktop/Screenshots', reasons: ['Screenshot file', 'PNG image format', 'Date pattern detected'], confidence: 0.92, category: 'image', fileSize: 890_000, modifiedAt: new Date('2024-03-14'), isAutoApplicable: true },
  { fileId: '4', fileName: 'Invoice_CLIENT_003.xlsx', targetFolder: 'Finance', targetPath: 'C:/Users/User/Desktop/Finance', reasons: ['Contains keyword "invoice"', 'Spreadsheet document'], confidence: 0.89, category: 'spreadsheet', fileSize: 128_000, modifiedAt: new Date('2024-03-12'), isAutoApplicable: false },
  { fileId: '5', fileName: 'FINAL_v8_REAL_LAST.pdf', targetFolder: 'Documents', targetPath: 'C:/Users/User/Desktop/Documents', reasons: ['PDF document'], confidence: 0.42, category: 'pdf', fileSize: 5_100_000, modifiedAt: new Date('2024-03-01'), isLowConfidence: true },
  { fileId: '7', fileName: 'node_setup_v20.exe', targetFolder: 'Installers', targetPath: 'C:/Users/User/Desktop/Installers', reasons: ['Executable file', 'Setup installer pattern'], confidence: 0.96, category: 'executable', fileSize: 28_000_000, modifiedAt: new Date('2024-03-05'), isAutoApplicable: true },
  { fileId: '8', fileName: 'Budget_2024.xlsx', targetFolder: 'Finance', targetPath: 'C:/Users/User/Desktop/Finance', reasons: ['Contains keyword "budget"', 'Spreadsheet format', 'Year pattern detected'], confidence: 0.91, category: 'spreadsheet', fileSize: 234_000, modifiedAt: new Date('2024-03-10'), isAutoApplicable: true },
  { fileId: '11', fileName: 'archive_backup_2023.zip', targetFolder: 'Archives', targetPath: 'C:/Users/User/Desktop/Archives', reasons: ['Archive file type', 'Backup keyword detected'], confidence: 0.87, category: 'archive', fileSize: 450_000_000, modifiedAt: new Date('2023-12-31'), isAutoApplicable: false },
]
