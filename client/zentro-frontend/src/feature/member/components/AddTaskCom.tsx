import React, { useState, type Dispatch, type SetStateAction } from 'react'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { Check, Clock, User, UserCheckIcon } from 'lucide-react'
import type { Task } from '../../../types/task'
import { type, type TypeOption } from '../../../types/type'
import PrioritySelect from '../../../components/PrioritySelect'
import Dropdown from '../../../components/Dropdown'

import { Dropdown as PrimeDropdown } from 'primereact/dropdown'
import DescriptionEditor from '../../../components/DescriptionEditor'
import { useAuthStore } from '../../auth/stores/authStore'
import type { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../auth/hooks/useAuth'
import { toast } from 'sonner'
import { LoadingBlob } from '../../../components/LoadingBlob'
import Button from '../../../components/Button'
import { createTaskAPI } from '../service/task.service'

export default function AddTaskCom({
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
  const [formData, setFormData] = useState<Task>({
    status_id: 1,
    reporter_id: user?.user_id,
    project_id: projectId,
    sprint_id: undefined,
    parent_id: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title) newErrors.title = 'Tên công việc là trường bắt buộc'

    if (!formData.priority) {
      newErrors.priority = 'Độ ưu tiên là trường bắt buộc'
    }

    if (!formData.assignee_id) {
      newErrors.assignee_id = 'Người phụ trách là trường bắt buộc'
    }

    if (!formData.reporter_id) {
      newErrors.reporter_id = 'Người báo cáo là trường bắt buộc'
    }

    if (!formData.estimate) {
      newErrors.estimate = 'Thời gian ước tính là trường bắt buộc'
    }

    if (!formData.type) {
      newErrors.type = 'Loại công việc là trường bắt buộc'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Ngày bắt đầu là trường bắt buộc'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Ngày đến hạn là trường bắt buộc'
    }

    if (formData.start_date && formData.due_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.due_date)

      if (start > end) {
        newErrors.start_date = 'Ngày bắt đầu không được sau ngày đến hạn'
        newErrors.due_date = 'Ngày đến hạn không được trước ngày bắt đầu'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      try {
        setIsLoading(true)
        await createTaskAPI(formData)

        onSuccess?.()
        toast.success('Tạo task thành công!')
        setAddModalOpen(false)
        setAddModalContent(null)
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>
        toast.error(error.response?.data.error.message ?? 'Lỗi khi tạo role!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (field: string, value: number | string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  return (
    <form
      style={{ color: '#1C272D' }}
      className=' relative flex-1 mb-[80px] px-4  overflow-y-auto overflow-hidden relative'
      onSubmit={handleSubmit}
    >
      <div className='flex flex-col gap-2'>
        {/* Title */}
        <div className='flex flex-col gap-2'>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Tên công việc <span className='text-red-500'>*</span>
          </label>
          <input
            className='w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none'
            placeholder='Điền tên công việc của bạn'
            value={formData?.title}
            name='title'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e?.target?.value)}
          />
          {errors.title && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.title}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <label className='block text-sm font-medium text-foreground mb-1'>
            Loại công việc <span className='text-red-500'>*</span>
          </label>
          <PrimeDropdown
            id='type'
            name='type'
            value={formData.type}
            itemTemplate={(option: TypeOption) => (
              <div className='flex items-center gap-2'>
                {option.icon}
                <span className='font-medium'>{option.label}</span>
              </div>
            )}
            valueTemplate={(option: TypeOption) =>
              option ? (
                <div className='flex items-center gap-2'>
                  {option.icon}
                  <span className='font-medium'>{option.label}</span>
                </div>
              ) : (
                <span style={{ color: '#999' }}>Chọn loại công việc</span>
              )
            }
            options={type}
            onChange={(e) => handleInputChange('type', e?.target?.value)}
            placeholder='Chọn loại công việc'
          />
          {errors.type && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.type}</p>}
        </div>

        <div className='border border-gray-200 my-4'></div>

        {/* Project & Sprint */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-foreground mb-1'>
              Trạng thái <span className='text-red-500'>*</span>
            </label>
            <Dropdown
              placeholder='status'
              name='status_id'
              apiEndPoint={`/status/${projectId}`}
              onChange={(e) => handleInputChange('status_id', e?.target?.value)}
              value={formData.status_id}
              className='h-[40px]!'
            />
            {errors.status_id && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.status_id}</p>}
          </div>
          <div>
            <label className='block text-sm font-medium text-foreground mb-1'>
              Độ ưu tiên <span className='text-red-500'>*</span>
            </label>
            <PrioritySelect
              value={formData.priority}
              className='ml-[0px]! h-[40px]!'
              onChange={(val) => setFormData({ ...formData, priority: val })}
            />
            {errors.priority && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.priority}</p>}
          </div>
        </div>

        <div className='flex flex-col gap-2 mt-4'>
          <div className='cols-span-2 flex flex-col gap-1'>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              Mô tả
            </label>
            <DescriptionEditor
              placeholder='We support markdown! Try **bold**, `inline code`, or ``` for code blocks.'
              className=''
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
            />
          </div>
        </div>

        {/* Status & Assignee */}
        <div className='flex flex-col gap-2 mt-4'>
          <div className='cols-span-2 flex flex-col gap-1'>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              <User size={15} /> Người phụ trách <span className='text-red-500'>*</span>
            </label>
            <Dropdown
              placeholder='assignee'
              name='assignee_id'
              apiEndPoint={`/members/dropdown/${projectId}`}
              onChange={(e) => handleInputChange('assignee_id', e?.target?.value)}
              value={formData.assignee_id ?? 0}
              className='h-[40px]! w-full!'
              avatar={true}
            />
            {errors.assignee_id && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.assignee_id}</p>}
          </div>
        </div>

        {/* Reporter & Priority */}
        <div className='flex flex-col gap-2 mt-4'>
          <div className='cols-span-2 flex flex-col gap-1'>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              <UserCheckIcon size={15} /> Người báo cáo <span className='text-red-500'>*</span>
            </label>
            <Dropdown
              placeholder='assignee'
              name='reporter_id'
              apiEndPoint={`/members/dropdown/${projectId}`}
              onChange={(e) => handleInputChange('reporter_id', e?.target?.value)}
              value={formData.reporter_id ?? 0}
              className='h-[40px]! w-full!'
              avatar={true}
            />
            {errors.reporter_id && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.reporter_id}</p>}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div className='cols-span-1 flex flex-col gap-1'>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              Sprint
            </label>
            <Dropdown
              placeholder='assignee'
              name='reporter_id'
              apiEndPoint={`/members/dropdown/${projectId}`}
              onChange={(e) => handleInputChange('reporter_id', e?.target?.value)}
              value={formData.reporter_id ?? 0}
              className='h-[40px]! w-full!'
              avatar={true}
            />
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div className='cols-span-1 flex flex-col gap-1'>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              Công việc liên quan
            </label>
            <Dropdown
              placeholder='assignee'
              name='reporter_id'
              apiEndPoint={`/members/dropdown/${projectId}`}
              onChange={(e) => handleInputChange('reporter_id', e?.target?.value)}
              value={formData.reporter_id ?? 0}
              className='h-[40px]! w-full!'
              avatar={true}
            />
          </div>
        </div>

        {/* Dates */}
        <div className='grid grid-cols-2 gap-4 mt-4'>
          <div>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              Ngày bắt đầu <span className='text-red-500'>*</span>
            </label>
            <Calendar
              id='start_date'
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.value })}
              dateFormat='dd-mm-yy'
              placeholder='Chọn ngày bắt đầu'
              showIcon
            />
            {errors.start_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.start_date}</p>}
          </div>
          <div>
            <label
              htmlFor='assignee_id'
              className='block text-sm font-medium text-foreground mb-1 flex items-center gap-1'
            >
              Ngày hết hạn <span className='text-red-500'>*</span>
            </label>
            <Calendar
              id='due_date'
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.value })}
              dateFormat='dd-mm-yy'
              placeholder='Chọn ngày kết thúc'
              showIcon
            />
            {errors.due_date && <p className='text-sm text-red-500 mt-3 ml-[12px]'>{errors.due_date}</p>}
          </div>
        </div>

        {/* Estimate & Actual */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label htmlFor='estimate' className='flex items-center gap-1'>
              <Clock size={16} /> Thời gian ước tính (giờ)
            </label>
            <InputNumber
              id='estimate'
              value={formData.estimate}
              onValueChange={(e) => setFormData({ ...formData, estimate: e.value })}
              mode='decimal'
              minFractionDigits={1}
              placeholder='VD: 8.5'
            />
          </div>
        </div>
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
