import React, { useState } from 'react'
import type { MediaFile, Message } from '../../../../types/chat'
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

  const handleDownloadFile = async (file: Message) => {
    try {
      const response = await fetch(file.file_url)
      const blob = await response.blob()

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${file.file_name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch (error) {
      console.error('Download failed', error)
    }
  }

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
              <div
                key={message.file_url}
                onClick={() => handleDownloadFile?.(message)}
                className='flex items-center gap-2 cursor-pointer select-none'
              >
                <File size={16} className='text-white flex-shrink-0' />
                <span className='text-white underline hover:text-gray-300 text-sm'>
                  {message.file_name || message.content || 'File'}
                </span>
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
