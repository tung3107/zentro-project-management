import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../../components/Input'
import Button from '../../../components/Button'
import { LoadingBlob } from '../../../components/LoadingBlob'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../hooks/useAuth'
import { toast } from 'sonner'
import { resetPasswordAPI } from '../services/auth.service'

interface FormDataType {
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordForm() {
  const { state } = useLocation() as { state: { email: string; tempResetToken: string } }
  const email = state?.email
  const tempResetToken = state?.tempResetToken
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormDataType>({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/

  const validateField = (name: keyof FormDataType, value: string): string | undefined => {
    switch (name) {
      case 'newPassword':
        if (!value) return 'Mật khẩu là trường bắt buộc'
        if (!passwordRegex.test(value))
          return 'Mật khẩu phải dài 8-35 ký tự, có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt'
        break

      case 'confirmPassword':
        if (!value) return 'Mật khẩu là trường bắt buộc'
        if (value !== formData.newPassword) return 'Mật khẩu và xác nhận mật khẩu không khớp nhau'
        break
    }
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<FormDataType> = {}
    ;(Object.keys(formData) as (keyof FormDataType)[]).forEach((field) => {
      const msg = validateField(field, formData[field])
      if (msg) newErrors[field] = msg
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    const msg = validateField(name as keyof FormDataType, value)
    setErrors((prev) => ({ ...prev, [name]: msg ?? '' }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateAll() || isLoading) return

    try {
      setIsLoading(true)
      const res = await resetPasswordAPI(tempResetToken, formData.newPassword, email)
      toast.success(res.data.message.message)

      localStorage.removeItem('tempResetToken')
      localStorage.removeItem('email')

      navigate('/reset-success', { replace: true })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi mật khẩu!')
    } finally {
      setIsLoading(false)
    }
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
        name='newPassword'
        label='Mật khẩu mới'
        onChange={handleChange}
        value={formData.newPassword}
        placeholder='Nhập mật khẩu mới của bạn'
        errors={errors}
      />
      <Input
        name='confirmPassword'
        label='Xác nhận mật khẩu'
        onChange={handleChange}
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
