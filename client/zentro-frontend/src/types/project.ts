export interface Project {
  project_id: string
  project_name: string
  description: string
  leader_name: string
  leader_id?: number
  members: {
    user: { user_id: string; leader_name: string }
  }[]
  start_date: Date
  end_date: Date
  // num_of_mem: number
  status?: string
  avatar?: string | File
  [key: string]: unknown
}
