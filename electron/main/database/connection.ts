import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { SCHEMA_SQL } from '../../../src/database/schema'
import { DB_FILE_NAME } from '../../../src/shared/constants'

let db: Database.Database | null = null

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(): Database.Database {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, DB_FILE_NAME)

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  log.info(`Initializing database at: ${dbPath}`)

  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? log.debug : undefined,
  })

  // Performance optimizations
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('foreign_keys = ON')
  db.pragma('cache_size = -32000') // 32MB cache
  db.pragma('temp_store = MEMORY')

  // Apply schema
  db.exec(SCHEMA_SQL)

  log.info('Database initialized successfully')
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    log.info('Database closed')
  }
}
