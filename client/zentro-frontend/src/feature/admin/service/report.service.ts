import api from '../../../util/axiosClient'

export interface ReportFilters {
  reportType: 'project_progress' | 'team_performance' | 'task_deadline' | 'general'
  startDate: string
  endDate: string
  projectId?: string
  teamId?: string
  userId?: string
}

export interface TaskData {
  task_id: string
  title: string
  description?: string
  type: string
  priority: number
  status: string
  status_type: string
  assignee: string
  assignee_id?: string
  reporter: string
  estimate?: number
  spent_time?: number
  start_date?: string
  due_date?: string
  created_at: string
  updated_at: string
  sprint: string
  sprint_status?: string
  project_name?: string
  is_overdue: boolean
  days_until_due?: number
}

export interface ReportStats {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  pending_tasks: number
  overdue_tasks: number
  tasks_by_priority: { [key: string]: number }
  tasks_by_type: { [key: string]: number }
  total_estimate: number
  total_spent_time: number
  completion_percentage: number
  sprint_stats: {
    total: number
    active: number
    completed: number
    planned: number
  }
  member_performance: {
    [key: string]: {
      name: string
      total_tasks: number
      completed_tasks: number
      in_progress_tasks: number
      overdue_tasks: number
      total_spent_time: number
    }
  }
  upcoming_deadlines: Array<{
    task_id: string
    title: string
    due_date: string
    assignee: string
    days_until_due: number
  }>
  overdue_list: Array<{
    task_id: string
    title: string
    due_date: string
    assignee: string
    days_overdue: number
  }>
}

export interface ReportData {
  tasks: TaskData[]
  comments: any[]
  members: any[]
  sprints: any[]
  stats: ReportStats
}

export interface Report {
  reportType: string
  filters: {
    startDate: string
    endDate: string
    projectId?: string
    teamId?: string
    userId?: string
  }
  data: ReportData
  aiAnalysis: string
  generatedAt: string
}

export interface ProjectOption {
  project_id: string
  project_name: string
  status: string
}

export interface TeamMember {
  user_id: string
  name: string
  email: string
}

export const generateReport = async (filters: ReportFilters): Promise<Report> => {
  const response = await api.post('/reports/generate', filters)
  return response.data.data
}

export const getAvailableProjects = async (): Promise<ProjectOption[]> => {
  const response = await api.get('/reports/projects')
  return response.data.data
}

export const getTeamMembers = async (projectId: string): Promise<TeamMember[]> => {
  const response = await api.get(`/reports/team-members/${projectId}`)
  return response.data.data
}

export const exportToPDF = async (reportData: Report): Promise<any> => {
  const response = await api.post('/reports/export-pdf', reportData)
  return response.data.data
}

export const sendEmail = async (report: Report, recipients: string[]): Promise<any> => {
  const response = await api.post('/reports/send-email', { report, recipients })
  return response.data.data
}
