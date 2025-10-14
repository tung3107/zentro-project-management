import type { Task } from './task'

export interface Sprint {
  sprint_id: number
  project_id: string
  name?: string
  goal?: string
  start_date: Date
  end_date: Date
  status: 'planned' | 'active' | 'completed'
  velocity_estimate?: number
  tasks?: Task[]
}
