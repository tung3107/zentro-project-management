import { useState, useEffect } from 'react'
import SettingsPanel from '../components/chat/SettingsPanel'
import ChatInput from '../components/chat/ChatInput'
import ChatMessage from '../components/chat/ChatMessage'
import ChatHeader from '../components/chat/ChatHeader'
import ChatSideBar from '../components/chat/ChatSideBar'
import BlockedChatUI from '../components/chat/BlockedChatUI'
import type { Chat, Message, MediaFile } from '../../../types/chat'
import type { User } from '../../../types/user'
import CreateChatModal from '../components/chat/CreateChatModal'
import chatService from '../service/chat.service'
import socketClient from '../../../util/socketClient'
import { useAuthStore } from '../../auth/stores/authStore'

export default function Chat() {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Record<number, Message[]>>({})
  const [mediaFiles, setMediaFiles] = useState<Record<number, MediaFile[]>>({})
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const selectedChat = chats.find((c) => c.chat_id === selectedChatId)
  const currentMessages = selectedChatId ? messages[selectedChatId] || [] : []
  const currentMediaFiles = selectedChatId ? mediaFiles[selectedChatId] || [] : []

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createChatType, setCreateChatType] = useState<'single' | 'group'>('single')

  // Load chats on mount
  useEffect(() => {
    loadChats()
  }, [])

  // Setup socket connection
  useEffect(() => {
    socketClient.connect()

    // Listen to socket events
    socketClient.onNewMessage(handleNewMessage)
    socketClient.onNewChat(handleNewChat)
    socketClient.onChatColorChanged(handleChatColorChanged)
    socketClient.onGroupMemberAdded(handleGroupMemberAdded)
    socketClient.onGroupMemberRemoved(handleGroupMemberRemoved)
    socketClient.onAddedToGroup(handleAddedToGroup)
    socketClient.onRemovedFromGroup(handleRemovedFromGroup)
    socketClient.onUserBlocked(handleUserBlocked)
    socketClient.onUserUnblocked(handleUserUnblocked)

    return () => {
      socketClient.removeAllListeners()
      socketClient.disconnect()
    }
  }, [])

  // Join chat room when selecting a chat
  useEffect(() => {
    if (selectedChatId) {
      socketClient.joinChat(selectedChatId)
      loadMessages(selectedChatId)
      loadMediaFiles(selectedChatId)

      return () => {
        socketClient.leaveChat(selectedChatId)
      }
    }
  }, [selectedChatId])

  const loadChats = async () => {
    try {
      setLoading(true)
      const data = await chatService.getAllChats()
      setChats(data)
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (chatId: number) => {
    try {
      setLoadingMessages(true)
      const data = await chatService.getMessages(chatId)
      setMessages((prev) => ({ ...prev, [chatId]: data }))
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const loadMediaFiles = async (chatId: number) => {
    try {
      const data = await chatService.getMediaFiles(chatId)
      setMediaFiles((prev) => ({ ...prev, [chatId]: data }))
    } catch (error) {
      console.error('Failed to load media files:', error)
    }
  }

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'file', file?: File) => {
    if (!selectedChatId || !user) return

    try {
      const message = await chatService.sendMessage({
        chat_id: selectedChatId,
        sender_id: user.user_id,
        content,
        type,
        file
      })

      // Emit to socket - socket sẽ broadcast cho mọi người (kể cả người gửi)
      socketClient.sendMessage(message)

      // Update lastMessage in sidebar immediately for better UX
      // (Socket event sẽ update lại sau, nhưng cái này giúp UI responsive hơn)
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat.chat_id === selectedChatId
            ? {
                ...chat,
                lastMessage: message.content || message.file_name || 'File',
                lastMessageTime: new Date(message.timestamp)
              }
            : chat
        )
        // Sort to move chat to top
        return updated.sort((a, b) => {
          const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
          const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
          return bTime - aTime
        })
      })

      // Reload media files if it's an image or file
      if ((type === 'image' || type === 'file') && selectedChatId) {
        loadMediaFiles(selectedChatId)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleUpdateChatColor = async (color: string) => {
    if (!selectedChatId) return

    try {
      await chatService.updateChatColor(selectedChatId, color)

      // Update local state
      setChats((prev) => prev.map((chat) => (chat.chat_id === selectedChatId ? { ...chat, chat_color: color } : chat)))

      // Emit to socket
      socketClient.chatColorUpdated(selectedChatId, color)
    } catch (error) {
      console.error('Failed to update chat color:', error)
    }
  }

  const handleCreateChat = (type: 'single' | 'group') => {
    setCreateChatType(type)
    setShowCreateModal(true)
  }

  const handleCreateNewChat = async (selectedUsers: User[], groupName?: string) => {
    if (!user) return

    try {
      const chat = await chatService.createChat({
        name: groupName || selectedUsers[0].first_name + ' ' + selectedUsers[0].last_name,
        isGroup: createChatType === 'group',
        members: selectedUsers.map((u) => u.user_id),
        chatColor: '#cb0404'
      })

      // Check if chat already exists in state
      const existingChatIndex = chats.findIndex((c) => c.chat_id === chat.chat_id)

      if (existingChatIndex === -1) {
        // Chat mới, add vào state
        setChats((prev) => [chat, ...prev])
      } else {
        // Chat đã tồn tại (1-1 chat đã có), chỉ cần select
        console.log('Chat already exists, selecting it')
      }

      setSelectedChatId(chat.chat_id)
      setMessages((prev) => ({ ...prev, [chat.chat_id]: [] }))
      setShowCreateModal(false)

      // Chỉ emit socket nếu là chat mới (group hoặc 1-1 mới tạo)
      if (existingChatIndex === -1 && createChatType === 'group') {
        socketClient.chatCreated(chat, chat.members || [])
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  // Socket event handlers
  const handleNewMessage = (message: Message) => {
    if (!message.chat_id) return

    setMessages((prev) => ({
      ...prev,
      [message.chat_id!]: [...(prev[message.chat_id!] || []), message]
    }))

    // Update last message in chat list - move chat to top
    setChats((prev) => {
      const updatedChats = prev.map((chat) =>
        chat.chat_id === message.chat_id
          ? {
              ...chat,
              lastMessage: message.content || message.file_name || 'File',
              lastMessageTime: new Date(message.timestamp), // Ensure it's a Date object
              unreadCount: chat.chat_id === selectedChatId ? 0 : chat.unreadCount + 1
            }
          : chat
      )

      // Sort: move updated chat to top
      return updatedChats.sort((a, b) => {
        const aTime = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const bTime = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return bTime - aTime
      })
    })
  }

  const handleNewChat = (chat: Chat) => {
    // Check duplicate before adding
    setChats((prev) => {
      const exists = prev.find((c) => c.chat_id === chat.chat_id)
      if (exists) return prev
      return [chat, ...prev]
    })
  }

  const handleChatColorChanged = ({ chatId, color }: { chatId: number; color: string }) => {
    setChats((prev) => prev.map((chat) => (chat.chat_id === chatId ? { ...chat, chat_color: color } : chat)))
  }

  const handleGroupMemberAdded = ({
    chatId,
    systemMessage
  }: {
    chatId: number
    newMembers: any[]
    systemMessage: Message
  }) => {
    if (systemMessage.chat_id) {
      setMessages((prev) => ({
        ...prev,
        [systemMessage.chat_id!]: [...(prev[systemMessage.chat_id!] || []), systemMessage]
      }))
    }
    // Reload chat to get updated members
    if (chatId === selectedChatId) {
      loadMessages(chatId)
    }
  }

  const handleGroupMemberRemoved = ({
    chatId,
    systemMessage
  }: {
    chatId: number
    userId: string
    systemMessage: Message
  }) => {
    if (systemMessage.chat_id) {
      setMessages((prev) => ({
        ...prev,
        [systemMessage.chat_id!]: [...(prev[systemMessage.chat_id!] || []), systemMessage]
      }))
    }
    // Reload chat to get updated members
    if (chatId === selectedChatId) {
      loadMessages(chatId)
    }
  }

  const handleAddedToGroup = () => {
    // Reload chats to show new group
    loadChats()
  }

  const handleRemovedFromGroup = ({ chatId }: { chatId: number }) => {
    // Remove chat from list
    setChats((prev) => prev.filter((chat) => chat.chat_id !== chatId))
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }

  const handleUserBlocked = () => {
    // Reload chats để cập nhật block status
    loadChats()
  }

  const handleUserUnblocked = () => {
    // Reload chats để cập nhật block status
    loadChats()
  }

  const handleBlockUser = async () => {
    if (!selectedChatId || !user) return

    try {
      // Get the other user in 1-1 chat
      const otherUser = selectedChat?.memberDetails?.find((m) => m.user_id !== user.user_id)
      if (!otherUser) return

      await chatService.blockUser(selectedChatId, otherUser.user_id)

      // Emit socket event
      socketClient.userBlocked(selectedChatId, otherUser.user_id)

      // Reload chats để cập nhật block status
      await loadChats()

      setShowSettings(false)
    } catch (error) {
      console.error('Failed to block user:', error)
      alert('Không thể chặn người dùng')
    }
  }

  const handleUnblockUser = async () => {
    if (!selectedChatId || !user) return

    try {
      // Get the other user in 1-1 chat
      const otherUser = selectedChat?.memberDetails?.find((m) => m.user_id !== user.user_id)
      if (!otherUser) return

      await chatService.unblockUser(selectedChatId, otherUser.user_id)

      // Emit socket event
      socketClient.userUnblocked(selectedChatId, otherUser.user_id)

      // Reload chats để cập nhật block status
      await loadChats()
    } catch (error) {
      console.error('Failed to unblock user:', error)
      alert('Không thể bỏ chặn người dùng')
    }
  }

  const handleLeaveGroup = async () => {
    if (!selectedChatId) return

    try {
      await chatService.leaveGroup(selectedChatId)

      // Remove chat from list
      setChats((prev) => prev.filter((chat) => chat.chat_id !== selectedChatId))
      setSelectedChatId(null)
    } catch (error) {
      console.error('Failed to leave group:', error)
    }
  }

  const handleKickMember = async (userId: string) => {
    if (!selectedChatId) return

    try {
      await chatService.removeMember(selectedChatId, userId)

      // Update chat members in state
      setChats((prev) =>
        prev.map((chat) =>
          chat.chat_id === selectedChatId
            ? {
                ...chat,
                members: chat.members?.filter((id) => id !== userId),
                memberDetails: chat.memberDetails?.filter((m) => m.user_id !== userId)
              }
            : chat
        )
      )
    } catch (error) {
      console.error('Failed to kick member:', error)
    }
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-gray-500'>Đang tải...</p>
      </div>
    )
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      <ChatSideBar
        onCreateChat={handleCreateChat}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />

      {selectedChat ? (
        <>
          <div className='flex-1 flex flex-col'>
            <ChatHeader chat={selectedChat} onToggleSettings={() => setShowSettings(!showSettings)} />
            {loadingMessages ? (
              <div className='flex-1 flex items-center justify-center'>
                <p className='text-gray-500'>Đang tải tin nhắn...</p>
              </div>
            ) : (
              <ChatMessage
                messages={currentMessages}
                chatColor={selectedChat.chat_color || '#cb0404'}
                isGroup={selectedChat.is_group}
              />
            )}
            {!selectedChat.is_group && selectedChat.isBlocked ? (
              <BlockedChatUI
                chatName={selectedChat.name}
                iBlockedThem={selectedChat.iBlockedThem || false}
                theyBlockedMe={selectedChat.theyBlockedMe || false}
                onUnblock={handleUnblockUser}
              />
            ) : (
              <ChatInput onSendMessage={handleSendMessage} />
            )}
          </div>

          {showSettings && (
            <SettingsPanel
              chat={selectedChat}
              mediaFiles={currentMediaFiles}
              onClose={() => setShowSettings(false)}
              onUpdateChatColor={handleUpdateChatColor}
              onToggleNotifications={() => {
                console.log('Toggle notifications')
              }}
              onBlockUser={handleBlockUser}
              onLeaveGroup={handleLeaveGroup}
              onKickMember={handleKickMember}
            />
          )}
        </>
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-gray-500'>Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      )}
      {showCreateModal && (
        <CreateChatModal
          type={createChatType}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateNewChat}
        />
      )}
    </div>
  )
}
