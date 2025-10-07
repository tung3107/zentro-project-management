import React, { useEffect, useState } from 'react'
import api from '../util/axiosClient'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../feature/auth/hooks/useAuth'
import { toast } from 'sonner'

type RoleOption = {
  id: string
  name: string
}

const Dropdown = ({
  onChange,
  name,
  value,
  apiEndPoint,
  className,
  placeholder
}: {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  name: string
  value: number
  apiEndPoint: string
  placeholder: string
  className: string
}) => {
  const [options, setOptions] = useState<RoleOption[]>([])

  useEffect(() => {
    async function fetch() {
      try {
        const response = await api.get(`${apiEndPoint}`)
        setOptions(response.data.data)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi lay thông tin!')
      }
    }
    fetch()
  }, [apiEndPoint])

  return (
    <select
      className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm ${className}`}
      name={name}
      value={value}
      onChange={onChange}
    >
      <option value=''>-- Chọn {placeholder} --</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  )
}

export default Dropdown
