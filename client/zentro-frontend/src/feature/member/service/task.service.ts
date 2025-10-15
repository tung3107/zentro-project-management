import type { Task } from '../../../types/task'
import api from '../../../util/axiosClient'

export const createTaskAPI = async (task: Task) => {
  const response = await api.post(`/tasks`, task)
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
