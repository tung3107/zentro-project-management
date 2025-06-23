import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { useAuthStore } from '../feature/auth/stores/authStore'
import { refreshTokenAPI } from '../feature/auth/services/auth.service'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_REACT_API_URL as string, // ép kiểu rõ ràng
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Kiểu trả về là string | null
axiosClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const { refreshToken, setTokens, logout } = useAuthStore.getState()

      if (!refreshToken) {
        logout()
        return Promise.resolve(error)
      }

      try {
        const response = await refreshTokenAPI(refreshToken)
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.user
        setTokens(newAccessToken, newRefreshToken)
        original.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosClient(original)
      } catch (error) {
        logout()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient
