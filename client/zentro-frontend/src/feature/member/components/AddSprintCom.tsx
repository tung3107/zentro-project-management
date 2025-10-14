import React, { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { useAuthStore } from '../../auth/stores/authStore'
import type { Sprint } from '../../../types/sprint'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import Button from '../../../components/Button'
import { LoadingBlob } from '../../../components/LoadingBlob'
import { Check } from 'lucide-react'
import { createSprintAPI } from '../service/sprint.service'

export default function AddSprintCom({
  setAddModalOpen,
  setAddModalContent,
  onSuccess,
  projectId
}: {
  setAddModalOpen: Dispatch<SetStateAction<boolean>>
  setAddModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
  projectId: string
}) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<Sprint>({ project_id: projectId, status: 'planned' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState<number | 'custom' | null>(null)

  const durationOptions = [
    { label: '1 tuần', value: 7 },
    { label: '2 tuần', value: 14 },
    { label: '3 tuần', value: 21 },
    { label: '1 tháng (30 ngày)', value: 30 },
    { label: 'Tùy chỉnh', value: 'custom' }
  ]

  // Tự động cập nhật end_date khi chọn duration cố định
  useEffect(() => {
    if (formData.start_date && duration && duration !== 'custom') {
      const start = new Date(formData.start_date)
      const end = new Date(start)
      end.setDate(start.getDate() + duration - 1)
      setFormData((prev) => ({ ...prev, end_date: end }))
    }
  }, [formData.start_date, duration])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = 'Tên sprint là trường bắt buộc'
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là trường bắt buộc'
    }
    if (!formData.end_date) {
      newErrors.end_date = 'Ngày kết thúc là trường bắt buộc'
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (start > end) {
        newErrors.start_date = 'Ngày bắt đầu không được sau ngày kết thúc'
        newErrors.end_date = 'Ngày kết thúc không hợp lệ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        setIsLoading(true)
        await createSprintAPI(formData)

        onSuccess?.()
        toast.success('Tạo sprint thành công!')
        setAddModalOpen(false)
        setAddModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi tạo sprint!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <form
      style={{ color: '#1C272D' }}
      className='relative flex-1 mb-[80px] px-4 overflow-y-auto overflow-hidden'
      onSubmit={handleSubmit}
    >
      <div className='flex flex-col gap-4'>
        {/* Tên sprint */}
        <div className='flex flex-col gap-2'>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Tên sprint <span className='text-red-500'>*</span>
          </label>
          <input
            className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Điền tên sprint của bạn'
            value={formData?.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name}</p>}
        </div>

        {/* Thời lượng */}
        <div className='flex flex-col gap-2'>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Thời lượng <span className='text-gray-500'>(tự động tính ngày kết thúc)</span>
          </label>
          <Dropdown
            value={duration}
            options={durationOptions}
            onChange={(e) => setDuration(e.value)}
            placeholder='Chọn thời lượng sprint'
            className='w-full'
          />
        </div>

        <div className='border border-gray-200 my-2'></div>

        {/* Ngày bắt đầu & kết thúc */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Ngày bắt đầu <span className='text-red-500'>*</span>
            </label>
            <Calendar
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.value })}
              dateFormat='dd-mm-yy'
              placeholder='Chọn ngày bắt đầu'
              showIcon
            />
            {errors.start_date && <p className='text-sm text-red-500 mt-1'>{errors.start_date}</p>}
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Ngày kết thúc <span className='text-red-500'>*</span>
            </label>
            <Calendar
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.value })}
              dateFormat='dd-mm-yy'
              placeholder='Chọn ngày kết thúc'
              showIcon
              disabled={duration !== 'custom' && duration !== null}
            />
            {errors.end_date && <p className='text-sm text-red-500 mt-1'>{errors.end_date}</p>}
          </div>
        </div>

        {/* Mục tiêu */}
        <div className='flex flex-col gap-2 mt-2'>
          <label className='block text-sm font-medium text-foreground mb-1'>Mục tiêu</label>
          <textarea
            className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
            rows={4}
            placeholder='Mô tả về định hướng của sprint'
            value={formData?.goal ?? ''}
            onChange={(e) => handleInputChange('goal', e.target.value)}
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className='flex justify-end gap-4 px-4 py-4 border-t border-gray-300 fixed bottom-0 left-0 w-full bg-white z-50'>
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
          type='button'
          className='px-4 py-2 text-gray-600 hover:underline'
          onClick={() => {
            setAddModalOpen(false)
            setAddModalContent(null)
          }}
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  )
}
