export interface Status {
  id: number
  name: string
  color: string
}

export interface Member {
  id: string
  name: string
  avatar?: string
  email?: string
}

export type ViewMode = 'list' | 'detail'
