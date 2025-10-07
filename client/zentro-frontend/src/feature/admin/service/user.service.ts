import type { User } from '../../../types/user'
import api from '../../../util/axiosClient'
import type { MemberType } from '../components/MemberListEdit'

export const updateUserAPI = async (user_id: string, user: User) => {
  const response = await api.put(`/users/${user_id}`, user)
  return response.data
}

export const deleteUserAPI = async (user_id: string) => {
  const response = await api.delete(`/users/${user_id}`)
  return response.data
}

export const createUserAPI = async (user: User) => {
  const response = await api.post(`/users`, user)
  return response.data
}

export const resetPasswordAPI = async (user_id: string, email: string) => {
  const response = await api.post(`/users/reset-user-password`, { user_id: user_id, email: email })
  return response.data
}

export const resetPasswordFirstLoginAPI = async (email: string, password: string, newPassword: string) => {
  const response = await api.post(`/auth/reset-password-first-login`, {
    email: email,
    password: password,
    newPassword: newPassword
  })
  return response.data
}

export const searchUserAPI = async (kw: string) => {
  const response = await api.get(`/users/search?search=${kw}`)
  return response.data
}

export const getMembersByProjectAPI = async (project_id: string) => {
  const response = await api.get(`/members/${project_id}`)
  return response.data
}

export async function updateProjectMembersAPI(project_id: string, members: MemberType[]) {
  const response = await api.put(`/members/`, { project_id, members })

  return response.data
}

// export const deleteProjectAPI = async (project_id: number) => {
//   const response = await api.delete(`/projects/${project_id}`)
//   return response.data
// }
