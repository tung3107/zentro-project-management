import { useEffect } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import api from './axiosClient'
import { useNavigate } from 'react-router-dom'

export const usePermission = () => {
  const { accessToken, setPermission, setPermLoading, setIsChangePassword } = useAuthStore()

  useEffect(() => {
    if (!accessToken) return
    ;(async () => {
      try {
        setPermLoading(true)
        const { data } = await api.get('/permission/me')
        const userData = data?.data?.data
        setPermission(userData)
        setIsChangePassword(data?.data?.is_change_password)
      } catch {
        setPermission([])
      } finally {
        setPermLoading(false)
      }
    })()
  }, [accessToken, setPermLoading, setPermission, setIsChangePassword])
}
