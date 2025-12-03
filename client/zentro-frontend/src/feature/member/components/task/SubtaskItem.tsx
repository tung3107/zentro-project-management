import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Avatar from '../../../../components/Avatar'
import StatusLabel from '../../../../components/StatusLabel'
import type { Task } from '../../../../types/task'
import { updateSubtaskAPI, deleteSubtaskAPI } from '../../service/task.service'
import Dropdown from '../../../../components/Dropdown'
import PrioritySelect from '../../../../components/PrioritySelect'
import { priorityColors } from '../../../../types/type'
import { useProjectRole } from '../../hooks/useProjectRole'
import { toast } from 'sonner'
import ConfirmModal from '../../../../components/ConfirmModal'

interface SubtaskItemProps {
  subtask: Task
  projectId: string
  onUpdated?: () => void
  onDeleted?: () => void
}

export default function SubtaskItem({ subtask, projectId, onUpdated, onDeleted }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(subtask.title)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { permissions } = useProjectRole()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const isInsideMenu = menuRef.current && menuRef.current.contains(target)
      const isInsideDropdown = target.closest('.p-dropdown-panel') || target.closest('.p-overlay')

      if (!isInsideMenu && !isInsideDropdown) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = async () => {
    if (!title.trim()) {
      setTitle(subtask.title)
      setIsEditing(false)
      return
    }

    try {
      await updateSubtaskAPI(subtask.task_id, { title })
      setIsEditing(false)
      onUpdated?.()
    } catch (error) {
      console.error('Failed to update subtask:', error)
    }
  }

  const handleCancel = () => {
    setTitle(subtask.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleDeleteClick = () => {
    if (permissions.canDelete) {
      toast.error('Bạn không có quyền xóa công việc này!')
      return
    }
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteSubtaskAPI(subtask.task_id)
      setShowMenu(false)
      onDeleted?.()
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const handleAssigneeChange = async (value: any) => {
    try {
      await updateSubtaskAPI(subtask.task_id, { assignee_id: value?.value || null })
      onUpdated?.()
    } catch (error) {
      console.error('Failed to update assignee:', error)
    }
  }

  const handleStatusChange = async (value: any) => {
    try {
      await updateSubtaskAPI(subtask.task_id, { status_id: value?.target?.value })
      onUpdated?.()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handlePriorityChange = async (priority: number) => {
    try {
      await updateSubtaskAPI(subtask.task_id, { priority })
      onUpdated?.()
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  const handleSubtaskClick = () => {
    const currentParams = new URLSearchParams(searchParams)
    currentParams.set('task', subtask.task_id.toString())
    const path = window.location.pathname
    navigate(`${path}?${currentParams.toString()}`)
  }

  return (
    <div className='group flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-md transition-colors border-b border-gray-200 last:border-b-0'>
      {/* Icon placeholder - can add checkbox later */}
      <div className='w-5 h-5 flex items-center justify-center flex-shrink-0'>
        <div
          className='w-2 h-2 rounded-full'
          style={{ backgroundColor: priorityColors.find((p) => p.value === subtask.priority)?.color || '#gray' }}
        />
      </div>

      {/* Subtask Title */}
      {isEditing ? (
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className='flex-1 px-2 py-1 text-md font-medium border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
        />
      ) : (
        <div
          className='flex-1 text-md font-medium text-gray-800 cursor-pointer hover:text-blue-600'
          onClick={(e) => {
            e.stopPropagation()
            handleSubtaskClick()
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          {subtask.title}
        </div>
      )}

      {/* Status Label */}
      <div className='flex-shrink-0'>
        <StatusLabel value={subtask.status_id ?? null} apiEndPoint={`/status/${projectId}`} />
      </div>

      {/* Assignee Avatar */}
      <div className='flex-shrink-0'>
        <Avatar
          name={subtask?.assignee?.first_name || subtask.assignee?.last_name || 'User'}
          size={24}
          avatarUrl={subtask?.assignee?.avatar}
        />
      </div>

      {/* Menu Button */}
      <div className='relative flex-shrink-0'>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className='opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity'
        >
          <MoreVertical size={16} className='text-gray-500' />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className='absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Assignee Dropdown */}
            <div className='px-3 py-2 border-b border-gray-100' onClick={(e) => e.stopPropagation()}>
              <label className='block text-xs font-medium text-gray-600 mb-1'>Người thực hiện</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  placeholder='Chọn người'
                  name='assignee_id'
                  apiEndPoint={`/members/dropdown/${projectId}`}
                  onChange={handleAssigneeChange}
                  value={subtask.assignee_id || null}
                  className='w-full h-[32px]!'
                  avatar={true}
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className='px-3 py-2 border-b border-gray-100' onClick={(e) => e.stopPropagation()}>
              <label className='block text-xs font-medium text-gray-600 mb-1'>Trạng thái</label>
              <div onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  placeholder='status'
                  name='status_id'
                  apiEndPoint={`/status/${projectId}`}
                  onChange={handleStatusChange}
                  value={subtask.status_id ?? null}
                  className='w-full h-[32px]!'
                  showClear={false}
                />
              </div>
            </div>

            {/* Priority Dropdown */}
            <div className='px-3 py-2 border-b border-gray-100' onClick={(e) => e.stopPropagation()}>
              <label className='block text-xs font-medium text-gray-600 mb-1'>Độ ưu tiên</label>
              <div onClick={(e) => e.stopPropagation()}>
                <PrioritySelect
                  value={subtask.priority ?? 0}
                  onChange={handlePriorityChange}
                  className='w-full h-[32px]! ml-0!'
                  showClear={false}
                />
              </div>
            </div>

            {/* Delete Option */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick()
              }}
              className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors'
            >
              Xóa subtask
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title='Xóa công việc phụ'
        message='Bạn có chắc chắn muốn xóa công việc phụ này?'
        confirmText='Xóa'
        confirmButtonColor='bg-red-600 hover:bg-red-700'
      />
    </div>
  )
}
