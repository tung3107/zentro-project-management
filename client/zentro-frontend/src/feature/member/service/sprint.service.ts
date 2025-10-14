import type { Sprint } from '../../../types/sprint'
import api from '../../../util/axiosClient'

export const createSprintAPI = async (sprint: Sprint) => {
  const response = await api.post(`/sprints/create-planned-sprint`, sprint)
  return response.data
}

export const deleteSprintAPI = async (sprint_id: number) => {
  const response = await api.delete(`/sprints/${sprint_id}`)
  return response.data
}

export const updateSprintAPI = async (sprint: Sprint) => {
  const response = await api.put(`/sprints/${sprint.sprint_id}`, sprint)
  return response.data
}

export const getSprintAPI = async (sprint_id: number) => {
  const response = await api.get(`/sprints/${sprint_id}`)
  return response.data
}
