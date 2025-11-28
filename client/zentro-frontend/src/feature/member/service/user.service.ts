import api from '../../../util/axiosClient'
import type { User } from '../../../types/user'

export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await api.get(`/users/${userId}`)
  return response.data.data
}

export const updateUserProfile = async (data: FormData | object): Promise<User> => {
  const response = await api.put('/users/update-profile', data)
  return response.data.data
}
