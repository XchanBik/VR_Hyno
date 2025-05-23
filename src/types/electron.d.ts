import type { Session } from './session'

export interface FileContent {
  id: string
  timestamp: string
  message: string
}

interface ElectronAPI {
  getFiles: () => Promise<{
    success: boolean
    files?: string[]
    error?: string
  }>
  getFileContent: (filename: string) => Promise<{
    success: boolean
    content?: FileContent
    error?: string
  }>
  getSessions: () => Promise<{
    success: boolean
    sessions?: Session[]
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} 