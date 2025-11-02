import React, { useEffect, useRef, useState } from 'react'
import type { Chat } from '../../../../types/chat'
import { Plus, Search, UserPlus, Users, UsersRound } from 'lucide-react'
import { formatTime } from '../../../../util/helper'
import Avatar from '../../../../components/Avatar'
import { useAuthStore } from '../../../auth/stores/authStore'

export default function ChatSideBar({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat
}: {
  chats: Chat[]
  selectedChatId: number | null
  onSelectChat: (chatId: number) => void
  onCreateChat: (type: 'single' | 'group') => void
}) {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatMenu, setShowNewChatMenu] = useState(false)
  const [, setUpdateTrigger] = useState(0) // Force re-render for time updates
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Get email for 1-1 chat
  const getOtherUserEmail = (chat: Chat) => {
    if (chat.is_group || !chat.memberDetails || !user) return null
    const otherUser = chat.memberDetails.find((m) => m.user_id !== user.user_id)
    return otherUser?.email
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNewChatMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update time display every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className='w-80 border-r border-gray-200 flex flex-col bg-white'>
      <div className='p-4 border-b border-gray-200'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold' style={{ color: 'var(--primary)' }}>
            Tin nhắn
          </h1>
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setShowNewChatMenu(!showNewChatMenu)}
              className='p-2 rounded-full text-white transition-colors shadow-md cursor-pointer hover:bg-[var(--primary-light)] hover:shadow-lg'
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={20} />
            </button>

            {showNewChatMenu && (
              <div className='absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                <button
                  onClick={() => {
                    onCreateChat('single')
                    setShowNewChatMenu(false)
                  }}
                  className='w-full px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3 group'
                >
                  <div className='p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors'>
                    <UserPlus size={18} className='text-blue-600' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>Chat với 1 người</div>
                    <div className='text-xs text-gray-500'>Bắt đầu trò chuyện mới</div>
                  </div>
                </button>

                <div className='h-px bg-gray-100 my-1'></div>

                <button
                  onClick={() => {
                    onCreateChat('group')
                    setShowNewChatMenu(false)
                  }}
                  className='w-full px-4 py-3 cursor-pointer text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group'
                >
                  <div className='p-2 rounded-full bg-purple-50 group-hover:bg-purple-100 transition-colors'>
                    <UsersRound size={18} className='text-purple-600' />
                  </div>
                  <div>
                    <div className='font-medium text-gray-900'>Tạo nhóm chat</div>
                    <div className='text-xs text-gray-500'>Thêm nhiều người vào nhóm</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            placeholder='Tìm kiếm...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {filteredChats.map((chat) => (
          <div
            key={chat.chat_id}
            onClick={() => onSelectChat(chat.chat_id)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChatId === chat.chat_id ? 'bg-blue-50' : ''
            }`}
          >
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Avatar avatarUrl={chat.avatar} name={chat.name} size={42} />
                {chat.is_group && (
                  <div className='absolute -bottom-1 -right-1 bg-white rounded-full p-1'>
                    <Users size={12} style={{ color: 'var(--primary)' }} />
                  </div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-semibold text-gray-900 truncate'>{chat.name}</h3>
                  {chat.lastMessageTime && (
                    <span className='text-xs text-gray-500'>{formatTime(chat.lastMessageTime)}</span>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-gray-500 truncate'>
                    {!chat.is_group && !chat.lastMessage ? getOtherUserEmail(chat) : chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span
                      className='ml-2 px-2 py-0.5 text-xs text-white rounded-full'
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
