export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string // AI-enhanced content
  rawContent: string // original voice transcript
  mood: string // emoji
  photos: string[] // base64 data URLs
  isPublic: boolean
  publicId?: string // remote DB id if shared
  createdAt: number
  updatedAt: number
}

export interface SharedDiaryEntry {
  id: string
  username: string
  content: string
  mood: string
  date: string // YYYY-MM-DD diary date
  createdAt: string
}

export type MascotState = 'idle' | 'recording' | 'thinking' | 'happy' | 'sleeping'
