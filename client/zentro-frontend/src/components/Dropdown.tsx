import React, { useEffect, useState } from 'react'
import { Dropdown as PrimeDropdown, type DropdownChangeEvent } from 'primereact/dropdown'
import api from '../util/axiosClient'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../feature/auth/hooks/useAuth'
import { toast } from 'sonner'
import Avatar from './Avatar'

type RoleOption = Record<string, any>

interface ApiDropdownProps {
  onChange: (e: DropdownChangeEvent) => void
  name: string
  value: string | number | null
  apiEndPoint: string
  placeholder: string
  className?: string
  avatar?: boolean
  showClear?: boolean
  disabled?: boolean

  /** 👇 Cho phép cấu hình key cho id và label */
  valueKey?: string
  labelKey?: string
  avatarSize?: number
  appendTo?: 'self' | HTMLElement | null | undefined
}

const Dropdown: React.FC<ApiDropdownProps> = ({
  onChange,
  name,
  value,
  apiEndPoint,
  placeholder,
  className = '',
  avatar = false,
  showClear = true,
  disabled = false,
  valueKey = 'id', // <--- default vẫn là id
  labelKey = 'name', // <--- default vẫn là name
  avatarSize = 30,
  appendTo
}) => {
  const [options, setOptions] = useState<RoleOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await api.get(apiEndPoint)
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
      optionLabel={labelKey}
      optionValue={valueKey}
      options={options}
      onChange={onChange}
      placeholder={`-- Chọn ${placeholder} --`}
      className={`flex items-center ${className}`}
      disabled={disabled}
      itemTemplate={(option: RoleOption) => (
        <div className='flex items-center gap-2 px-1 py-1 rounded-md'>
          {avatar ? (
            <>
              <Avatar name={option[labelKey]} avatarUrl={option.avatar} size={avatarSize} />
              <div className='flex flex-col'>
                <span className='text-md text-black'>{option[labelKey]}</span>
                {option.email && (
                  <span className='text-sm text-gray-600'>
                    {option.email} &middot; ID: {option[valueKey]}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              {option.color && (
                <div className='w-3 h-3 rounded-md border border-gray-300' style={{ backgroundColor: option.color }} />
              )}
              <span className='text-sm text-gray-800'>{option[labelKey]}</span>
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
                <Avatar name={option[labelKey]} avatarUrl={option.avatar} size={avatarSize} />
                <span className='text-md text-black'>{option[labelKey]}</span>
              </>
            ) : (
              <>
                {option.color && (
                  <div
                    className='w-3 h-3 rounded-md border border-gray-300'
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span>{option[labelKey]}</span>
              </>
            )}
          </div>
        )
      }}
      loading={loading}
      showClear={showClear}
      emptyMessage='Không có dữ liệu'
      appendTo={appendTo}
    />
  )
}

export default Dropdown
