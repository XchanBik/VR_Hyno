interface ElectronAPI {
  getFiles: () => Promise<{
    success: boolean
    files?: string[]
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
} 