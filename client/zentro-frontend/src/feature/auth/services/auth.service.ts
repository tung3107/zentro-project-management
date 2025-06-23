import api from '../../../util/axiosClient'

export interface LoginCredentials {
  email: string
  password: string
}

export const loginAPI = async (credentials: LoginCredentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const refreshTokenAPI = async (refreshToken: string) => {
  const response = await api.post('/auth/refresh-token', { refreshToken })
  return response.data
}

export const forgotPasswordAPI = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const verifyOTPAPI = async (email: string, otp: string) => {
  const response = await api.post('/auth/verify-otp', { email, otp })
  return response.data
}

export const resetPasswordAPI = async (tempResetToken: string, newPassword: string, email: string) => {
  const response = await api.post('/auth/reset-password', { tempResetToken, newPassword, email })
  return response.data
}

// export const logoutAPI = async () => {
//   const response = await api.post('/auth/logout')
//   return response.data
// }
