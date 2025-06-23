import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { loginAPI } from '../services/auth.service'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export interface ApiErrorResponse {
  error: {
    message: string
  }
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { setUser, setTokens } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data.user

      setTokens(accessToken, refreshToken)
      setUser(user)

      queryClient.setQueryData(['user'], user)
      toast.success('Đăng nhập thành công')
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => {
      const error = err as AxiosError<ApiErrorResponse>
      const msg = error.response?.data.error.message ?? 'Đăng nhập thất bại'
      toast.error(msg)
    }
  })
}
