// components/StatusDropdown.tsx
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const statuses = [
  { status: 'ĐANG DIỄN RA', color: '#00D1D4', bg: '#EBFCFC', status_code: 'in_progress' },
  { status: 'TẠM DỪNG', color: '#FF7A00', bg: '#FFF3E5', status_code: 'pending' },
  { status: 'ĐANG CHUẨN BỊ', color: '#0085FF', bg: '#E6F3FF', status_code: 'planning' },
  { status: 'BỊ HỦY', color: '#E34850', bg: '#FDECEC', status_code: 'cancelled' },
  { status: 'HOÀN THÀNH', color: '#2D8A47', bg: '#E2F4E8', status_code: 'completed' }
]

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`

interface StatusDropdownProps {
  value?: string // Giá trị ban đầu
  onChange?: (status: string) => void
  className: string
}

export default function StatusDropdown({ value, onChange, className }: StatusDropdownProps) {
  // Nếu prop value có truyền vào thì controlled, còn không thì tự quản lý state selected
  const [selected, setSelected] = useState(statuses[0].status)

  useEffect(() => {
    if (value && statuses.find((s) => s.status === value)) {
      setSelected(value)
    }
  }, [value])

  // Khi người dùng chọn 1 option mới trên select
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value)
    onChange?.(e.target.value)
  }

  // Tìm object status dựa trên label
  const displayStatus = statuses.find((s) => s.status === (value || selected)) || statuses[0]

  return (
    <DropdownWrapper>
      <select
        style={{
          color: displayStatus.color,
          backgroundColor: displayStatus.bg,
          padding: '10px 10px',
          borderRadius: '6px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          fontWeight: '600'
        }}
        value={value || selected}
        onChange={handleChange}
        name='status'
        className={className}
      >
        <option value=''>-- Chọn status --</option>
        {statuses.map((status) => (
          <option
            style={{
              color: status.color,
              backgroundColor: status.bg,
              padding: '5px 10px',
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: '600'
            }}
            key={status.status}
            value={status.status}
          >
            {status.status}
          </option>
        ))}
      </select>
    </DropdownWrapper>
  )
}
