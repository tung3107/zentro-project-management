import { ArrowDown, ArrowUp, Calendar, Flame, Minus } from 'lucide-react'
import type { Project } from '../../../types/project'
import DatePicker from 'react-datepicker'

export default function Step2Com({
  formData,
  handleChange,
  errors,
  handleDateChange
}: {
  formData: Project
  handleChange: (field: string, value: number) => void
  errors: Record<string, string>
  handleDateChange: (date: Date | null, field: 'start_date' | 'end_date') => void
}) {
  return (
    <div className='grid grid-cols-[1.3fr_1fr_1fr]  gap-x-8 mt-[24px]'>
      <div className='col-span-1 row-span-2'>
        <label className='block text-sm font-medium text-foreground mb-2'>
          Độ ưu tiên <span className='text-red-500'>*</span>
        </label>
        <div className='space-y-2'>
          {[
            { label: 'Cần gấp', value: 3 },
            { label: 'Cao', value: 2 },
            { label: 'Trung bình', value: 1 },
            { label: 'Thấp', value: 0 }
          ]?.map((priority) => (
            <button
              key={priority.value}
              type='button'
              onClick={() => handleChange('priority', priority.value)}
              className={`w-full flex items-center space-x-2 p-2 border cursor-pointer rounded-md transition-colors duration-200 ${
                formData?.priority === priority.value
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 hover:border-blue-300 text-gray-700'
              }`}
            >
              {priority.value === 3 ? (
                <Flame size={16} color='#ef4444' />
              ) : priority.value === 2 ? (
                <ArrowUp size={16} color='#fa7115ff' />
              ) : priority.value === 1 ? (
                <Minus size={16} color='#facc15' />
              ) : (
                <ArrowDown size={16} color='#22c55e' />
              )}
              <span className='capitalize'>{priority.label}</span>
            </button>
          ))}
        </div>
        {errors.priority && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.priority}</p>}
      </div>
      <div className='col-span-2 row-span-2 flex flex-col gap-6'>
        <div className='col-span-1 row-span-'>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Ngày bắt đầu <span className='text-red-500'>*</span>
          </label>
          <DatePicker
            selected={(formData.start_date as Date) ?? null}
            placeholderText='dd/MM/yyyy'
            calendarIconClassName=''
            onChange={(date) => handleDateChange(date, 'start_date')}
            dateFormat='dd/MM/yyyy'
            className='border  text-sm border-zinc-400 px-3 py-2 rounded w-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            portalId='my-popper'
            isClearable={true}
            minDate={new Date()}
          />
          {errors.start_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.start_date}</p>}
        </div>
        <div className='col-span-1'>
          <label className='block text-sm font-medium text-foreground mb-2'>
            Ngày kết thúc <span className='text-red-500'>*</span>
          </label>
          <DatePicker
            selected={(formData.end_date as Date) ?? null}
            placeholderText='dd/MM/yyyy'
            calendarIconClassName=''
            onChange={(date) => handleDateChange(date, 'end_date')}
            dateFormat='dd/MM/yyyy'
            className='border text-sm border-zinc-400 px-3 py-2 rounded w-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            portalId='my-popper'
            isClearable={true}
            minDate={new Date()}
          />
          {errors.end_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.end_date}</p>}
        </div>
      </div>
    </div>
  )
}
