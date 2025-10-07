import api from '../../../util/axiosClient'
import type { Role } from '../components/AddRoleCom'

export const getRoleForProjectAPI = async () => {
  const response = await api.get(`/roles/project`)
  return response.data
}

export const createProjectRole = async (roles: Role) => {
  const response = await api.post(`/roles/`, roles)
  return response.data
}

export const updateProjectRole = async (roles: Role) => {
  const response = await api.put(`/roles/`, roles)
  return response.data
}

export const deleteProjectRole = async (roles: number) => {
  const response = await api.delete(`/roles/${roles}`)
  return response.data
}
