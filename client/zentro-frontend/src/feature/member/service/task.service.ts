import type { Task } from '../../../types/task'
import api from '../../../util/axiosClient'

export const createTaskAPI = async (task: Task) => {
  const response = await api.post(`/tasks`, task)
  return response.data
}
export const getOneTaskAPI = async (task_id: number) => {
  const response = await api.get(`/tasks/${task_id}`)
  return response.data
}

export const getBacklog = async (project_id: string) => {
  const response = await api.get(`/tasks/backlog/${project_id}`)
  return response.data
}

export const updateTaskAPI = async (task: Task) => {
  const response = await api.put(`/tasks/${task.task_id}`, task)
  return response.data
}

export const searchBacklog = async (project_id: string, query: string) => {
  const response = await api.get(`/tasks/backlog/search/${project_id}?search=${query}`)
  return response.data
}

export const deleteTask = async (task_id: number) => {
  const response = await api.delete(`/tasks/${task_id}`)
  return response.data
}

export const getBoard = async (project_id: string) => {
  const response = await api.get(`/tasks/${project_id}/sprints`)
  return response.data
}

export const searchBoard = async (
  project_id: string,
  search?: string,
  filters?: {
    assignee_id?: string
    priority?: number
    type?: string
  }
) => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id)
  if (filters?.priority !== undefined) params.append('priority', filters.priority.toString())
  if (filters?.type) params.append('type', filters.type)

  const response = await api.get(`/tasks/${project_id}/sprints/search?${params.toString()}`)
  return response.data
}

export const getBurndownChart = async (project_id: string) => {
  const response = await api.get(`/tasks/${project_id}/burndown`)
  return response.data
}

export const getTasksByMonth = async (project_id: string, year: number, month: number, assignee_id?: string) => {
  const params = new URLSearchParams()
  params.append('year', year.toString())
  params.append('month', month.toString())
  if (assignee_id) params.append('assignee_id', assignee_id)

  const response = await api.get(`/tasks/${project_id}/calendar?${params.toString()}`)
  return response.data
}

// Subtask APIs
export const createSubtaskAPI = async (subtask: Partial<Task>) => {
  const response = await api.post(`/tasks`, subtask)
  return response.data
}

export const updateSubtaskAPI = async (task_id: number, updates: Partial<Task>) => {
  const response = await api.put(`/tasks/${task_id}`, updates)
  return response.data
}

export const deleteSubtaskAPI = async (task_id: number) => {
  const response = await api.delete(`/tasks/${task_id}`)
  return response.data
}
