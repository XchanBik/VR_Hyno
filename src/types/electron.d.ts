import type { Session } from './session'

export interface FileContent {
  id: string
  timestamp: string
  message: string
}

interface ElectronAPI {
  getSessions: () => Promise<{
    success: boolean
    sessions?: Session[]
    error?: string
  }>
  getPlaylists: () => Promise<{
    success: boolean
    playlists?: any[]
    error?: string
  }>
  getPlaylist: (uid: string) => Promise<{
    success: boolean
    playlist?: any
    error?: string
  }>
  createPlaylist: (data: { name: string; repeat: boolean; sessions: string[] }) => Promise<{
    success: boolean
    playlist?: any
    error?: string
  }>
  updatePlaylist: (data: { uid: string; info: any }) => Promise<{
    success: boolean
    error?: string
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} 