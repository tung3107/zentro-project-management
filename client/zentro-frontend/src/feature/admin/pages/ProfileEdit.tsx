import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { AvatarWithEdit } from '../../../components/AvatarWithEdit'
import Input from '../../../components/Input'
import { useAuthStore } from '../../auth/stores/authStore'
import { toast } from 'sonner'
import api from '../../../util/axiosClient'
import type { AxiosError } from 'axios'

interface FormData {
  first_name: string
  last_name: string
  phone: string
  avatar?: string | File
}

interface ApiErrorResponse {
  error: {
    message: string
  }
}

export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Họ là trường bắt buộc'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Tên là trường bắt buộc'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Điện thoại là trường bắt buộc'
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setIsLoading(true)
      const hasFile = formData.avatar && typeof formData.avatar !== 'string' && formData.avatar instanceof File

      let toSend: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      }

      if (hasFile) {
        const apiForm = new FormData()
        apiForm.append('first_name', formData.first_name)
        apiForm.append('last_name', formData.last_name)
        apiForm.append('phone', formData.phone)
        apiForm.append('avatar', formData.avatar as File)
        toSend = apiForm
      }

      const res = await api.put('/users/update-profile', toSend)
      const updatedUser = res.data.data

      // Update auth store with new user data
      setUser(updatedUser)

      toast.success('Cập nhật thông tin thành công!')
      navigate('/admin/profile')
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi cập nhật thông tin!')
      console.error('Update profile error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate('/admin/profile')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='Quay lại'
          >
            <ArrowLeft size={20} className='text-gray-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-900'>Chỉnh sửa thông tin cá nhân</h1>
        </div>
      </div>

      {/* Form Content */}
      <div className='flex-1 p-6 overflow-auto bg-gray-50'>
        <div className='max-w-2xl mx-auto'>
          <form onSubmit={handleSubmit} className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
            {/* Avatar Section */}
            <div className='flex flex-col items-center gap-4 pb-6 border-b border-gray-200'>
              <AvatarWithEdit
                user={{
                  avatar: formData.avatar,
                  first_name: formData.first_name || 'Người dùng'
                }}
                onAvatarChange={(file) =>
                  setFormData((prev) => ({
                    ...prev,
                    avatar: file
                  }))
                }
              />
              <p className='text-sm text-gray-500 text-center'>Click vào icon camera để thay đổi ảnh đại diện</p>
            </div>

            {/* Form Fields */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Họ <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='first_name'
                  value={formData.first_name}
                  onChange={handleChange}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  placeholder='Nhập họ của bạn'
                />
                {errors.first_name && <p className='text-sm text-red-500 mt-1'>{errors.first_name}</p>}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Tên <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='last_name'
                  value={formData.last_name}
                  onChange={handleChange}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  placeholder='Nhập tên của bạn'
                />
                {errors.last_name && <p className='text-sm text-red-500 mt-1'>{errors.last_name}</p>}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Số điện thoại <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                  placeholder='Nhập số điện thoại'
                />
                {errors.phone && <p className='text-sm text-red-500 mt-1'>{errors.phone}</p>}
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                <input
                  type='email'
                  value={user?.email || ''}
                  disabled
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed'
                />
                <p className='text-xs text-gray-500 mt-1'>Email không thể thay đổi</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-3 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => navigate('/admin/profile')}
                className='flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full border-t-2 border-b-2 border-white w-5 h-5' />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
