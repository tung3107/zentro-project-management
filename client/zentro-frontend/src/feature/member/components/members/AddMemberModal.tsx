import { useState, useEffect, useRef } from 'react'
import { X, Search, UserPlus, Loader2 } from 'lucide-react'
import Avatar from '../../../../components/Avatar'
import { getAvailableUsers, type MemberData, type Role } from '../../service/member.service'
import type { User } from '../../../../types/user'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (members: MemberData[]) => void
  roles: Role[]
  projectName: string
  currentMembers: MemberData[]
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onAdd,
  roles,
  projectName,
  currentMembers
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Map<string, { user: User; roleId: number }>>(new Map())
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { projectId } = useParams<{ projectId: string }>()

  const searchAvailableUsers = async (query: string): Promise<User[]> => {
    try {
      const response = await getAvailableUsers(projectId!, query)
      return response.data || []
    } catch (error) {
      console.error('Failed to search users:', error)
      return []
    }
  }

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAvailableUsers([])
      return
    }

    setIsSearching(true)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const users = await searchAvailableUsers(searchQuery.trim())
        setAvailableUsers(users)
      } catch (error) {
        setAvailableUsers([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleToggleUser = (user: User) => {
    const newSelected = new Map(selectedUsers)
    if (newSelected.has(user.user_id)) {
      newSelected.delete(user.user_id)
    } else {
      // Default to first role (usually Member)
      newSelected.set(user.user_id, { user, roleId: roles[0]?.role_id || 1 })
    }
    setSelectedUsers(newSelected)
  }

  const handleRoleChange = (userId: string, roleId: number) => {
    const newSelected = new Map(selectedUsers)
    const existing = newSelected.get(userId)
    if (existing) {
      newSelected.set(userId, { ...existing, roleId })
      setSelectedUsers(newSelected)
    }
  }

  const handleSubmit = () => {
    const membersToAdd = Array.from(selectedUsers.values()).map((item) => ({
      user: {
        user_id: item.user.user_id,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        email: item.user.email,
        avatar: typeof item.user.avatar === 'string' ? item.user.avatar : undefined
      },
      role: {
        role_id: item.roleId,
        role_name: roles.find((r) => r.role_id === item.roleId)?.role_name || 'Member'
      }
    })) as MemberData[]

    // Validate leader count after adding new members
    const allMembers = [...currentMembers, ...membersToAdd]
    const leaderCount = allMembers.filter((m) => m.role.role_id === 7).length

    if (leaderCount > 1) {
      toast.error('Trong một dự án chỉ được có duy nhất 1 Trưởng nhóm')
      return
    }

    if (leaderCount < 1) {
      toast.error('Trong một dự án phải có 1 Trưởng nhóm')
      return
    }

    onAdd(membersToAdd)
    handleClose()
  }

  const handleClose = () => {
    setSearchQuery('')
    setAvailableUsers([])
    setSelectedUsers(new Map())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center' style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col m-4'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>Thêm thành viên vào dự án</h2>
            <p className='text-sm text-gray-500 mt-1'>{projectName}</p>
          </div>
          <button onClick={handleClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors' title='Đóng'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>

        {/* Search section */}
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
            <input
              type='text'
              placeholder='Tìm kiếm người dùng theo tên, email hoặc ID...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              autoFocus
            />
          </div>
        </div>

        {/* Available users list */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>Người dùng có sẵn</h3>

          {isSearching ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='animate-spin text-blue-600' size={32} />
              <span className='ml-3 text-gray-500'>Đang tìm kiếm...</span>
            </div>
          ) : availableUsers.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
              <Search size={48} />
              <p className='mt-3 text-sm'>
                {searchQuery ? 'Không tìm thấy người dùng nào' : 'Nhập tên, email hoặc ID để tìm kiếm'}
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {availableUsers.map((user) => {
                const isSelected = selectedUsers.has(user.user_id)
                return (
                  <div
                    key={user.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleUser(user)}
                  >
                    {/* Checkbox */}
                    <input
                      type='checkbox'
                      checked={isSelected}
                      onChange={() => {}}
                      className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                    />

                    {/* Avatar */}
                    <Avatar avatarUrl={user.avatar as string} name={`${user.first_name} ${user.last_name}`} size={40} />

                    {/* User info */}
                    <div className='flex-1 min-w-0'>
                      <p className='font-medium text-gray-900 truncate'>
                        {user.first_name} {user.last_name}
                      </p>
                      <p className='text-sm text-gray-500 truncate'>{user.email}</p>
                      <p className='text-xs text-gray-400'>ID: {user.user_id}</p>
                    </div>

                    {/* Role selector (only visible when selected) */}
                    {isSelected && (
                      <select
                        value={selectedUsers.get(user.user_id)?.roleId || roles[0]?.role_id}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleRoleChange(user.user_id, Number(e.target.value))
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className='px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected users summary */}
        {selectedUsers.size > 0 && (
          <div className='px-6 py-3 bg-blue-50 border-t border-blue-200'>
            <p className='text-sm text-blue-700'>
              <span className='font-semibold'>{selectedUsers.size}</span> thành viên đã chọn
            </p>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center rounded-2xl justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUsers.size === 0}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            <UserPlus size={18} />
            Thêm {selectedUsers.size > 0 ? `(${selectedUsers.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
