import React, { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Check, Flame, Minus, X } from 'lucide-react'
import type { User } from '../../../../types/user'
import { priorityColors, type } from '../../../../types/type'
import { getMembersByProjectAPI } from '../../../admin/service/user.service'
import Avatar from '../../../../components/Avatar'

interface FilterOptions {
  assignee_id?: string
  priority?: number
  type?: string
}

interface FilterMenuProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: FilterOptions) => void
  currentFilters: FilterOptions
  project_id: string // 🧩 thêm prop để biết project nào đang được lọc
}

export default function FilterMenu({ isOpen, onClose, onApply, currentFilters, project_id }: FilterMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)
  const [members, setMembers] = useState<User[]>([]) // 🧩 danh sách thành viên
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false)

  // 🧩 Gọi API lấy danh sách members khi mở menu
  useEffect(() => {
    if (!isOpen || !project_id) return
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true)
        const res = await getMembersByProjectAPI(project_id)
        setMembers(res?.data || [])
      } catch (err) {
        console.error('❌ Lỗi khi lấy danh sách thành viên:', err)
      } finally {
        setLoadingMembers(false)
      }
    }
    fetchMembers()
  }, [isOpen, project_id])

  // Reset filters khi props thay đổi
  useEffect(() => {
    setLocalFilters(currentFilters)
  }, [currentFilters])

  // Close menu bằng click outside hoặc ESC
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose()
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleClear = () => {
    const emptyFilters: FilterOptions = {}
    setLocalFilters(emptyFilters)
    onApply(emptyFilters)
    onClose()
  }

  const hasActiveFilters =
    localFilters.assignee_id !== undefined || localFilters.priority !== undefined || localFilters.type !== undefined

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center pt-20'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/20' onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        className='relative bg-white rounded-lg shadow-xl w-[400px] max-h-[600px] overflow-hidden'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-900'>Lọc tasks</h3>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>

        {/* Content */}
        <div className='p-4 space-y-6 overflow-y-auto max-h-[400px]'>
          {/* Assignee Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Người thực hiện</label>
            <div className='space-y-1'>
              {loadingMembers ? (
                <p className='text-sm text-gray-500'>Đang tải danh sách...</p>
              ) : members.length === 0 ? (
                <p className='text-sm text-gray-500'>Không có thành viên nào</p>
              ) : (
                members.map((memberWrapper) => {
                  const member = memberWrapper.user
                  const memberName = `${member.first_name} ${member.last_name}`
                  const isSelected = localFilters.assignee_id === member.user_id

                  return (
                    <button
                      key={member.user_id}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          assignee_id: isSelected ? undefined : member.user_id
                        }))
                      }
                      className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className='flex flex-row gap-2'>
                        <Avatar size={20} name={member.first_name} avatarUrl={member.avatar} />
                        <span className='text-sm text-gray-900'>{memberName}</span>
                      </div>
                      {isSelected && <Check size={16} className='text-blue-600' />}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Độ ưu tiên</label>
            <div className='space-y-1'>
              {priorityColors.map((option) => {
                const isSelected = localFilters.priority === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        priority: isSelected ? undefined : option.value
                      }))
                    }
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      {option.icon}
                      <span className='text-sm text-gray-900 font-medium' style={{ color: option.color }}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && <Check size={16} className='text-blue-600' />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Loại công việc</label>
            <div className='space-y-1'>
              {type.map((option) => {
                const isSelected = localFilters.type === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        type: isSelected ? undefined : option.value
                      }))
                    }
                    className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className='flex items-center gap-2'>
                      {option.icon}
                      <span className='text-sm text-gray-800 font-medium'>{option.label}</span>
                      {isSelected && <Check size={16} className='text-blue-600' />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleClear}
            disabled={!hasActiveFilters}
            className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Xóa bộ lọc
          </button>
          <button
            onClick={handleApply}
            className='px-4 py-2 text-sm font-medium text-white rounded-md transition-colors'
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}
