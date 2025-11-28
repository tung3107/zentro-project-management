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

export interface CommentData {
  comment_id: number
  task_id: string
  content: string
  user: string
  created_at: string
}

export interface MemberData {
  user_id: string
  name: string
  email: string
  avatar?: string
}

export interface SprintData {
  sprint_id: number
  name: string
  goal?: string
  status: string
  start_date: string
  end_date: string
  velocity_estimate?: number
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
  comments: CommentData[]
  members: MemberData[]
  sprints: SprintData[]
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

class ReportService {
  /**
   * Generate a new report based on filters
   */
  async generateReport(filters: ReportFilters): Promise<Report> {
    const response = await api.post('/reports/generate', filters)
    return response.data.data
  }

  /**
   * Get available projects for filtering
   */
  async getAvailableProjects(): Promise<ProjectOption[]> {
    const response = await api.get('/reports/projects')
    return response.data.data
  }

  /**
   * Get team members for a specific project
   */
  async getTeamMembers(projectId: string): Promise<TeamMember[]> {
    const response = await api.get(`/reports/team-members/${projectId}`)
    return response.data.data
  }

  /**
   * Export report to PDF (placeholder)
   */
  async exportToPDF(reportData: Report): Promise<any> {
    const response = await api.post('/reports/export-pdf', reportData)
    return response.data.data
  }

  /**
   * Send report via email (placeholder)
   */
  async sendEmail(report: Report, recipients: string[]): Promise<any> {
    const response = await api.post('/reports/send-email', { report, recipients })
    return response.data.data
  }
}

export default new ReportService()
