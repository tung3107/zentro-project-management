import axiosClient from '../../../util/axiosClient'
import type { Chat, Message, MediaFile } from '../../../types/chat'

export interface CreateChatRequest {
  name: string
  isGroup: boolean
  members: string[]
  chatColor?: string
}

export interface SendMessageRequest {
  chat_id: number
  sender_id: string
  content: string
  type: 'text' | 'image' | 'file' | 'video'
  file?: File
}

class ChatService {
  // Lấy tất cả chats của user
  async getAllChats(): Promise<Chat[]> {
    const response = await axiosClient.get('/chats')
    return response.data.data
  }

  // Lấy chi tiết một chat
  async getChatById(chatId: number): Promise<Chat> {
    const response = await axiosClient.get(`/chats/${chatId}`)
    return response.data.data
  }

  // Lấy tất cả messages của một chat
  async getMessages(chatId: number): Promise<Message[]> {
    const response = await axiosClient.get(`/chats/${chatId}/messages`)
    return response.data.data
  }

  // Gửi tin nhắn
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const formData = new FormData()
    formData.append('chat_id', data.chat_id.toString())
    formData.append('sender_id', data.sender_id)
    formData.append('content', data.content)
    formData.append('type', data.type)

    if (data.file) {
      formData.append('file', data.file)
    }

    const response = await axiosClient.post('/chats/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data.data
  }

  // Tạo chat mới
  async createChat(data: CreateChatRequest): Promise<Chat> {
    const response = await axiosClient.post('/chats', data)
    return response.data.data
  }

  // Cập nhật màu chat
  async updateChatColor(chatId: number, color: string): Promise<void> {
    await axiosClient.put(`/chats/${chatId}/color`, { color })
  }

  // Thêm members vào group
  async addMembers(chatId: number, userIds: string[]): Promise<void> {
    await axiosClient.post(`/chats/${chatId}/members`, { userIds })
  }

  // Xóa member khỏi group
  async removeMember(chatId: number, userId: string): Promise<void> {
    await axiosClient.delete(`/chats/${chatId}/members/${userId}`)
  }

  // Block user
  async blockUser(chatId: number, userId: string): Promise<void> {
    await axiosClient.post(`/chats/${chatId}/block`, { user_id: userId })
  }

  // Unblock user
  async unblockUser(chatId: number, userId: string): Promise<void> {
    await axiosClient.post(`/chats/${chatId}/unblock`, { user_id: userId })
  }

  // Rời nhóm
  async leaveGroup(chatId: number): Promise<void> {
    await axiosClient.post(`/chats/${chatId}/leave`)
  }

  // Lấy media files
  async getMediaFiles(chatId: number, type?: 'image' | 'file' | 'all'): Promise<MediaFile[]> {
    const response = await axiosClient.get(`/chats/${chatId}/media`, {
      params: { type: type || 'all' }
    })
    return response.data.data
  }
}

export default new ChatService()
