import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { join } from 'path'
import { readdir, mkdir, writeFile, readFile, stat } from 'fs/promises'
import { existsSync } from 'fs'

// --- IPC Handlers ---
import { registerSongIpcHandlers } from './ipc/song'
import { registerSessionIpcHandlers } from './ipc/session'
import { registerPlaylistIpcHandlers } from './ipc/playlist'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

console.log('[main] Electron main process starting...')

async function createWindow() {
  console.log('[main] Creating main window...')
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1600,
    height: 900,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Function to generate random string
function generateRandomString(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('')
}

// Function to ensure data directory exists and has content
async function ensureDataDirectory() {
  const dataPath = join(process.cwd(), 'data')
  
  // Create directory if it doesn't exist
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true })
  }

  // Check if directory is empty
  const files = await readdir(dataPath)
  if (files.length === 0) {
    // Create test.json with random content
    const testContent = {
      id: generateRandomString(),
      timestamp: new Date().toISOString(),
      message: `Test message ${generateRandomString(20)}`
    }
    await writeFile(
      join(dataPath, 'test.json'),
      JSON.stringify(testContent, null, 2)
    )
  }
}

// Function to ensure sessions directory exists
async function ensureSessionsDirectory() {
  const sessionsPath = join(process.cwd(), 'data', 'sessions')
  
  if (!existsSync(sessionsPath)) {
    await mkdir(sessionsPath, { recursive: true })
  }
}

// Function to read session info
async function readSessionInfo(sessionPath: string): Promise<any> {
  try {
    const infoPath = join(sessionPath, 'info.json')
    const content = await readFile(infoPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading session info for ${sessionPath}:`, error)
    return null
  }
}

console.log('[main] Registering Song IPC handlers...')
registerSongIpcHandlers(ipcMain)
console.log('[main] Registering Session IPC handlers...')
registerSessionIpcHandlers(ipcMain)
console.log('[main] Registering Playlist IPC handlers...')
registerPlaylistIpcHandlers(ipcMain)