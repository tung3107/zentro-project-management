import { Image, Paperclip, Send, Smile } from 'lucide-react'
import React, { useRef, useState } from 'react'

export default function ChatInput({
  onSendMessage
}: {
  onSendMessage: (content: string, type: 'text' | 'image' | 'file', file?: File) => void
}) {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, 'text')
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          onSendMessage('', 'image', file)
        }
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const file = e.target.files?.[0]
    if (file) {
      onSendMessage('', type, file)
    }
  }

  return (
    <div className='p-4 border-t border-gray-200 bg-white'>
      <div className='flex items-end gap-2'>
        <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
          <Smile size={24} style={{ color: 'var(--secondary)' }} />
        </button>

        <input
          ref={imageInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <button
          onClick={() => imageInputRef.current?.click()}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <Image size={24} style={{ color: 'var(--secondary)' }} />
        </button>

        <input ref={fileInputRef} type='file' className='hidden' onChange={(e) => handleFileSelect(e, 'file')} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <Paperclip size={24} style={{ color: 'var(--secondary)' }} />
        </button>

        <div className='flex-1 bg-gray-100 rounded-full px-4 py-2'>
          <input
            type='text'
            placeholder='Nhập tin nhắn...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            className='w-full bg-transparent outline-none'
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className='p-2 rounded-full transition-colors disabled:opacity-50'
          style={{ backgroundColor: message.trim() ? 'var(--primary)' : '#ccc' }}
        >
          <Send size={24} className='text-white' />
        </button>
      </div>
    </div>
  )
}
