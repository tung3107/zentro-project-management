import React, { useState } from 'react'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import { type ApiErrorResponse } from '../hooks/useAuth'
import { LoadingBlob } from '../../../components/LoadingBlob'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPasswordAPI } from '../services/auth.service'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'

interface FormDataType {
  email: string
}

export default function ForgotPasswordForm() {
  const [formData, setFormData] = useState<FormDataType>({
    email: ''
  })
  const [errors, setErrors] = useState<Partial<FormDataType>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  ///// VALIDATION
  const validate = () => {
    const newErrors: Partial<FormDataType> = {}
    const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/

    if (!formData.email) newErrors.email = 'Email là trường bắt buộc'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email sai định dạng'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  //// ON SUBMIT
  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate() || isLoading) return

    try {
      setIsLoading(true)
      const res = await forgotPasswordAPI(formData.email)
      toast.success(res.data.message.message)

      navigate('/verify-otp', { state: { email: formData.email }, replace: true })
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi gửi OTP!')
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
        name='email'
        label='Email'
        onChange={handleChange}
        onInput={validate}
        value={formData.email}
        placeholder='Nhập email của bạn'
        required
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
