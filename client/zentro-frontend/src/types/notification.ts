export interface Notification {
  notification_id: number
  user_id: string
  type: 'task_assigned' | 'comment_mention' | 'comment_on_task' | 'sprint_started' | 'sprint_completed'
  title: string
  message: string
  task_id?: string
  sprint_id?: number
  comment_id?: number
  project_id?: string
  actor_id?: string
  is_read: boolean
  link?: string
  created_at: string
  actor?: {
    user_id: string
    first_name: string
    last_name: string
    avatar?: string
    email: string
  }
  task?: {
    task_id: string
    title: string
    type: string
  }
  sprint?: {
    sprint_id: number
    name: string
    status: string
  }
  project?: {
    project_id: string
    project_name: string
  }
}

export interface NotificationResponse {
  rows: Notification[]
  count: number
}
