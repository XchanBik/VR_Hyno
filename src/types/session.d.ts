export interface SessionInfo {
  id: string
  name: string
  description?: string
  created: string
  duration?: number // in minutes
  tags?: string[]
  thumbnail?: string // path to thumbnail image
}

export interface Session {
  folder: string
  info: SessionInfo
} 