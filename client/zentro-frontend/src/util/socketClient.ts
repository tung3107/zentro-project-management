import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../feature/auth/stores/authStore'
import type { Message } from '../types/chat'

class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect() {
    const { accessToken } = useAuthStore.getState()

    if (!accessToken) {
      console.error('No access token available for socket connection')
      return
    }

    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    const SOCKET_URL = import.meta.env.VITE_REACT_API_URL?.replace('/api/v1', '') || 'http://localhost:3502'

    this.socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnectAttempts++

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('Socket manually disconnected')
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // ====================
  // EMIT EVENTS
  // ====================

  joinChat(chatId: number) {
    this.socket?.emit('join_chat', chatId)
  }

  leaveChat(chatId: number) {
    this.socket?.emit('leave_chat', chatId)
  }

  sendMessage(message: Message) {
    this.socket?.emit('send_message', message)
  }

  typing(chatId: number, userName: string, isTyping: boolean) {
    this.socket?.emit('typing', { chatId, userName, isTyping })
  }

  markRead(chatId: number, messageIds: number[]) {
    this.socket?.emit('mark_read', { chatId, messageIds })
  }

  chatCreated(chat: any, memberIds: string[]) {
    this.socket?.emit('chat_created', { chat, memberIds })
  }

  memberAdded(chatId: number, newMembers: any[], systemMessage: Message) {
    this.socket?.emit('member_added', { chatId, newMembers, systemMessage })
  }

  memberRemoved(chatId: number, userId: string, systemMessage: Message) {
    this.socket?.emit('member_removed', { chatId, userId, systemMessage })
  }

  chatColorUpdated(chatId: number, color: string) {
    this.socket?.emit('chat_color_updated', { chatId, color })
  }

  userBlocked(chatId: number, userId: string) {
    this.socket?.emit('user_blocked', { chatId, userId })
  }

  userUnblocked(chatId: number, userId: string) {
    this.socket?.emit('user_unblocked', { chatId, userId })
  }

  joinProject(projectId: string) {
    this.socket?.emit('join_project', projectId)
  }

  leaveProject(projectId: string) {
    this.socket?.emit('leave_project', projectId)
  }

  // ====================
  // LISTEN TO EVENTS
  // ====================

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback)
  }

  onUserTyping(callback: (data: { chatId: number; userName: string; userId: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback)
  }

  onMessagesRead(callback: (data: { chatId: number; messageIds: number[]; userId: string }) => void) {
    this.socket?.on('messages_read', callback)
  }

  onNewChat(callback: (chat: any) => void) {
    this.socket?.on('new_chat', callback)
  }

  onGroupMemberAdded(callback: (data: { chatId: number; newMembers: any[]; systemMessage: Message }) => void) {
    this.socket?.on('group_member_added', callback)
  }

  onGroupMemberRemoved(callback: (data: { chatId: number; userId: string; systemMessage: Message }) => void) {
    this.socket?.on('group_member_removed', callback)
  }

  onAddedToGroup(callback: (data: { chatId: number }) => void) {
    this.socket?.on('added_to_group', callback)
  }

  onRemovedFromGroup(callback: (data: { chatId: number }) => void) {
    this.socket?.on('removed_from_group', callback)
  }

  onChatColorChanged(callback: (data: { chatId: number; color: string }) => void) {
    this.socket?.on('chat_color_changed', callback)
  }

  onUserBlocked(callback: (data: { chatId: number; userId: string }) => void) {
    this.socket?.on('user_blocked', callback)
  }

  onUserUnblocked(callback: (data: { chatId: number; userId: string }) => void) {
    this.socket?.on('user_unblocked', callback)
  }

  onUserOnline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user_online', callback)
  }

  onUserOffline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user_offline', callback)
  }

  onTaskCreated(callback: (task: any) => void) {
    this.socket?.on('task:created', callback)
  }

  onTaskUpdated(callback: (task: any) => void) {
    this.socket?.on('task:updated', callback)
  }

  onTaskDeleted(callback: (data: { task_id: string }) => void) {
    this.socket?.on('task:deleted', callback)
  }

  onNewNotification(callback: (notification: any) => void) {
    this.socket?.on('new_notification', callback)
  }

  // ====================
  // REMOVE LISTENERS
  // ====================

  offNewMessage() {
    this.socket?.off('new_message')
  }

  offUserTyping() {
    this.socket?.off('user_typing')
  }

  offMessagesRead() {
    this.socket?.off('messages_read')
  }

  offNewChat() {
    this.socket?.off('new_chat')
  }

  offGroupMemberAdded() {
    this.socket?.off('group_member_added')
  }

  offGroupMemberRemoved() {
    this.socket?.off('group_member_removed')
  }

  offAddedToGroup() {
    this.socket?.off('added_to_group')
  }

  offRemovedFromGroup() {
    this.socket?.off('removed_from_group')
  }

  offChatColorChanged() {
    this.socket?.off('chat_color_changed')
  }

  offUserBlocked() {
    this.socket?.off('user_blocked')
  }

  offUserUnblocked() {
    this.socket?.off('user_unblocked')
  }

  offUserOnline() {
    this.socket?.off('user_online')
  }

  offUserOffline() {
    this.socket?.off('user_offline')
  }

  offTaskCreated() {
    this.socket?.off('task:created')
  }

  offTaskUpdated() {
    this.socket?.off('task:updated')
  }

  offTaskDeleted() {
    this.socket?.off('task:deleted')
  }

  offNewNotification() {
    this.socket?.off('new_notification')
  }

  removeAllListeners() {
    this.socket?.removeAllListeners()
  }
}

export default new SocketClient()
