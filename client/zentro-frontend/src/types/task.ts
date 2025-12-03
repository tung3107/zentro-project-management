export interface Task {
  task_id: number
  title: string
  description: string
  project_id?: string
  sprint_id?: number
  status_id?: number
  assignee_id?: string
  reporter_id?: string
  priority: number
  start_date?: Date
  due_date?: Date
  estimate?: number
  spent_time?: number
  type: string
  parent_id?: string
  created_at: Date
  updated_at: Date
  assignee?: {
    assignee_name?: string
    email?: string
    avatar?: string
    first_name?: string
    last_name?: string
    memberships?: Array<{
      is_delete: boolean
    }>
  }
  subtasks?: Task[]
  status?: {
    status_id: number
    name: string
    color: string
  }
  links?: Array<{
    task_id: string
    linked_task_id: string
    linkedTask: Task
  }>
}
