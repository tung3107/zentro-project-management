import api from '../../../util/axiosClient'

export interface ProjectSummary {
  summary: {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    blockedTasks: number
    dueTasks: number
  }
  taskData: Array<{
    status: string
    value: number
  }>
  priorityData: Array<{
    label: string
    value: number
  }>
  workLoad: Array<{
    user_id: string
    name: string
    avatar: string | null
    percent: number
    is_deleted?: boolean
  }>
}

export const getProjectSummary = async (project_id: string): Promise<ProjectSummary> => {
  const response = await api.get(`/projects/${project_id}/summary`)
  return response.data.data
}

export const getActivityForProject = async (
  project_id: string,
  period?: string,
  page?: number,
  limit?: number
): Promise<any> => {
  const params = new URLSearchParams()
  if (period) params.append('period', period)
  if (page) params.append('page', page.toString())
  if (limit) params.append('limit', limit.toString())

  const queryString = params.toString()
  const url = `/activitylogs/${project_id}${queryString ? `?${queryString}` : ''}`

  const response = await api.get(url)
  return response.data
}
