import React, { useEffect, useRef } from 'react'
import type { Message } from '../../../../types/chat'
import MessageBubble from './MessageBubble'
import { useAuthStore } from '../../../auth/stores/authStore'

export default function ChatMessage({
  messages,
  chatColor,
  isGroup
}: {
  messages: Message[]
  chatColor: string
  isGroup: boolean
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='flex-1 overflow-y-auto p-6 bg-gray-50'>
      {messages.map((message) => (
        <MessageBubble
          key={message.message_id}
          message={message}
          isOwn={message.sender_id === user?.user_id}
          chatColor={chatColor}
          showSender={isGroup}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
