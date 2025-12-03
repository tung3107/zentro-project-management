import React from 'react'
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown'
import styled from 'styled-components'
import { Flame, ArrowUp, Minus, ArrowDown, X } from 'lucide-react'

export type PriorityOption = {
  value: number
  label: string
  color: string
  icon: JSX.Element
}

const priorities: PriorityOption[] = [
  { value: 3, label: 'Cần gấp', color: '#ef4444', icon: <Flame size={14} color='#ef4444' /> },
  { value: 2, label: 'Cao', color: '#fa7115ff', icon: <ArrowUp size={14} color='#fa7115ff' /> },
  { value: 1, label: 'Trung bình', color: '#facc15', icon: <Minus size={14} color='#facc15' /> },
  { value: 0, label: 'Thấp', color: '#22c55e', icon: <ArrowDown size={14} color='#22c55e' /> }
]

interface PrioritySelectProps {
  value: number
  onChange: (value: number) => void
  className?: string
  showClear?: boolean
  appendTo?: 'self' | HTMLElement | null | undefined
}

const StyledDropdown = styled(Dropdown)`
  margin-left: 12px;
  padding: 0;
  border: 1px solid #ccc !important;
  border-radius: 6px !important;
  font-size: 14px !important;
  height: 32px !important;
  display: flex;
  align-items: center;
  font-family: 'Inter', sans-serif;

  .p-dropdown-label {
    padding: 6px 12px !important;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &:hover {
    border-color: #999 !important;
  }

  &:focus-within {
    border-color: #2563eb !important; /* xanh focus đẹp */
    box-shadow: 0 0 0 1px #2563eb33;
  }
`

const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange, className, showClear = true, appendTo }) => {
  const itemTemplate = (option: PriorityOption) => (
    <div className='flex items-center gap-2' style={{ color: option.color }}>
      {option.icon}
      <span className='font-bold'>{option.label}</span>
    </div>
  )

  const valueTemplate = (option: PriorityOption | undefined) =>
    option ? (
      <div className='flex items-center gap-2' style={{ color: option.color }}>
        {option.icon}
        <span className='font-bold'>{option.label}</span>
      </div>
    ) : (
      <span style={{ color: '#999' }}>Chọn độ ưu tiên</span>
    )

  const handleChange = (e: DropdownChangeEvent) => {
    onChange(Number(e.value)) // ép về number luôn
  }

  return (
    <StyledDropdown
      value={value}
      onChange={handleChange}
      options={priorities}
      optionLabel='label'
      optionValue='value'
      itemTemplate={itemTemplate}
      valueTemplate={valueTemplate}
      placeholder='Chọn độ ưu tiên'
      className={`w-[200px] ${className}`}
      showClear={showClear}
      appendTo={appendTo}
    />
  )
}

export default PrioritySelect
