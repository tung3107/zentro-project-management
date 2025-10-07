import React, { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import Avatar from './Avatar'
import { toast } from 'sonner'

// -------- AvatarWithEdit --------
type Props = {
  user: {
    avatar?: string | File
    first_name: string
  }
  onAvatarChange: (file: File) => void
}

const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml']

const imgbbApiKey = 'YOUR_IMGBB_API_KEY' // <<<<<< Thay bằng API KEY của bạn

export const AvatarWithEdit: React.FC<Props> = ({ user, onAvatarChange }) => {
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleIconClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const file = e.target.files?.[0]
    if (file && !ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Định dạng ảnh không được chấp nhận!')
      setLoading(false)
      return
    }
    if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error('Ảnh không được quá 10MB')
      setLoading(false)
      return
    } else if (file) {
      setTimeout(() => {
        const localUrl = URL.createObjectURL(file)
        setAvatarUrl(localUrl)
        onAvatarChange(file)
        setLoading(false)
      }, 2000)
    }
  }

  return (
    <div className='relative inline-block group' style={{ width: 68, height: 68 }}>
      {/* Border nhấn nhá */}
      <div
        className='absolute inset-0'
        style={{
          borderRadius: '50%',
          border: '2px dashed #aaa',
          pointerEvents: 'none'
        }}
      />
      <Avatar avatarUrl={avatarUrl} name={user.first_name} size={68} />
      {/* Camera Icon */}
      <button
        type='button'
        onClick={handleIconClick}
        className='absolute bottom-0 right-0 bg-white border rounded-full p-1 shadow cursor-pointer transition hover:bg-gray-100'
        style={{ transform: 'translate(25%, 25%)' }}
        aria-label='Change avatar'
      >
        <Camera size={18} className='text-gray-700' />
      </button>
      {/* Hidden file input */}
      <input ref={fileInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={handleFileChange} />
      {/* Loading Overlay */}
      {loading && (
        <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 rounded-full'>
          <div className='animate-spin rounded-full border-t-2 border-b-2 border-blue-500 w-6 h-6' />
        </div>
      )}
    </div>
  )
}
