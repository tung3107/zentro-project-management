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
import { createUserAPI } from '../service/user.service'
import Dropdown from '../../../components/Dropdown'
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

export default function AddUserCom({
  setAddModalOpen,
  setAddModalContent,
  onSuccess
}: {
  setAddModalOpen: Dispatch<SetStateAction<boolean>>
  setAddModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<User>({})
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
        // Nếu có file ảnh, dùng FormData
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

        const res = await createUserAPI(toSend)
        onSuccess?.()
        toast.success('Tạo user thành công! Hệ thống đã gửi mail chứa mật khẩu cho email của user')
        setAddModalOpen(false)
        setAddModalContent(null)
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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value, name } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  return (
    <form style={{ color: '#1C272D' }} className=' relative flex-1 mb-[80px]  overflow-y-auto' onSubmit={handleSubmit}>
      <div className='project-infor py-1 px-3'>
        <StyledForm>
          <FormGroup>
            <Label title='Ảnh'>Ảnh:</Label>
            <div>
              <AvatarWithEdit
                user={{
                  avatar: formData.avatar, // lấy từ state
                  first_name: formData.first_name || '' // có thể rỗng lúc đầu
                }}
                onAvatarChange={(url) => setFormData((prev) => ({ ...prev, avatar: url }))}
              />
              {/* Có thể show lỗi upload ảnh nếu muốn */}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='Họ: '>
              Họ <span className='text-red-500'>*</span>:
            </Label>
            <div>
              <Input type='text' name='first_name' value={formData.first_name} onChange={handleChange} />
              {errors.first_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.first_name}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='Mô tả'>
              Tên <span className='text-red-500'>*</span>:
            </Label>
            <div>
              <Input type='text' name='last_name' value={formData.last_name} onChange={handleChange} />
              {errors.last_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.last_name}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='email'>
              Email <span className='text-red-500'>*</span>:
            </Label>
            <div>
              <Input type='text' name='email' value={formData.email} onChange={handleChange} />
              {errors.email && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.email}</p>}
            </div>
          </FormGroup>
          <FormGroup>
            <Label title='role'>
              Role <span className='text-red-500'>*</span>:
            </Label>
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
              {/* Ghi chú role */}
              <div className='mt-1 text-xs text-gray-500 space-y-1 ml-[12px]'>
                <p>
                  <span className='font-medium text-gray-700'>Admin:</span> Quản lý user, vị trí, project,...
                </p>
                <p>
                  <span className='font-medium text-gray-700'>Member:</span> tham gia project, nhận & thực hiện task
                </p>
              </div>
            </div>
          </FormGroup>

          <FormGroup>
            <Label title='phone'>
              Điện thoại <span className='text-red-500'>*</span>:
            </Label>
            <div>
              <Input type='text' name='phone' value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.phone}</p>}
            </div>
          </FormGroup>
        </StyledForm>
      </div>
      <div className='flex flex-row justify-between gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50 items-center'>
        <p style={{ fontSize: '12px', fontWeight: '400', lineHeight: '150%', width: '40%' }} className='text-gray-600'>
          Sau khi tạo user thành công, Hệ thống sẽ gửi mật khẩu qua email của user
        </p>
        <div className='flex flex-row'>
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
              setAddModalOpen(false)
              setAddModalContent(null)
            }}
          >
            <span className='text-md text-gray-600!'>Hủy bỏ</span>
          </button>
        </div>
      </div>
    </form>
  )
}
