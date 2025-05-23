import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { mkdir, writeFile, readFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

// Squirrel startup block removed for ES module compatibility

const createWindow = async () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  // Create data directory and test file
  const dataDir = join(app.getPath('userData'), 'data')
  const testFile = join(dataDir, 'test.json')

  try {
    // Create data directory if it doesn't exist
    await mkdir(dataDir, { recursive: true })

    // Create or read test.json
    try {
      await readFile(testFile)
    } catch {
      // File doesn't exist, create it
      const testData = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        content: `Test content ${Math.random()}`
      }
      await writeFile(testFile, JSON.stringify(testData, null, 2))
    }

    // Load the index.html of the app.
    if (process.env.VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      mainWindow.webContents.openDevTools()
    } else {
      await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  } catch (error) {
    console.error('Error during startup:', error)
  }
}

// IPC handlers
ipcMain.handle('read-test-file', async () => {
  try {
    const testFile = join(app.getPath('userData'), 'data', 'test.json')
    const content = await readFile(testFile, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading test file:', error)
    throw error
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}) 