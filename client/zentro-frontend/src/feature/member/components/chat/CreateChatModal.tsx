import React, { useRef, useState, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'
import Avatar from '../../../../components/Avatar'
import type { User } from '../../../../types/user'
import axiosClient from '../../../../util/axiosClient'
import { searchUserAPI } from '../../../admin/service/user.service'
import { useAuthStore } from '../../../auth/stores/authStore'

export default function CreateChatModal({
  type,
  onClose,
  onCreate
}: {
  type: 'single' | 'group'
  onClose: () => void
  onCreate: (selectedUsers: User[], groupName?: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [groupName, setGroupName] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { user } = useAuthStore()

  // Get current user and auto select for group chat
  useEffect(() => {
    if (user) {
      setCurrentUserId(user.user_id)
      // Auto select current user for group chat
      if (type === 'group') {
        setSelectedUsers([user])
      }
    }
  }, [type, user])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]) // clear danh sách user
      return
    }
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      loadUsers(searchQuery)
    }, 400)

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const loadUsers = async (query: string) => {
    try {
      setSearching(true)
      const response = await searchUserAPI(query)
      const userData = response.data

      // Format users to have name field
      const formattedUsers = userData.map((u: any) => ({
        ...u,
        name: `${u.first_name} ${u.last_name}`
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setSearching(false)
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleUser = (user: User) => {
    // Không cho unselect creator trong group chat
    if (type === 'group' && user.user_id === currentUserId) {
      return
    }

    if (type === 'single') {
      setSelectedUsers([user])
    } else {
      setSelectedUsers((prev) =>
        prev.find((u) => u.user_id === user.user_id) ? prev.filter((u) => u.user_id !== user.user_id) : [...prev, user]
      )
    }
  }

  const handleCreate = () => {
    if (selectedUsers.length === 0) return
    onCreate(selectedUsers, type === 'group' ? groupName : undefined)
  }

  return (
    <div
      onClick={handleBackdropClick}
      className='fixed inset-0 bg-[#2b2b2b52] flex items-center justify-center z-50 p-4'
    >
      <div ref={modalRef} className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-bold text-gray-900'>{type === 'group' ? 'Tạo nhóm chat' : 'Chat mới'}</h2>
            <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
              <X size={20} />
            </button>
          </div>

          {type === 'group' && (
            <input
              type='text'
              placeholder='Tên nhóm...'
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mb-4'
            />
          )}

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Tìm người...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2'>
              {selectedUsers.map((selectedUser) => {
                const userName = `${selectedUser.first_name} ${selectedUser.last_name}`
                const isCreator = selectedUser.user_id === currentUserId
                return (
                  <div
                    key={selectedUser.user_id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      isCreator ? 'bg-green-50' : 'bg-blue-50'
                    }`}
                  >
                    <span className={`text-sm ${isCreator ? 'text-green-700' : 'text-blue-700'}`}>
                      {userName} {isCreator && '(Bạn)'}
                    </span>
                    {type === 'group' && !isCreator && (
                      <button onClick={() => toggleUser(selectedUser)} className='hover:bg-blue-100 rounded-full p-0.5'>
                        <X size={14} className='text-blue-700' />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* User List */}
        <div className='flex-1 overflow-y-auto p-4'>
          {loading || searching ? (
            <div className='text-center py-8 text-gray-500'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
              <p className='mt-2'>{loading ? 'Đang tải...' : 'Đang tìm kiếm...'}</p>
            </div>
          ) : users.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </div>
          ) : (
            users.map((user) => {
              const isSelected = selectedUsers.find((u) => u.user_id === user.user_id)
              const userName = `${user.first_name} ${user.last_name}`
              const isCreator = user.user_id === currentUserId

              return (
                <div
                  key={user.user_id}
                  onClick={() => toggleUser(user)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCreator && type === 'group' ? 'bg-green-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <Avatar
                    avatarUrl={typeof user.avatar === 'string' ? user.avatar : undefined}
                    name={userName}
                    size={40}
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-gray-900 truncate'>
                      {userName} {isCreator && '(Bạn)'}
                    </h3>
                    <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                    <p className='text-xs text-gray-400'>ID: {user.user_id}</p>
                  </div>
                  {isSelected && (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isCreator ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                    >
                      <Check size={14} className='text-white' />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-gray-200'>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || (type === 'group' && !groupName.trim())}
            className='w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
          >
            {type === 'group' ? `Tạo nhóm (${selectedUsers.length})` : 'Bắt đầu chat'}
          </button>
        </div>
      </div>
    </div>
  )
}
