import { useState, useEffect, useRef } from 'react'
import { Send, Bot, X, Loader2, Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useAIChatStore } from '../../stores/aiChatStore'
import aiChatService from '../../service/aichat.service'
import chatService from '../../service/chat.service'
import { useAuthStore } from '../../../auth/stores/authStore'

import ReactMarkdown from 'react-markdown'

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuthStore()
  const { aiChats, messages, setAIChat, addMessage, setMessages, isLoading, setLoading } = useAIChatStore()

  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [typingMessage, setTypingMessage] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = projectId ? aiChats[projectId] : null
  const currentMessages = currentChat ? messages[currentChat.chat_id] || [] : []

  const [typingAIMessage, setTypingAIMessage] = useState<any>(null)

  // Initialize AI chat when panel opens
  useEffect(() => {
    if (isOpen && projectId && !currentChat) {
      initializeAIChat()
    }
  }, [isOpen, projectId])

  // Load messages when chat is ready
  useEffect(() => {
    if (currentChat && currentMessages.length === 0) {
      loadMessages()
    }
  }, [currentChat])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, typingMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeAIChat = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const chat = await aiChatService.createAIChatForProject(projectId)
      setAIChat(projectId, chat)
    } catch (error) {
      console.error('Failed to initialize AI chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!currentChat) return

    try {
      const msgs = await chatService.getMessages(currentChat.chat_id)
      setMessages(currentChat.chat_id, msgs)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChat || !user || isSending) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    addMessage(currentChat.chat_id, {
      content: userMessage,
      sender_id: user.user_id,
      senderName: user.name,
      timestamp: new Date().toISOString()
    })

    try {
      const response = await aiChatService.sendAIMessage(projectId!, {
        message: userMessage,
        chatId: currentChat.chat_id
      })

      const aiMsg = response.aiMessage

      // ✅ Set typing message (KHÔNG add vào store)
      setTypingAIMessage({
        ...aiMsg,
        content: '',
        timestamp: new Date().toISOString()
      })

      // Typing effect
      let currentIndex = 0
      const typingInterval = setInterval(() => {
        currentIndex++
        if (aiMsg.content && currentIndex <= aiMsg.content.length) {
          setTypingAIMessage((prev: any) => ({
            ...prev,
            content: aiMsg.content.slice(0, currentIndex)
          }))
        } else {
          clearInterval(typingInterval)
          // ✅ Sau khi typing xong MỚI add vào store
          addMessage(currentChat.chat_id, {
            ...aiMsg,
            timestamp: new Date().toISOString()
          })
          setTypingAIMessage(null) // Clear typing
        }
      }, 20)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/30 z-50 flex items-end justify-end p-6' onClick={onClose}>
      <div
        className='bg-white rounded-2xl shadow-2xl w-[480px] h-[700px] flex flex-col'
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center'>
              <Bot className='text-white' size={24} />
            </div>
            <div>
              <h3 className='font-bold text-gray-900 text-lg'>AI Assistant</h3>
              <p className='text-xs text-gray-600 flex items-center gap-1'>
                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
          {currentMessages.map((msg, idx) => {
            const isAI = msg.sender_id === null || msg.sender_id === 'AI'
            const isUser = msg.sender_id === user?.user_id

            return (
              <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className='flex-shrink-0'>
                  {isAI ? (
                    <div className='w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center'>
                      <Sparkles className='text-white' size={16} />
                    </div>
                  ) : (
                    <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold'>
                      {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Message bubble */}
                <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
                  <div
                    className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
                      isUser ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                    }`}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    <p className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing message riêng biệt */}
          {typingAIMessage && (
            <div className='flex gap-3 flex-row'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center'>
                  <Sparkles className='text-white' size={16} />
                </div>
              </div>
              <div className='flex-1'>
                <div className='inline-block max-w-[85%] px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 rounded-tl-sm'>
                  <ReactMarkdown>{typingAIMessage.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-end gap-3'>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Hỏi AI về dự án, tasks, tiến độ...'
              className='flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm'
              rows={2}
              disabled={isSending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className='p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0'
            >
              {isSending ? <Loader2 className='animate-spin' size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
