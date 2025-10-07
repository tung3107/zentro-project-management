import React, { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import styled from 'styled-components'
import Button from '../../../components/Button'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { LoadingBlob } from '../../../components/LoadingBlob'
import CreatedPermissionMatrix from './CreatedPermissionMatrix'
import { createProjectRole, updateProjectRole } from '../service/role.service'

export interface Role {
  role_id?: number
  role_name?: string
  description?: string
  icon?: string
  permissions?: {
    permission_id?: number
    RolePermission?: {
      permission_id: number
      role_id: number
    }
  }[]
}

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

export default function EditRoleCom({
  role,
  setEditModalOpen,
  setEditModalContent,
  onSuccess
}: {
  role: Role
  setEditModalOpen: Dispatch<SetStateAction<boolean>>
  setEditModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
}) {
  const [formData, setFormData] = useState<Role>(role)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (role?.permissions) {
      const ids = role.permissions.map((p) => p.RolePermission?.permission_id || p.permission_id)
      setSelectedPermissions(ids)
    }
  }, [role])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.role_name) newErrors.role_name = 'Tên role là trường bắt buộc'
    if (!formData.description) newErrors.description = 'Mô tả là trường bắt buộc'
    if (selectedPermissions.length === 0) newErrors.permissions = 'Phải chọn ít nhất 1 quyền hạn'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const toSend: Role = {
      ...formData,
      permissions: selectedPermissions.map((id) => ({ permission_id: id }))
    }

    if (validate()) {
      try {
        setIsLoading(true)
        await updateProjectRole(toSend)
        onSuccess?.()
        toast.success('Sửa role thành công!')
        setEditModalOpen(false)
        setEditModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi tạo role!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  console.log(role)

  return (
    <form style={{ color: '#1C272D' }} className='relative flex-1 mb-[80px] overflow-y-auto' onSubmit={handleSubmit}>
      <div className='project-infor py-1 px-3'>
        <StyledForm>
          <FormGroup>
            <Label>Tên role:</Label>
            <div>
              <Input type='text' name='role_name' value={formData.role_name ?? ''} onChange={handleChange} />
              {errors.role_name && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.role_name}</p>}
            </div>
          </FormGroup>

          <FormGroup>
            <Label>Mô tả:</Label>
            <div>
              <Input type='text' name='description' value={formData.description ?? ''} onChange={handleChange} />
              {errors.description && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.description}</p>}
            </div>
          </FormGroup>

          <FormGroup>
            <div>
              {errors.permissions && <p className='text-sm text-red-500 mb-3 ml-[12px]'>{errors.permissions}</p>}
              <CreatedPermissionMatrix selected={selectedPermissions} setSelected={setSelectedPermissions} />
            </div>
          </FormGroup>
        </StyledForm>
      </div>

      <div className='flex flex-row justify-end gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50 items-center'>
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
              setEditModalOpen(false)
              setEditModalContent(null)
            }}
          >
            <span className='text-md text-gray-600!'>Hủy bỏ</span>
          </button>
        </div>
      </div>
    </form>
  )
}
