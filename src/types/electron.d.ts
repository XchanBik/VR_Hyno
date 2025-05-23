import type { Session } from './session'

export interface FileContent {
  id: string
  timestamp: string
  message: string
}

interface ElectronAPI {
  // PLAYLISTS
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
  // SONGS
  getSongs: () => Promise<{
    success: boolean
    songs?: any[]
    error?: string
  }>
  getSong: (uid: string) => Promise<{
    success: boolean
    song?: any
    error?: string
  }>
  createSong: (data: { info: any }) => Promise<{
    success: boolean
    song?: any
    error?: string
  }>
  updateSong: (data: { uid: string; info: any }) => Promise<{
    success: boolean
    error?: string
  }>
  // SESSIONS
  getSessions: () => Promise<{
    success: boolean
    sessions?: Session[]
    error?: string
  }>
  getSession: (uid: string) => Promise<{
    success: boolean
    session?: any
    error?: string
  }>
  createSession: (data: { info: any }) => Promise<{
    success: boolean
    session?: any
    error?: string
  }>
  updateSession: (data: { uid: string; info: any }) => Promise<{
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