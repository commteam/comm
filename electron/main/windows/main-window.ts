import { BrowserWindow, shell, screen, app } from 'electron'
import path from 'path'
import fs from 'fs'
import log from 'electron-log'
import { WINDOW_CONFIG } from '../../../src/shared/constants'

let mainWindow: BrowserWindow | null = null

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

function getStateFile(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function loadWindowState(): WindowState {
  const defaults: WindowState = {
    width: WINDOW_CONFIG.DEFAULT_WIDTH,
    height: WINDOW_CONFIG.DEFAULT_HEIGHT,
    isMaximized: false,
  }
  try {
    const raw = fs.readFileSync(getStateFile(), 'utf8')
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

function saveWindowState(win: BrowserWindow) {
  try {
    const isMaximized = win.isMaximized()
    const bounds = win.getNormalBounds()
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized,
    }
    fs.writeFileSync(getStateFile(), JSON.stringify(state))
  } catch { /* non-fatal */ }
}

function ensureVisibleOnDisplay(state: WindowState): WindowState {
  if (state.x === undefined || state.y === undefined) return state
  const displays = screen.getAllDisplays()
  const visible = displays.some(d => {
    const b = d.bounds
    return state.x! >= b.x && state.y! >= b.y && state.x! < b.x + b.width && state.y! < b.y + b.height
  })
  if (!visible) {
    const { x, y } = screen.getPrimaryDisplay().bounds
    return { ...state, x: x + 100, y: y + 100 }
  }
  return state
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createMainWindow(): BrowserWindow {
  log.info('Creating main window...')

  const savedState = ensureVisibleOnDisplay(loadWindowState())

  mainWindow = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: Math.max(savedState.width, WINDOW_CONFIG.MIN_WIDTH),
    height: Math.max(savedState.height, WINDOW_CONFIG.MIN_HEIGHT),
    minWidth: WINDOW_CONFIG.MIN_WIDTH,
    minHeight: WINDOW_CONFIG.MIN_HEIGHT,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#F9F9F9',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (savedState.isMaximized) {
    mainWindow.maximize()
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    log.info('Main window shown')
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const onMove = () => { if (mainWindow && !mainWindow.isMaximized()) saveWindowState(mainWindow) }
  mainWindow.on('resize', onMove)
  mainWindow.on('move', onMove)
  mainWindow.on('close', () => { if (mainWindow) saveWindowState(mainWindow) })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  return mainWindow
}
