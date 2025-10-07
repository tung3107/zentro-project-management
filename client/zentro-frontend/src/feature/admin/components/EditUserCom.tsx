import React, { useState, type Dispatch, type SetStateAction } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { LoadingBlob } from '../../../components/LoadingBlob'
import type { User } from '../../../types/user'
import { resetPasswordAPI, updateUserAPI } from '../service/user.service'
import Dropdown from '../../../components/Dropdown'
import UserProjectList from './UserProjectList'
import { AvatarWithEdit } from '../../../components/AvatarWithEdit'

const StyledForm = styled.div`
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`

const FormGroup = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Label = styled.label`
  color: #717d84;
  font-size: 14px;
  font-weight: 500;
  line-height: 150%;
  width: 100px;
`

const Input = styled.input`
  margin-left: 12px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
`

export default function EditUserCom({
  user,
  setModalOpen,
  setModalContent,
  onSuccess
}: {
  user: User
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<User>(user)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    const emailRegex = /^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/

    if (!formData.last_name) newErrors.last_name = 'Tên là trường bắt buộc'

    if (!formData.first_name) newErrors.first_name = 'Họ là trường bắt buộc'

    if (!formData.email) {
      newErrors.email = 'Email là trường bắt buộc'
    } else if (!emailRegex.test(formData.email)) newErrors.email = 'Email sai định dạng'

    if (!formData.role_id) {
      newErrors.role_id = 'Role là trường bắt buộc'
    }

    if (!formData.phone) {
      newErrors.phone = 'Điện thoại là trường bắt buộc'
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (validate()) {
      try {
        setIsLoading(true)
        const hasFile = formData.avatar && typeof formData.avatar !== 'string' && formData.avatar instanceof File
        let toSend: any = formData

        if (hasFile) {
          // Tạo FormData từ đầu
          const apiForm = new FormData()
          Object.entries(formData).forEach(([key, value]) => {
            // Nếu là avatar file
            if (key === 'avatar' && value instanceof File) {
              apiForm.append('avatar', value)
            } else if (value !== undefined && value !== null) {
              apiForm.append(key, value as string | Blob)
            }
          })
          toSend = apiForm
        }
        const res = await updateUserAPI(formData.user_id, toSend)
        onSuccess?.()
        toast.success('Sửa user thành công')
        setModalOpen(false)
        setModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleResetPassword = async (user_id: string, email: string) => {
    try {
      setIsLoading(true)
      const res = await resetPasswordAPI(user_id, email)
      onSuccess?.()
      toast.success('Reset mật khẩu thành công! Mật khẩu được gửi đến mail của user')
      setModalOpen(false)
      setModalContent(null)
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi thay đổi thông tin!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <form
      style={{ color: '#1C272D' }}
      className='py-[16px] mb-[120px] px-[30px] relative flex-1 h-screen'
      onSubmit={handleSubmit}
    >
      <div className='flex justify-start'>
        <div className='flex flex-row gap-[16px] items-center'>
          <AvatarWithEdit
            user={{
              avatar: formData.avatar, // lấy từ state
              first_name: formData.first_name || '' // có thể rỗng lúc đầu
            }}
            onAvatarChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
          />
          <div style={{ fontFamily: "'Inter', sans-serif" }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', lineHeight: '150%' }}>
              {user.first_name} {user.last_name}
            </h2>
            <span style={{ fontSize: '14px', fontWeight: '400', lineHeight: '150%', color: '#717D84' }}>
              Role: {user?.Role?.role_name} <span style={{ margin: '0 10px', color: '#000000ff' }}>&middot;</span> ID:{' '}
              {user?.user_id}
            </span>
          </div>
        </div>
      </div>
      <div className='project-infor pt-[32px]'>
        <h2 style={{ fontSize: '20px', fontWeight: '600', lineHeight: '150%' }}>Thông tin người dùng</h2>
        <StyledForm>
          <FormGroup>
            <Label title='Họ: '>Họ:</Label>
            <div>
              <Input type='text' name='first_name' value={formData.first_name} onChange={handleChange} />
              {errors.first_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.first_name}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='Mô tả'>Tên:</Label>
            <div>
              <Input type='text' name='last_name' value={formData.last_name} onChange={handleChange} />
              {errors.last_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.last_name}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='email'>Email:</Label>
            <div>
              <Input type='text' name='email' value={formData.email} onChange={handleChange} disabled />
              {errors.email && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.email}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='role'>Role:</Label>
            <div>
              <Dropdown
                placeholder='role'
                name='role_id'
                apiEndPoint='/roles/system'
                onChange={handleSelectChange}
                value={formData.role_id ?? 0}
                className='ml-[12px]'
              />
              {errors.role_id && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.role_id}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='phone'>Điện thoại:</Label>
            <div>
              <Input type='text' name='phone' value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.phone}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='password'>Mật khẩu:</Label>
            <div className='flex flex-col gap-2 ml-[24px]'>
              <Button
                className='w-[50%]'
                type='button'
                onClick={() => void handleResetPassword(user.user_id, user.email)}
              >
                {isLoading ? <LoadingBlob /> : 'Reset mật khẩu'}
              </Button>
              <p style={{ fontSize: '12px', fontWeight: '400', lineHeight: '150%' }} className='text-gray-600'>
                Sau khi reset mật khẩu, hệ thống sẽ gửi mật khẩu vào email của user
              </p>
            </div>
          </FormGroup>

          {/* {error && <p className='text-red-500'>{error}</p>} */}
        </StyledForm>
      </div>
      {formData.role_id !== 1 && (
        <div className='project-infor pt-[32px]'>
          <h2 style={{ fontSize: '20px', fontWeight: '600', lineHeight: '150%' }}>Dự án người dùng tham gia</h2>
          <UserProjectList userId={user.user_id} />
        </div>
      )}
      <div className='flex flex-row justify-end gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50 h-[80px]'>
        <Button className='flex items-center gap-2' type='submit'>
          {isLoading ? (
            <LoadingBlob />
          ) : (
            <>
              <Check strokeWidth={1.5} size={18} />
              <span className='text-md'>Lưu thay đổi</span>
            </>
          )}
        </Button>
        <button
          className='px-4 py-2 flex items-center gap-2 bg-transparent! hover:underline cursor-pointer'
          type='button'
          onClick={() => {
            setModalOpen(false)
            setModalContent(null)
          }}
        >
          <span className='text-md text-gray-600!'>Hủy bỏ</span>
        </button>
      </div>
    </form>
  )
}
