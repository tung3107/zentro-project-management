import { useState, useRef, useEffect } from 'react'
import { Link, Trash2, Plus, Search, X } from 'lucide-react'
import { type as taskTypes, priorityColors } from '../../../../types/type'
import type { Task } from '../../../../types/task'
import { createTaskLinkAPI, deleteTaskLinkAPI, searchTasksForMentionAPI } from '../../service/task.service'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '../../../auth/hooks/useAuth'

interface LinkedTasksSectionProps {
  taskId: number
  projectId: string
  linkedTasks: Array<{
    task_id: string
    linked_task_id: string
    linkedTask: Task
  }>
  onLinkedTasksUpdated: () => void
}

export default function LinkedTasksSection({
  taskId,
  projectId,
  linkedTasks,
  onLinkedTasksUpdated
}: LinkedTasksSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdding(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }

    if (isAdding) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAdding])

  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

      searchDebounceRef.current = setTimeout(async () => {
        setIsSearching(true)
        try {
          const res = await searchTasksForMentionAPI(projectId, searchQuery)
          const filteredResults = (res.data || []).filter(
            (task: Task) =>
              task.task_id !== taskId && !linkedTasks.some((link) => link.linked_task_id === task.task_id.toString())
          )
          setSearchResults(filteredResults)
        } catch (err) {
          console.error('Search failed:', err)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, projectId, taskId, linkedTasks])

  const handleAddLink = async (linkedTaskId: number) => {
    try {
      await createTaskLinkAPI(taskId, linkedTaskId)
      setSearchQuery('')
      setSearchResults([])
      setIsAdding(false)
      onLinkedTasksUpdated()
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>
      toast.error(error.response?.data.error.message ?? 'Lỗi khi tạo role!')
    }
  }

  const handleDeleteLink = async (linkedTaskId: string) => {
    if (!confirm('Bạn có chắc muốn xóa liên kết này?')) return

    setIsDeleting(linkedTaskId)
    try {
      await deleteTaskLinkAPI(taskId, Number(linkedTaskId))
      onLinkedTasksUpdated()
    } catch (err) {
      console.error('Failed to delete link:', err)
      alert('Không thể xóa liên kết. Vui lòng thử lại.')
    } finally {
      setIsDeleting(null)
    }
  }

  const getTaskIcon = (type: string) => {
    const taskType = taskTypes.find((t) => t.value === type)
    return taskType?.icon || null
  }

  const getPriorityColor = (priority: number) => {
    const priorityInfo = priorityColors.find((p) => p.value === priority)
    return priorityInfo?.color || '#9ca3af'
  }

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-4'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900 transition-colors cursor-pointer'
      >
        <div className='flex items-center gap-2'>
          <Link size={16} />
          <span>Task liên quan</span>
          {linkedTasks.length > 0 && (
            <span className='px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium'>
              {linkedTasks.length}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {isOpen && (
        <div className='space-y-2'>
          {/* Linked Tasks List */}
          {linkedTasks.length > 0 ? (
            <div className='space-y-2 mb-3'>
              {linkedTasks.map((link) => {
                const task = link.linkedTask
                return (
                  <div
                    key={link.linked_task_id}
                    className='group flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all'
                  >
                    {/* Task Icon */}
                    <div className='flex-shrink-0' title={task.type}>
                      {getTaskIcon(task.type)}
                    </div>

                    {/* Task ID */}
                    <span className='text-xs font-mono text-gray-500 flex-shrink-0'>{task.task_id}</span>

                    {/* Task Title */}
                    <span className='flex-1 text-sm font-medium text-gray-800 truncate group-hover:text-blue-700'>
                      {task.title}
                    </span>

                    {/* Status */}
                    {task.status && (
                      <span
                        className='px-2 py-1 text-[10px] font-semibold rounded flex-shrink-0'
                        style={{
                          backgroundColor: task.status.color + '20',
                          color: task.status.color
                        }}
                      >
                        {task.status.name}
                      </span>
                    )}

                    {/* Priority Indicator */}
                    <div
                      className='w-2 h-2 rounded-full flex-shrink-0'
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                      title={priorityColors.find((p) => p.value === task.priority)?.label}
                    />

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteLink(link.linked_task_id)}
                      disabled={isDeleting === link.linked_task_id}
                      className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all disabled:opacity-50'
                      title='Xóa liên kết'
                    >
                      {isDeleting === link.linked_task_id ? (
                        <div className='w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <Trash2 size={14} className='text-red-600' />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            !isAdding && (
              <div className='text-sm text-gray-500 text-center py-3 border border-dashed border-gray-300 rounded-lg'>
                Chưa có task liên quan
              </div>
            )
          )}

          {/* Add Link Section */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className='w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'
            >
              <Plus size={16} />
              Thêm task liên quan
            </button>
          ) : (
            <div ref={dropdownRef} className='relative'>
              <div className='flex items-center gap-2 p-2 border border-blue-400 rounded-lg bg-white shadow-sm'>
                <Search size={16} className='text-gray-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='Tìm kiếm task...'
                  className='flex-1 text-sm outline-none'
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className='p-1 hover:bg-gray-100 rounded'
                >
                  <X size={14} className='text-gray-500' />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {(isSearching || searchResults.length > 0) && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-50'>
                  {isSearching ? (
                    <div className='flex items-center justify-center py-4'>
                      <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                      <span className='ml-2 text-sm text-gray-600'>Đang tìm kiếm...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((task) => (
                      <button
                        key={task.task_id}
                        onClick={() => handleAddLink(task.task_id)}
                        className='w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-0'
                      >
                        <div className='flex-shrink-0'>{getTaskIcon(task.type)}</div>
                        <span className='text-xs font-mono text-gray-500 flex-shrink-0'>{task.task_id}</span>
                        <span className='flex-1 text-sm font-medium text-gray-800 truncate'>{task.title}</span>
                        {task.status && (
                          <span
                            className='px-2 py-1 text-[10px] font-semibold rounded flex-shrink-0'
                            style={{
                              backgroundColor: task.status.color + '20',
                              color: task.status.color
                            }}
                          >
                            {task.status.name}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    searchQuery.trim() && (
                      <div className='text-sm text-gray-500 text-center py-4'>Không tìm thấy task nào</div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
