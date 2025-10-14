import React, { useEffect, useState } from 'react'
import { Dropdown as PrimeDropdown, DropdownChangeEvent } from 'primereact/dropdown'
import api from '../util/axiosClient'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../feature/auth/hooks/useAuth'
import { toast } from 'sonner'
import Avatar from './Avatar'

type RoleOption = {
  id: string
  name: string
  color?: string
  avatar?: string
  email?: string
}

interface ApiDropdownProps {
  onChange: (e: DropdownChangeEvent) => void
  name: string
  value: string | number | null
  apiEndPoint: string
  placeholder: string
  className?: string
  avatar?: boolean
}

const Dropdown: React.FC<ApiDropdownProps> = ({
  onChange,
  name,
  value,
  apiEndPoint,
  placeholder,
  className = '',
  avatar = false
}) => {
  const [options, setOptions] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await api.get(`${apiEndPoint}`)
        setOptions(response.data.data)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi lấy thông tin!')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [apiEndPoint])

  return (
    <PrimeDropdown
      name={name}
      value={value}
      optionLabel='name'
      optionValue='id'
      options={options}
      onChange={onChange}
      placeholder={`-- Chọn ${placeholder} --`}
      className={`flex items-center ${className}`}
      itemTemplate={(option: RoleOption) => (
        <div
          className='flex items-center gap-2 px-2 py-1 rounded-md'
          style={{
            backgroundColor: option.color ? option.color + '20' : 'transparent'
          }}
        >
          {avatar ? (
            <>
              <Avatar name={option.name} avatarUrl={option.avatar} size={30} />
              <div className='flex flex-col'>
                <span className='text-md  text-black'>{option.name}</span>
                <span className='text-sm text-gray-600'>
                  {option.email} &middot; ID: {option.id}
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                className='w-3 h-3 rounded-md border border-gray-300'
                style={{ backgroundColor: option.color ?? '#ccc' }}
              />
              <span className='text-sm text-gray-800'>{option.name}</span>
            </>
          )}
        </div>
      )}
      valueTemplate={(option: RoleOption) => {
        if (!option) return <span className='text-gray-400'>-- Chọn {placeholder} --</span>
        return (
          <div className='flex items-center gap-2'>
            {avatar ? (
              <>
                <Avatar name={option.name} avatarUrl={option.avatar} size={30} />
                <span className='text-md  text-black'>{option.name}</span>
              </>
            ) : (
              <>
                <div
                  className='w-3 h-3 rounded-md border border-gray-300'
                  style={{ backgroundColor: option.color ?? '#ccc' }}
                />
                <span>{option.name}</span>
              </>
            )}
          </div>
        )
      }}
      loading={loading}
      showClear
      emptyMessage='Không có dữ liệu'
    />
  )
}

export default Dropdown
