import { useEffect, useRef, useState } from 'react'
import { X, Trash2, Check } from 'lucide-react'
import { priorityColors, type, type TypeOption } from '../../../../types/type'
import type { Task } from '../../../../types/task'
import Dropdown from '../../../../components/Dropdown'
import PrioritySelect from '../../../../components/PrioritySelect'
import { Dropdown as PrimeDropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import DescriptionEditor from '../../../../components/DescriptionEditor'
import { useAuthStore } from '../../../auth/stores/authStore'
import CommentSection from '../comment/CommentSection'
import { getOneTaskAPI, updateTaskAPI } from '../../service/task.service'
import { useParams, useSearchParams } from 'react-router-dom'
import SubtaskList from './SubtaskList'

const InputNumber = ({ value, onValueChange, placeholder, className }: any) => (
  <input
    type='number'
    step='0.1'
    value={value || ''}
    onChange={(e) => onValueChange({ value: e.target.value ? parseFloat(e.target.value) : null })}
    placeholder={placeholder}
    className={`${className} px-3 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors`}
  />
)

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
  members?: any[]
  statuses?: any[]
  types?: any[]
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export default function TaskDetailModal({ isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [formData, setFormData] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const { projectId } = useParams()
  const [searchParams] = useSearchParams()
  const taskId = searchParams.get('task')

  const { user } = useAuthStore()

  useEffect(() => {
    if (!isOpen || !taskId) return
    const fetchTask = async () => {
      setIsLoading(true)
      try {
        const res = await getOneTaskAPI(Number(taskId))
        setFormData(res.data)
        setSaveState('idle')
        setLastSavedAt(null)
      } catch (err) {
        console.error('Lỗi khi lấy task:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTask()
  }, [isOpen, taskId])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const autoSave = (updated: Task) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveState('saving')

    debounceRef.current = setTimeout(async () => {
      try {
        await updateTaskAPI(updated)
        setSaveState('saved')
        setLastSavedAt(new Date())
        onUpdate?.()
        setTimeout(() => setSaveState('idle'), 2000)
      } catch (err) {
        console.error('Auto save failed', err)
        setSaveState('error')
        setTimeout(() => setSaveState('idle'), 2500)
      }
    }, 800)
  }

  const handleChange = (field: keyof Task, value: any) => {
    if (!formData) return
    const updated = { ...formData, [field]: value } as Task
    setFormData(updated)
    autoSave(updated)
  }

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onClose()
      onUpdate?.()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const timeAgo = (d: Date | null) => {
    if (!d) return ''
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 5) return 'vừa xong'
    if (diff < 60) return `${diff}s`
    const m = Math.floor(diff / 60)
    if (m < 60) return `${m} phút`
    const h = Math.floor(m / 60)
    return `${h} giờ`
  }

  const renderSkeleton = () => (
    <div className='animate-pulse flex' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className='flex-1 px-6 py-5 space-y-6 border-r border-gray-200 bg-white'>
        <div className='h-6 bg-gray-200 rounded w-1/3'></div>
        <div className='h-24 bg-gray-100 rounded'></div>
        <div className='h-6 bg-gray-200 rounded w-1/4'></div>
        <div className='h-10 bg-gray-100 rounded w-2/3'></div>
        <div className='h-40 bg-gray-100 rounded'></div>
      </div>
      <div className='w-[350px] px-5 py-5 bg-gray-50 space-y-5'>
        <div className='h-5 bg-gray-200 rounded w-1/2'></div>
        <div className='h-10 bg-white rounded border border-gray-200'></div>
        <div className='h-10 bg-white rounded border border-gray-200'></div>
        <div className='h-10 bg-white rounded border border-gray-200'></div>
      </div>
    </div>
  )

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      <div className='relative bg-white rounded-lg shadow-2xl w-full max-w-[95%] max-h-[95vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-5 border-b border-gray-100 bg-white'>
          <div className='flex items-center gap-3'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: priorityColors.find((p) => p.value === formData?.priority)?.color }}
            />
            <div className='flex flex-col'>
              <div className='flex items-center gap-2'>
                {/* preserve title color with class + inline fallback style */}
                <h2
                  className='text-lg font-semibold task-header-title'
                  style={{ color: 'var(--task-title-color, #0f172a)' }}
                >
                  {isLoading ? 'Đang tải...' : formData?.title || 'Chi tiết công việc'}
                </h2>
                <span className='text-xs text-gray-400 px-2 py-0.5 bg-gray-50 rounded'>
                  {isLoading ? 'Đang tải...' : formData?.task_id || 'Chi tiết công việc'}
                </span>
              </div>
              <div className='text-sm text-gray-500'>Task • Project ID: {projectId}</div>
            </div>
          </div>

          {/* save indicator */}
          <div className='flex items-center gap-3'>
            <div aria-live='polite' className='flex items-center gap-2 text-sm'>
              {saveState === 'saving' && (
                <div className='flex items-center gap-2'>
                  <svg className='w-4 h-4 animate-spin text-blue-600' viewBox='0 0 24 24' fill='none'>
                    <circle cx='12' cy='12' r='10' stroke='rgba(59,130,246,0.15)' strokeWidth='4'></circle>
                    <path d='M4 12a8 8 0 018-8' stroke='rgb(59,130,246)' strokeWidth='4' strokeLinecap='round'></path>
                  </svg>
                  <span className='text-blue-600 font-medium'>Đang lưu…</span>
                </div>
              )}
              {saveState === 'saved' && (
                <div className='flex items-center gap-2'>
                  <Check size={16} className='text-green-600' />
                  <span className='text-green-600 font-medium'>Đã lưu</span>
                </div>
              )}
              {saveState === 'error' && (
                <div className='flex items-center gap-2'>
                  <span className='text-red-600 font-medium'>Lỗi khi lưu</span>
                </div>
              )}
              {saveState === 'idle' && lastSavedAt && (
                <div className='text-sm text-gray-500'>{`Đã lưu • ${timeAgo(lastSavedAt)} trước`}</div>
              )}
            </div>

            {/* actions */}
            <div className='flex items-center gap-2'>
              <button
                onClick={handleDelete}
                className='p-2 hover:bg-red-50 rounded-md transition-colors'
                title='Xóa'
                disabled={isLoading}
              >
                <Trash2 size={16} className='text-red-600' />
              </button>
              <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-md transition-colors'>
                <X size={18} className='text-gray-600' />
              </button>
            </div>
          </div>
        </div>

        {/* Body - 2 Column Layout */}
        <div className='overflow-y-auto bg-gray-50' style={{ maxHeight: 'calc(90vh - 72px)' }}>
          {isLoading || !formData ? (
            renderSkeleton()
          ) : (
            <div className='flex p-6 gap-5'>
              {/* Main Content - Left Column */}
              <div className='flex-1 space-y-6'>
                {/* Title Field */}
                <div className='bg-white rounded-xl border border-gray-200 p-4'>
                  <label className='block text-xs font-medium text-gray-500 mb-2'>Tên công việc</label>
                  <input
                    type='text'
                    value={formData?.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className='w-full text-lg font-semibold text-slate-900 px-3 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 transition-shadow'
                    placeholder='Nhập tên công việc'
                  />
                </div>

                {/* Description */}
                <div className='bg-white rounded-xl border border-gray-200 p-4'>
                  <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className='flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900 transition-colors cursor-pointer'
                  >
                    <span>Mô tả</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </button>
                  {isDescriptionOpen && (
                    <div className='border border-gray-200 rounded-md hover:border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white'>
                      <DescriptionEditor
                        placeholder='We support markdown! Try **bold**, `inline code`, or ``` for code blocks.'
                        className='w-full'
                        value={formData?.description}
                        onChange={(val) => handleChange('description', val)}
                      />
                    </div>
                  )}
                </div>

                {/* Subtasks Section - Only show if task is not a subtask */}
                {formData && formData.type !== 'subtask' && !formData.parent_id && (
                  <SubtaskList
                    subtasks={formData.subtasks || []}
                    parentTaskId={formData.task_id}
                    projectId={projectId || ''}
                    onSubtaskAdded={() => {
                      const fetchTask = async () => {
                        try {
                          const res = await getOneTaskAPI(Number(taskId))
                          setFormData(res.data)
                          onUpdate?.()
                        } catch (err) {
                          console.error('Lỗi khi lấy task:', err)
                        }
                      }
                      fetchTask()
                    }}
                    onSubtaskUpdated={() => {
                      const fetchTask = async () => {
                        try {
                          const res = await getOneTaskAPI(Number(taskId))
                          setFormData(res.data)
                          onUpdate?.()
                        } catch (err) {
                          console.error('Lỗi khi lấy task:', err)
                        }
                      }
                      fetchTask()
                    }}
                    onSubtaskDeleted={() => {
                      const fetchTask = async () => {
                        try {
                          const res = await getOneTaskAPI(Number(taskId))
                          setFormData(res.data)
                          onUpdate?.()
                        } catch (err) {
                          console.error('Lỗi khi lấy task:', err)
                        }
                      }
                      fetchTask()
                    }}
                  />
                )}

                {/* Comment Section */}
                <div
                  className='bg-white rounded-xl border border-gray-200 px-6 py-4'
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <CommentSection
                    taskId={formData?.task_id?.toString() || ''}
                    currentUser={
                      user?.user_id ? { id: user.user_id, name: user.first_name || 'User' } : { id: '', name: 'User' }
                    }
                  />
                </div>
              </div>

              {/* Sidebar - Right Column */}
              <div
                className='w-[350px] bg-white rounded-xl border border-gray-200 p-5 space-y-5'
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {/* Status */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Trạng thái
                  </label>
                  <Dropdown
                    placeholder='status'
                    name='status_id'
                    apiEndPoint={`/status/${projectId}`}
                    onChange={(e) => handleChange('status_id', e?.target?.value)}
                    value={formData.status_id ?? null}
                    className='w-full h-[40px]!'
                    showClear={false}
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Người thực hiện
                  </label>
                  <Dropdown
                    placeholder='assignee'
                    name='assignee_id'
                    apiEndPoint={`/members/dropdown/${projectId}`}
                    onChange={(e) => handleChange('assignee_id', e?.target?.value)}
                    value={formData.assignee_id ?? 0}
                    className='h-[40px]! w-full!'
                    avatar={true}
                    showClear={false}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Độ ưu tiên
                  </label>
                  <PrioritySelect
                    value={formData.priority}
                    showClear={false}
                    className='ml-[0px]! h-[40px]! w-full!'
                    onChange={(val) => handleChange('priority', val)}
                  />
                </div>

                {/* Type */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>Loại</label>
                  <PrimeDropdown
                    id='type'
                    name='type'
                    value={formData.type}
                    disabled={formData.type === 'subtask' ? true : false}
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
                    onChange={(e) => handleChange('type', e?.target?.value)}
                    placeholder='Chọn loại công việc'
                    className='h-[40px]! w-full! flex flex-row items-center'
                  />
                </div>

                {/* Sprint */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Sprint
                  </label>
                  <div className='border border-gray-400 rounded-md'>
                    <Dropdown
                      placeholder='sprint'
                      name='sprint_id'
                      apiEndPoint={`/sprints/project/${projectId}`}
                      onChange={(e) => handleChange('sprint_id', e?.target?.value)}
                      value={formData.sprint_id ?? null}
                      className='h-[40px]! w-full!'
                      valueKey='sprint_id'
                      labelKey='name'
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className='border-t border-gray-200 my-4'></div>

                {/* Dates */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Ngày bắt đầu
                  </label>
                  <Calendar
                    id='start_date'
                    value={formData.start_date ? new Date(formData.start_date) : undefined}
                    onChange={(e) => handleChange('start_date', e?.value)}
                    dateFormat='dd-mm-yy'
                    showIcon
                    className='h-[40px]! w-full!'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Hạn hoàn thành
                  </label>
                  <Calendar
                    id='end_date'
                    value={formData.due_date ? new Date(formData.due_date) : undefined}
                    onChange={(e) => handleChange('due_date', e?.value)}
                    dateFormat='dd-mm-yy'
                    showIcon
                    className='h-[40px]! w-full!'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Người báo cáo
                  </label>
                  <Dropdown
                    placeholder='assignee'
                    name='reporter_id'
                    apiEndPoint={`/members/dropdown/${projectId}`}
                    onChange={(e) => handleChange('reporter_id', e?.target?.value)}
                    value={formData.reporter_id ?? 0}
                    className='h-[40px]! w-full!'
                    avatar={true}
                    disabled={true}
                    showClear={false}
                  />
                </div>

                {/* Divider */}
                <div className='border-t border-gray-200 my-4'></div>

                {/* Time Tracking */}
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Ước tính (giờ)
                  </label>
                  <InputNumber
                    value={formData?.estimate}
                    onValueChange={(e: { value: number | null }) => handleChange('estimate', e.value || undefined)}
                    placeholder='0h'
                    className='w-full h-[40px]! bg-white'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2'>
                    Đã dùng (giờ)
                  </label>
                  <InputNumber
                    value={formData?.spent_time}
                    onValueChange={(e: { value: number | null }) => handleChange('spent_time', e.value || undefined)}
                    placeholder='0h'
                    className='w-full h-[40px]! bg-white'
                  />
                </div>

                {/* Time Progress Bar */}
                {formData?.estimate && formData.estimate > 0 && (
                  <div className='pt-2'>
                    <div className='flex justify-between text-xs text-gray-600 mb-1'>
                      <span>Tiến độ</span>
                      <span>{Math.round(((formData.spent_time || 0) / formData.estimate) * 100)}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all'
                        style={{
                          width: `${Math.min(((formData.spent_time || 0) / formData.estimate) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
