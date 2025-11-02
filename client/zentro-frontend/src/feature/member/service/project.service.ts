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
  }>
}

export const getProjectSummary = async (project_id: string): Promise<ProjectSummary> => {
  const response = await api.get(`/projects/${project_id}/summary`)
  return response.data.data
}
