import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { LoadingBlob } from '../../../components/LoadingBlob'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../hooks/useAuth'
import { toast } from 'sonner'
import { resetPasswordFirstLoginAPI } from '../../admin/service/user.service'
import { useAuthStore } from '../stores/authStore'

interface FormDataType {
  password: string
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordFirstLoginForm() {
  const { user } = useAuthStore()
  const { state } = useLocation() as { state: { email: string } }
  const email = state?.email

  const [formData, setFormData] = useState<FormDataType>({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Partial<FormDataType>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  ///// VALIDATION
  const validate = () => {
    const newErrors: Partial<FormDataType> = {}
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/

    if (!formData.password) newErrors.password = 'Mật khẩu là trường bắt buộc'
    else if (!passwordRegex.test(formData.password))
      newErrors.password = 'Mật khẩu phải dài 8-35 ký tự, có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt'

    if (!formData.newPassword) newErrors.newPassword = 'Mật khẩu là trường bắt buộc'
    else if (!passwordRegex.test(formData.newPassword))
      newErrors.newPassword = 'Mật khẩu phải dài 8-35 ký tự, có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt'
    else if (formData.password && formData.newPassword && formData.password === formData.newPassword)
      newErrors.newPassword = 'Mật khẩu mới không được giống mật khẩu cũ'

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu là trường bắt buộc'
    else if (!passwordRegex.test(formData.confirmPassword))
      newErrors.confirmPassword = 'Mật khẩu phải dài 8-35 ký tự, có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt'
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp nhau'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  //// ON SUBMIT
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate() || isLoading) return

    try {
      setIsLoading(true)
      const res = await resetPasswordFirstLoginAPI(email, formData.password, formData.newPassword)
      toast.success(res.response.message)

      console.log(user?.role?.role_name)

      if (user?.role_name === 'Supper Admin') {
        navigate('/admin/projects', { replace: true })
      }
      if (user?.role_name === 'User') {
        navigate('/admin/', { replace: true })
      }
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi mật khẩu!')
    } finally {
      setIsLoading(false)
    }
  }

  /// ON CHANGE
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0 8px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1.25rem',
        maxWidth: '400px',
        width: '100%'
      }}
    >
      <Input
        name='password'
        label='Mật khẩu cũ'
        onChange={handleChange}
        onInput={validate}
        value={formData.password}
        placeholder='Nhập mật khẩu cũ của bạn của bạn'
        errors={errors}
      />
      <Input
        name='newPassword'
        label='Mật khẩu mới'
        onChange={handleChange}
        onInput={validate}
        value={formData.newPassword}
        placeholder='Nhập mật khẩu mới của bạn của bạn'
        errors={errors}
      />
      <Input
        name='confirmPassword'
        label='Xác nhận mật khẩu'
        onChange={handleChange}
        onInput={validate}
        value={formData.confirmPassword}
        placeholder='Xác nhận lại mật khẩu'
        errors={errors}
      />
      <Button type='submit' size='lg' disabled={isLoading}>
        {isLoading ? <LoadingBlob size={18} /> : 'Tiếp tục'}
      </Button>
      <Link
        to='/login'
        style={{ color: 'var(--text)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 'bold' }}
      >
        {'< Quay lại đăng nhập'}
      </Link>
    </form>
  )
}
