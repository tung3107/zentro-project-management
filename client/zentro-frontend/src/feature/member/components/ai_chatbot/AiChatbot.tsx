import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../../auth/stores/authStore'
import { userProjectAPI } from '../../../admin/service/project.service'
import { useAIChatStore } from '../../stores/aiChatStore'
import aiChatService from '../../service/aichat.service'
import chatService from '../../service/chat.service'
import { Bot, Send, Sparkles, Loader2, Layout, MessageSquare, Menu } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Avatar from '../../../../components/Avatar'
import { Project } from '../../../../types/project'

export default function AiChatbot() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [typingAIMessage, setTypingAIMessage] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const { aiChats, messages, setAIChat, addMessage, setMessages, isLoading, setLoading } = useAIChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.user_id) return
      try {
        const res = await userProjectAPI(user.user_id)
        if (res?.data) {
          setProjects(res.data)
          if (res.data.length > 0 && !selectedProjectId) {
            setSelectedProjectId(res.data[0].project_id)
          }
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    fetchProjects()
  }, [user?.user_id])

  const currentChat = selectedProjectId ? aiChats[selectedProjectId] : null
  const currentMessages = currentChat ? messages[currentChat.chat_id] || [] : []

  // Initialize Chat
  useEffect(() => {
    if (selectedProjectId && !currentChat) {
      initializeAIChat(selectedProjectId)
    }
  }, [selectedProjectId, currentChat])

  // Load Messages
  useEffect(() => {
    if (currentChat && currentMessages.length === 0) {
      loadMessages(currentChat.chat_id)
    }
  }, [currentChat])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, typingAIMessage])

  const initializeAIChat = async (projectId: string) => {
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

  const loadMessages = async (chatId: number) => {
    try {
      const msgs = await chatService.getMessages(chatId)
      setMessages(chatId, msgs)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChat || !user || isSending || !selectedProjectId) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsSending(true)

    addMessage(currentChat.chat_id, {
      content: userMessage,
      sender_id: user.user_id,
      senderName: `${user.first_name} ${user.last_name}`,
      timestamp: new Date().toISOString()
    })

    try {
      const response = await aiChatService.sendAIMessage(selectedProjectId, {
        message: userMessage,
        chatId: currentChat.chat_id
      })

      const aiMsg = response.aiMessage

      setTypingAIMessage({
        ...aiMsg,
        content: '',
        timestamp: new Date().toISOString()
      })

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
          addMessage(currentChat.chat_id, {
            ...aiMsg,
            timestamp: new Date().toISOString()
          })
          setTypingAIMessage(null)
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

  return (
    <div className='flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden rounded-xl border border-gray-200 shadow-sm'>
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className='p-4 border-b border-gray-100 bg-gray-50/50'>
          <h2 className='font-bold text-gray-800 flex items-center gap-2'>
            <Layout size={20} className='text-blue-600' />
            Chọn dự án
          </h2>
        </div>
        
        <div className='flex-1 overflow-y-auto p-3 space-y-2'>
          {projects.map((project) => (
            <button
              key={project.project_id}
              onClick={() => setSelectedProjectId(project.project_id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                selectedProjectId === project.project_id
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Avatar name={project.project_name} avatarUrl={project.avatar || undefined} size={32} />
              <div className='flex-1 min-w-0'>
                <div className='font-medium truncate'>{project.project_name}</div>
                <div className='text-xs text-gray-500 truncate'>ID: {project.project_id}</div>
              </div>
              {selectedProjectId === project.project_id && (
                <div className='w-2 h-2 rounded-full bg-blue-500' />
              )}
            </button>
          ))}
          
          {projects.length === 0 && (
             <div className='text-center py-8 text-gray-500 text-sm'>
               Bạn chưa tham gia dự án nào
             </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col bg-white'>
        {/* Header */}
        <div className='h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white'>
          <div className='flex items-center gap-4'>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 hover:bg-gray-100 rounded-lg text-gray-600'
            >
              <Menu size={20} />
            </button>
            
            {selectedProjectId ? (
               <div className='flex items-center gap-3'>
                 <div className='w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm'>
                   <Bot className='text-white' size={24} />
                 </div>
                 <div>
                   <h3 className='font-bold text-gray-900'>AI Assistant</h3>
                   <p className='text-xs text-green-600 flex items-center gap-1 font-medium'>
                     <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
                     Online • {projects.find(p => p.project_id === selectedProjectId)?.project_name}
                   </p>
                 </div>
               </div>
            ) : (
                <div className='text-gray-500 font-medium'>Chọn một dự án để bắt đầu chat</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/30'>
          {selectedProjectId ? (
            <>
              {currentMessages.length === 0 && !isLoading && (
                <div className='flex flex-col items-center justify-center h-full text-gray-400 space-y-4'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                    <Sparkles size={32} className='text-gray-300' />
                  </div>
                  <p>Bắt đầu trò chuyện với AI về dự án này</p>
                </div>
              )}
              
              {currentMessages.map((msg, idx) => {
                const isAI = msg.sender_id === null || msg.sender_id === 'AI'
                const isUser = msg.sender_id === user?.user_id

                return (
                  <div key={idx} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className='flex-shrink-0 mt-1'>
                      {isAI ? (
                        <div className='w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm'>
                          <Sparkles className='text-white' size={16} />
                        </div>
                      ) : (
                        <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm'>
                          {msg.senderName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
                      <div
                        className={`px-5 py-3.5 rounded-2xl shadow-sm ${
                          isUser 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                             <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <p className={`text-[10px] mt-2 font-medium ${isUser ? 'text-blue-200' : 'text-gray-400'}`}>
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

              {/* Typing message */}
              {typingAIMessage && (
                <div className='flex gap-4 flex-row'>
                  <div className='flex-shrink-0 mt-1'>
                    <div className='w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm'>
                      <Sparkles className='text-white' size={16} />
                    </div>
                  </div>
                  <div className='flex-1 max-w-[80%]'>
                    <div className='px-5 py-3.5 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'>
                      <div className='prose prose-sm max-w-none'>
                        <ReactMarkdown>{typingAIMessage.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-gray-400'>
               <MessageSquare size={48} className='mb-4 opacity-20' />
               <p>Vui lòng chọn một dự án từ danh sách bên trái</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className='p-6 bg-white border-t border-gray-200'>
          <div className='relative flex items-end gap-3 max-w-4xl mx-auto'>
            <div className='relative flex-1'>
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedProjectId ? 'Hỏi AI về dự án, tasks, tiến độ...' : 'Chọn dự án để bắt đầu...'}
                  className='w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  rows={1}
                  style={{ minHeight: '60px', maxHeight: '120px' }}
                  disabled={isSending || !selectedProjectId}
                />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending || !selectedProjectId}
              className='h-[60px] w-[60px] flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95'
            >
              {isSending ? <Loader2 className='animate-spin' size={24} /> : <Send size={24} />}
            </button>
          </div>
          <p className='text-center text-xs text-gray-400 mt-3'>
            AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  )
}
