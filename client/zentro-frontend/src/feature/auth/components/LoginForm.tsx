import React, { useState } from 'react'
import Button from '../../../components/Button'
import Input from '../../../components/Input'
import { useLogin } from '../hooks/useAuth'
import { LoadingBlob } from '../../../components/LoadingBlob'
import { Link } from 'react-router-dom'

interface FormDataType {
  email: string
  password: string
  isRemember: boolean
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormDataType>({
    email: '',
    password: '',
    isRemember: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loginMutation = useLogin()

  const validate = () => {
    const newErrors: Record<string, string> = {}
    const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/

    if (!formData.email) newErrors.email = 'Email là trường bắt buộc'
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email sai định dạng'

    if (!formData.password) newErrors.password = 'Mật khẩu là trường bắt buộc'
    else if (!passwordRegex.test(formData.password))
      newErrors.password = 'Mật khẩu phải dài 8-35 ký tự, có ít nhất 1 chữ hoa, thường, số và ký tự đặc biệt'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (validate()) {
      await loginMutation.mutateAsync(formData)
    }
  }

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
        maxWidth: '300px',
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
      <Input
        name='password'
        label='Mật khẩu'
        onChange={handleChange}
        onInput={validate}
        value={formData.password}
        placeholder='Nhập mật khẩu của bạn'
        required
        errors={errors}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px', // Khoảng cách giữa ô và chữ
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            userSelect: 'none'
          }}
        >
          <input
            type='checkbox'
            id='remember'
            name='isRemember'
            checked={formData.isRemember}
            onChange={handleChange}
            style={{
              width: '20px',
              height: '20px',

              fontWeight: '500',
              accentColor: 'red', // Màu khi được chọn (nếu trình duyệt hỗ trợ)
              cursor: 'pointer'
            }}
          />
          <label htmlFor='remember'>Ghi nhớ tôi</label>
        </div>
        <Link to='/forgot-password' style={{ color: 'red', fontSize: '0.875rem', textDecoration: 'none' }}>
          Quên mật khẩu?
        </Link>
      </div>
      <Button type='submit' size='lg' disabled={loginMutation.isPending}>
        {loginMutation.isPending ? ( // hiển thị Blob trong lúc loading
          <LoadingBlob />
        ) : (
          'Đăng nhập'
        )}
      </Button>
    </form>
  )
}
