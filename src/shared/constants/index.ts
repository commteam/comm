export const APP_NAME = 'DeskPilot AI'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'Your Desktop. Always Organized.'

export const DB_VERSION = 1
export const DB_FILE_NAME = 'deskpilot.db'

export const CONFIDENCE_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.5,
  HIGH: 0.75,
  VERY_HIGH: 0.9,
  AUTO_APPLY: 0.95,
} as const

export const FILE_CATEGORIES = {
  document: ['.doc', '.docx', '.odt', '.rtf', '.txt', '.pages'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico', '.tiff', '.raw', '.heic'],
  video: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'],
  audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a', '.opus'],
  archive: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'],
  code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift'],
  spreadsheet: ['.xls', '.xlsx', '.csv', '.ods', '.numbers'],
  presentation: ['.ppt', '.pptx', '.odp', '.key'],
  pdf: ['.pdf'],
  executable: ['.exe', '.msi', '.bat', '.cmd', '.ps1', '.sh'],
  font: ['.ttf', '.otf', '.woff', '.woff2', '.eot'],
  data: ['.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.env', '.sql', '.db'],
} as const

export const SCAN_INTERVALS = {
  REAL_TIME: 0,
  EVERY_HOUR: 60 * 60 * 1000,
  EVERY_6_HOURS: 6 * 60 * 60 * 1000,
  EVERY_DAY: 24 * 60 * 60 * 1000,
} as const

export const MAX_FILE_SIZE_DEFAULT_MB = 500

export const DEFAULT_IGNORED_EXTENSIONS = [
  '.tmp', '.temp', '.bak', '.cache', '.lock',
]

export const DEFAULT_IGNORED_PATHS = [
  'System Volume Information',
  '$Recycle.Bin',
  'desktop.ini',
]

export const WINDOW_CONFIG = {
  MIN_WIDTH: 900,
  MIN_HEIGHT: 600,
  DEFAULT_WIDTH: 1280,
  DEFAULT_HEIGHT: 800,
} as const

export const ROUTES = {
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  ORGANIZE: '/organize',
  TIMELINE: '/timeline',
  RULES: '/rules',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const
