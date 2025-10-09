import type { Project } from '../../../types/project'

import api from '../../../util/axiosClient'

export const updateProjectAPI = async (project_id: string, project: Project) => {
  const response = await api.put(`/projects/${project_id}`, project)
  return response.data
}

export const deleteProjectAPI = async (project_id: string) => {
  const response = await api.delete(`/projects/${project_id}`)
  return response.data
}

export const userProjectAPI = async (user_id: string) => {
  const response = await api.get(`/projects/get-project-by-user/${user_id}`)
  return response.data
}

export const createProjectAPI = async (project: Project) => {
  const response = await api.post(`/projects`, project)
  return response.data
}
