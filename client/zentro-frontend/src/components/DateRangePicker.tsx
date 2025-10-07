import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export interface DateRangeValue {
  startDate: string | null
  endDate: string | null
}

interface DateRangePickerProps {
  value?: [Date | null, Date | null]
  onChange: (range: DateRangeValue) => void
  placeholder?: string
  disabled?: boolean
  className: string
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  placeholder = 'Chọn khoảng ngày',
  disabled = false,
  className
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(value ?? [null, null])
  const [startDate, endDate] = dateRange

  const handleChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates)
    const [start, end] = dates

    onChange({
      startDate: start ? start.toLocaleDateString('en-CA') : null, // "2025-07-01"
      endDate: end ? end.toLocaleDateString('en-CA') : null
    })
  }

  return (
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={handleChange}
      isClearable
      dateFormat='dd/MM/yyyy'
      placeholderText={placeholder}
      disabled={disabled}
      className={`border border-gray-300 rounded-md p-2 text-sm z-50 ${className}`}
    />
  )
}

export default DateRangePicker
