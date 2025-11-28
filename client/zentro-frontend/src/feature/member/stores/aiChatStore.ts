import { create } from 'zustand'
import type { Chat, Message } from '../../../types/chat'

interface AIChatState {
  aiChats: Record<string, Chat> // projectId -> Chat
  messages: Record<number, Message[]> // chatId -> Messages
  isLoading: boolean
  currentProjectId: string | null

  setAIChat: (projectId: string, chat: Chat) => void
  addMessage: (chatId: number, message: Message) => void
  setMessages: (chatId: number, messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setCurrentProjectId: (projectId: string | null) => void
  clearMessages: (chatId: number) => void
}

export const useAIChatStore = create<AIChatState>((set) => ({
  aiChats: {},
  messages: {},
  isLoading: false,
  currentProjectId: null,

  setAIChat: (projectId, chat) =>
    set((state) => ({
      aiChats: { ...state.aiChats, [projectId]: chat }
    })),

  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message]
      }
    })),

  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: messages
      }
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setCurrentProjectId: (projectId) => set({ currentProjectId: projectId }),

  clearMessages: (chatId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: []
      }
    }))
}))
