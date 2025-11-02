import React, { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { Calendar } from 'primereact/calendar'
import { InputNumber } from 'primereact/inputnumber'
import { Check, Clock, User, UserCheckIcon } from 'lucide-react'

import { Dropdown as PrimeDropdown } from 'primereact/dropdown'
import type { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '../../../auth/stores/authStore'
import type { Task } from '../../../../types/task'
import { createTaskAPI } from '../../service/task.service'
import type { ApiErrorResponse } from '../../../auth/hooks/useAuth'
import { type, type TypeOption } from '../../../../types/type'
import Dropdown from '../../../../components/Dropdown'
import PrioritySelect from '../../../../components/PrioritySelect'
import DescriptionEditor from '../../../../components/DescriptionEditor'
import Button from '../../../../components/Button'
import { LoadingBlob } from '../../../../components/LoadingBlob'

export default function AddTaskCom({
  setAddModalOpen,
  setAddModalContent,
  onSuccess,
  projectId,
  initialStatusId,
  initialSprintId
}: {
  setAddModalOpen: Dispatch<SetStateAction<boolean>>
  setAddModalContent: Dispatch<SetStateAction<React.ReactNode | null>>
  onSuccess?: () => void
  projectId: string
  initialStatusId?: number
  initialSprintId?: number
}) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState<Partial<Task>>({
    status_id: initialStatusId || undefined,
    reporter_id: user?.user_id,
    project_id: projectId,
    sprint_id: initialSprintId || undefined,
    parent_id: undefined,
    start_date: new Date()
  } as Partial<Task>)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Update status_id when initialStatusId changes
  useEffect(() => {
    if (initialStatusId) {
      setFormData((prev) => ({
        ...prev,
        status_id: initialStatusId
      }))
    }
  }, [initialStatusId])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title) newErrors.title = 'Tên công việc là trường bắt buộc'

    if (formData.priority === undefined || formData.priority < 0) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validate()) {
      try {
        setIsLoading(true)
        await createTaskAPI(formData as Task)

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
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className='flex-1 overflow-y-auto bg-gray-50'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        <div className='p-4 space-y-4'>
          {/* Basic Information Section */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Thông tin cơ bản</h3>

            {/* Title */}
            <div className='flex flex-col gap-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Tên công việc <span className='text-red-500'>*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 text-sm transition-colors focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder='Nhập tên công việc'
                value={formData?.title || ''}
                name='title'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e?.target?.value)}
              />
              {errors.title && <p className='text-xs text-red-500 mt-1'>{errors.title}</p>}
            </div>

            {/* Type */}
            <div className='flex flex-col gap-2'>
              <label className='block text-sm font-medium text-gray-700'>
                Loại công việc <span className='text-red-500'>*</span>
              </label>
              <PrimeDropdown
                id='type'
                name='type'
                value={formData.type}
                itemTemplate={(option: TypeOption) => (
                  <div className='flex items-center gap-2 py-1'>
                    {option.icon}
                    <span className='font-medium text-gray-900'>{option.label}</span>
                  </div>
                )}
                valueTemplate={(option: TypeOption) =>
                  option ? (
                    <div className='flex items-center gap-2'>
                      {option.icon}
                      <span className='font-medium text-gray-900'>{option.label}</span>
                    </div>
                  ) : (
                    <span className='text-gray-400'>Chọn loại công việc</span>
                  )
                }
                options={type}
                onChange={(e) => handleInputChange('type', e?.target?.value)}
                placeholder='Chọn loại công việc'
                className={
                  errors.type
                    ? 'border-red-400 h-[40px] w-full! flex flex-row items-center'
                    : 'border-gray-300 h-[40px] w-full! flex flex-row items-center'
                }
              />
              {errors.type && <p className='text-xs text-red-500 mt-1'>{errors.type}</p>}
            </div>

            {/* Description */}
            <div className='flex flex-col gap-2'>
              <label className='block text-sm font-medium text-gray-700'>Mô tả</label>
              <DescriptionEditor
                placeholder='We support markdown! Try **bold**, `inline code`, or ``` for code blocks.'
                value={formData.description || ''}
                onChange={(val) => setFormData({ ...formData, description: val })}
              />
            </div>
          </div>

          {/* Status & Priority Section */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Trạng thái & Ưu tiên</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Trạng thái <span className='text-red-500'>*</span>
                </label>
                <Dropdown
                  placeholder='status'
                  name='status_id'
                  apiEndPoint={`/status/${projectId}`}
                  onChange={(e) => handleInputChange('status_id', e?.target?.value)}
                  value={(formData.status_id ?? null) as string | number | null}
                  className='h-[40px]!'
                />
                {errors.status_id && <p className='text-xs text-red-500 mt-1'>{errors.status_id}</p>}
              </div>

              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Độ ưu tiên <span className='text-red-500'>*</span>
                </label>
                <PrioritySelect
                  value={(formData.priority ?? 0) as number}
                  className='ml-[0px]! h-[40px]!'
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  showClear={false}
                />
                {errors.priority && <p className='text-xs text-red-500 mt-1'>{errors.priority}</p>}
              </div>
            </div>
          </div>

          {/* Assignees Section */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Phân công</h3>

            <div className='space-y-4'>
              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700 flex items-center gap-1.5'>
                  <User size={16} className='text-gray-600' />
                  Người phụ trách <span className='text-red-500'>*</span>
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
                {errors.assignee_id && <p className='text-xs text-red-500 mt-1'>{errors.assignee_id}</p>}
              </div>

              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700 flex items-center gap-1.5'>
                  <UserCheckIcon size={16} className='text-gray-600' />
                  Người báo cáo <span className='text-red-500'>*</span>
                </label>
                <Dropdown
                  placeholder='reporter'
                  name='reporter_id'
                  apiEndPoint={`/members/dropdown/${projectId}`}
                  onChange={(e) => handleInputChange('reporter_id', e?.target?.value)}
                  value={formData.reporter_id ?? 0}
                  className='h-[40px]! w-full!'
                  avatar={true}
                />
                {errors.reporter_id && <p className='text-xs text-red-500 mt-1'>{errors.reporter_id}</p>}
              </div>
            </div>
          </div>

          {/* Dates & Time Section */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Thời gian</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày bắt đầu <span className='text-red-500'>*</span>
                </label>
                <Calendar
                  id='start_date'
                  value={formData.start_date || new Date()}
                  disabled
                  onChange={(e) => setFormData({ ...formData, start_date: (e.value as Date) || undefined })}
                  dateFormat='dd-mm-yy'
                  placeholder='Chọn ngày bắt đầu'
                  showIcon
                  className={errors.start_date ? 'border-red-400' : ''}
                />
                {errors.start_date && <p className='text-xs text-red-500 mt-1'>{errors.start_date}</p>}
              </div>

              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Ngày hết hạn <span className='text-red-500'>*</span>
                </label>
                <Calendar
                  id='due_date'
                  value={formData.due_date || null}
                  onChange={(e) => setFormData({ ...formData, due_date: (e.value as Date) || undefined })}
                  dateFormat='dd-mm-yy'
                  placeholder='Chọn ngày kết thúc'
                  showIcon
                  className={errors.due_date ? 'border-red-400' : ''}
                />
                {errors.due_date && <p className='text-xs text-red-500 mt-1'>{errors.due_date}</p>}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <label className='block text-sm font-medium text-gray-700 flex items-center gap-1.5'>
                <Clock size={16} className='text-gray-600' />
                Thời gian ước tính (giờ) <span className='text-red-500'>*</span>
              </label>
              <InputNumber
                id='estimate'
                value={formData.estimate ?? null}
                onValueChange={(e) => setFormData({ ...formData, estimate: e.value ?? undefined })}
                mode='decimal'
                minFractionDigits={1}
                placeholder='VD: 8.5'
                className={errors.estimate ? 'border-red-400' : ''}
              />
              {errors.estimate && <p className='text-xs text-red-500 mt-1'>{errors.estimate}</p>}
            </div>
          </div>

          {/* Optional Section */}
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wide'>Tùy chọn</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>Sprint</label>
                <Dropdown
                  placeholder='sprint'
                  name='sprint_id'
                  apiEndPoint={`/sprints/project/${projectId}`}
                  onChange={(e) => handleInputChange('sprint_id', e?.target?.value)}
                  value={formData.sprint_id ?? null}
                  className='h-[40px]! w-full!'
                  valueKey='sprint_id'
                  labelKey='name'
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='block text-sm font-medium text-gray-700'>Công việc liên quan</label>
                <Dropdown
                  placeholder='parent task'
                  name='parent_id'
                  apiEndPoint={`/tasks/dropdown/${projectId}`}
                  onChange={(e) => handleInputChange('parent_id', e?.target?.value)}
                  value={formData.parent_id ?? null}
                  className='h-[40px]! w-full!'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={() => {
              setAddModalOpen(false)
              setAddModalContent(null)
            }}
            className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150'
          >
            Hủy bỏ
          </button>
          <Button type='submit' disabled={isLoading} className='flex items-center gap-2 px-4 py-2 text-sm font-medium'>
            {isLoading ? (
              <LoadingBlob />
            ) : (
              <>
                <Check strokeWidth={1.5} size={18} />
                <span>Tạo công việc</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
