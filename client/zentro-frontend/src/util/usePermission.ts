import { useEffect } from 'react'
import { useAuthStore } from '../feature/auth/stores/authStore'
import api from './axiosClient'

export const usePermission = () => {
  const { accessToken, setPermission, setPermLoading } = useAuthStore()

  useEffect(() => {
    if (!accessToken) return
    ;(async () => {
      try {
        setPermLoading(true)
        const { data } = await api.get('/permission/me')
        setPermission(data?.data?.data)
      } catch {
        setPermission([])
      } finally {
        setPermLoading(false)
      }
    })()
  }, [accessToken, setPermLoading, setPermission])
}
