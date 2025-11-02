import React, { useState } from 'react'
import type { Message } from '../../../../types/chat'
import { File } from 'lucide-react'
import { formatTime } from '../../../../util/helper'
import ImageViewerModal from './ImageViewerModal'

export default function MessageBubble({
  message,
  isOwn,
  chatColor,
  showSender
}: {
  message: Message
  isOwn: boolean
  chatColor: string
  showSender?: boolean
}) {
  const [showImageViewer, setShowImageViewer] = useState(false)

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {showSender && !isOwn && <span className='text-xs text-gray-600 mb-1 px-3'>{message.senderName}</span>}
          <div
            className={`px-4 py-2 rounded-2xl ${isOwn ? 'text-white' : 'bg-gray-200 text-gray-900'}`}
            style={isOwn ? { backgroundColor: chatColor } : {}}
          >
            {message.type === 'text' && <p className='break-words'>{message.content}</p>}
            {message.type === 'image' && (
              <img
                src={message.file_url}
                alt='Sent image'
                className='rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity'
                onClick={() => setShowImageViewer(true)}
              />
            )}
            {message.type === 'file' && (
              <div className='flex items-center gap-2'>
                <File size={20} />
                <span>{message.file_name || message.content || 'File'}</span>
              </div>
            )}
          </div>
          <span className='text-xs text-gray-500 mt-1 px-3'>{formatTime(message.timestamp)}</span>
        </div>
      </div>

      {showImageViewer && message.file_url && (
        <ImageViewerModal imageUrl={message.file_url} onClose={() => setShowImageViewer(false)} />
      )}
    </>
  )
}
