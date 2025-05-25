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

// =================== WEBXR FLAGS - FIXED VERSION ===================
console.log('[main] Setting up WebXR command line switches...')

// CRITICAL: Ces flags doivent être appelés AVANT app.whenReady()
// Grouper tous les features en un seul flag pour éviter les écrasements
app.commandLine.appendSwitch('enable-features', 'WebXR,WebXRGamepadSupport,WebXRIncubations,OpenXR')

// WebXR Core
app.commandLine.appendSwitch('enable-webxr')
app.commandLine.appendSwitch('enable-webxr-experimental-features')

// Hardware access pour VR headsets
app.commandLine.appendSwitch('enable-webxr-incubations')
app.commandLine.appendSwitch('enable-openxr')
app.commandLine.appendSwitch('force-webxr-runtime', 'openxr')

// WebGL & GPU
app.commandLine.appendSwitch('enable-webgl')
app.commandLine.appendSwitch('enable-webgl2-compute-context')
app.commandLine.appendSwitch('enable-unsafe-webgpu')

// Security & Hardware access
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor')
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('allow-running-insecure-content')

// IMPORTANT: Pour accès aux périphériques VR
app.commandLine.appendSwitch('enable-usb-user-gesture-requirement-disabled')
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')

console.log('[main] WebXR flags configured')
// ================================================================

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
      nodeIntegration: false,
      contextIsolation: true,
      // WebXR preferences
      experimentalFeatures: true,
      webgl: true,
      webSecurity: false,
      // Hardware access
      allowRunningInsecureContent: true,
      // Permissions
      nodeIntegrationInWorker: false,
    }
  })

  const ses = win.webContents.session;

  // Automatically grant permission for USB devices
  ses.setDevicePermissionHandler((details) => {
    console.log(details);
    return true; // Grant permission
  });

  // Handle USB device selection
  ses.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    // Select the first available device
    console.log(details.deviceList[0]);
  });
  
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // IMPORTANT: Gérer les permissions pour WebXR
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    console.log(`[main] Permission requested: ${permission}`)
    // Allow permissions related to WebXR/VR
    if ((permission as string) === 'camera' || (permission as string) === 'microphone' || (permission as string) === 'sensors') {
      callback(true)
    } else {
      callback(false)
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
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
  
  if (!existsSync(dataPath)) {
    await mkdir(dataPath, { recursive: true })
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