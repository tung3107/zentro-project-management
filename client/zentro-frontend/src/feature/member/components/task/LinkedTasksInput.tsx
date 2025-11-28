import { useState, useRef, useEffect } from 'react'
import { Link, X, Search, Plus } from 'lucide-react'
import { type as taskTypes } from '../../../../types/type'
import type { Task } from '../../../../types/task'
import { searchTasksForMentionAPI } from '../../service/task.service'

interface LinkedTasksInputProps {
  projectId: string
  linkedTaskIds: number[]
  onLinkedTasksChange: (taskIds: number[]) => void
}

export default function LinkedTasksInput({ projectId, linkedTaskIds, onLinkedTasksChange }: LinkedTasksInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([])
  const [isSearching, setIsSearching] = useState(false)
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
          const filteredResults = (res.data || []).filter((task: Task) => !linkedTaskIds.includes(task.task_id))
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
  }, [searchQuery, projectId, linkedTaskIds])

  const handleAddLink = (task: Task) => {
    const newLinkedTaskIds = [...linkedTaskIds, task.task_id]
    onLinkedTasksChange(newLinkedTaskIds)
    setLinkedTasks([...linkedTasks, task])
    setSearchQuery('')
    setSearchResults([])
    setIsAdding(false)
  }

  const handleRemoveLink = (taskId: number) => {
    const newLinkedTaskIds = linkedTaskIds.filter((id) => id !== taskId)
    onLinkedTasksChange(newLinkedTaskIds)
    setLinkedTasks(linkedTasks.filter((t) => t.task_id !== taskId))
  }

  const getTaskIcon = (type: string) => {
    const taskType = taskTypes.find((t) => t.value === type)
    return taskType?.icon || null
  }

  return (
    <div className='flex flex-col gap-2'>
      <label className='block text-sm font-medium text-gray-700 flex items-center gap-2'>
        <Link size={16} className='text-gray-600' />
        Task liên quan
        {linkedTasks.length > 0 && (
          <span className='px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium'>
            {linkedTasks.length}
          </span>
        )}
      </label>

      {/* Linked Tasks List */}
      {linkedTasks.length > 0 && (
        <div className='space-y-2 mb-2'>
          {linkedTasks.map((task) => (
            <div
              key={task.task_id}
              className='group flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all'
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

              {/* Remove Button */}
              <button
                type='button'
                onClick={() => handleRemoveLink(task.task_id)}
                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all'
                title='Xóa'
              >
                <X size={14} className='text-red-600' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Section */}
      {!isAdding ? (
        <button
          type='button'
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
              type='button'
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
                    type='button'
                    onClick={() => handleAddLink(task)}
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
  )
}
