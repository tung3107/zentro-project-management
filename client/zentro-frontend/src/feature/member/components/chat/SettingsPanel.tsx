import React, { useState } from 'react'
import type { Chat, MediaFile } from '../../../../types/chat'
import { Bell, Download, File, LogOut, Palette, UserMinus, UserX, X } from 'lucide-react'
import { formatTime } from '../../../../util/helper'
import Avatar from '../../../../components/Avatar'
import { useAuthStore } from '../../../auth/stores/authStore'
import ImageViewerModal from './ImageViewerModal'

export default function SettingsPanel({
  chat,
  mediaFiles,
  onClose,
  onUpdateChatColor,
  onToggleNotifications,
  onBlockUser,
  onLeaveGroup,
  onKickMember
}: {
  chat: Chat
  mediaFiles: MediaFile[]
  onClose: () => void
  onUpdateChatColor: (color: string) => void
  onToggleNotifications: () => void
  onBlockUser: () => void
  onLeaveGroup: () => void
  onKickMember?: (userId: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'media' | 'files'>('media')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const { user } = useAuthStore()

  const colors = ['#cb0404', '#2574ff', '#f37121', '#4dd599', '#ff5757', '#ffa256', '#202f65']

  const images = mediaFiles.filter((f) => f.type === 'image')
  const files = mediaFiles.filter((f) => f.type === 'file')

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleDownloadFile = async (file: MediaFile) => {
    try {
      const response = await fetch(file.url)
      const blob = await response.blob()

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${file.name}` // tên mong muốn
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch (error) {
      console.error('Download failed', error)
    }
  }

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  return (
    <div className='w-80 border-l border-gray-200 bg-white flex flex-col'>
      <div className='p-4 border-b border-gray-200 flex items-center justify-between'>
        <h3 className='font-semibold text-gray-900'>Thông tin</h3>
        <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-full'>
          <X size={20} />
        </button>
      </div>

      {/* Members Section - Only for Group */}
      {chat.is_group && chat.memberDetails && chat.memberDetails.length > 0 && (
        <div className='p-4 border-b border-gray-200'>
          <h4 className='text-sm font-semibold text-gray-700 mb-3'>Thành viên ({chat.memberDetails.length})</h4>
          <div className='space-y-2 max-h-48 overflow-y-auto'>
            {chat.memberDetails.map((member) => {
              const memberName = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email
              const isCurrentUser = member.user_id === user?.user_id
              const isCreator = chat.created_by === member.user_id

              return (
                <div key={member.user_id} className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg'>
                  <Avatar avatarUrl={member.avatar} name={memberName} size={32} />
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-sm font-medium text-gray-900 truncate'>
                      {memberName}
                      {isCreator && <span className='text-xs text-blue-600 ml-1'>(Trưởng nhóm)</span>}
                      {isCurrentUser && <span className='text-xs text-green-600 ml-1'>(Bạn)</span>}
                    </h3>
                    <p className='text-xs text-gray-500 truncate'>{member.email}</p>
                  </div>
                  {!isCurrentUser && onKickMember && (
                    <button
                      onClick={() => onKickMember(member.user_id)}
                      className='p-1.5 hover:bg-red-100 rounded-full text-red-600 transition-colors'
                      title='Xóa khỏi nhóm'
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs for Media and Files */}
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'media' ? 'border-b-2 text-blue-600' : 'text-gray-600'
          }`}
          style={activeTab === 'media' ? { borderColor: 'var(--primary)' } : {}}
        >
          Ảnh ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'files' ? 'border-b-2 text-blue-600' : 'text-gray-600'
          }`}
          style={activeTab === 'files' ? { borderColor: 'var(--primary)' } : {}}
        >
          File ({files.length})
        </button>
      </div>

      {/* Media/Files Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {activeTab === 'media' && (
          <div className='grid grid-cols-3 gap-2'>
            {images.map((img, index) => (
              <img
                key={img.media_file_id}
                src={img.url}
                alt={img.name}
                onClick={() => handleImageClick(index)}
                className='w-full h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity'
              />
            ))}
            {images.length === 0 && <p className='col-span-3 text-center text-gray-500 py-8'>Chưa có ảnh nào</p>}
          </div>
        )}

        {activeTab === 'files' && (
          <div className='space-y-2'>
            {files.map((file) => (
              <div
                key={file.media_file_id}
                onClick={() => handleDownloadFile(file)}
                className='flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer'
              >
                <File size={24} className='text-gray-600' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
                  <p className='text-xs text-gray-500'>{formatTime(file.timestamp)}</p>
                </div>
                <Download size={20} className='text-gray-600' />
              </div>
            ))}
            {files.length === 0 && <p className='text-center text-gray-500 py-8'>Chưa có file nào</p>}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className='p-4 border-t border-gray-200 space-y-2'>
        <div>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className='w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg'
          >
            <div className='flex items-center gap-3'>
              <Palette size={20} className='text-gray-600' />
              <span className='text-sm text-gray-900'>Đổi màu chat</span>
            </div>
            <div className='w-6 h-6 rounded-full' style={{ backgroundColor: chat.chat_color }} />
          </button>
          {showColorPicker && (
            <div className='mt-2 p-3 bg-gray-50 rounded-lg'>
              <div className='grid grid-cols-7 gap-2'>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      onUpdateChatColor(color)
                      setShowColorPicker(false)
                    }}
                    className='w-8 h-8 rounded-full hover:scale-110 transition-transform'
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!chat.is_group && (
          <button
            onClick={onBlockUser}
            className='w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-red-600'
          >
            <UserX size={20} />
            <span className='text-sm'>Chặn người dùng</span>
          </button>
        )}

        {chat.is_group && (
          <button
            onClick={onLeaveGroup}
            className='w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg text-red-600'
          >
            <LogOut size={20} />
            <span className='text-sm'>Rời nhóm</span>
          </button>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <ImageViewerModal
          imageUrl={images[selectedImageIndex].url}
          onClose={() => setSelectedImageIndex(null)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
          hasPrev={selectedImageIndex > 0}
          hasNext={selectedImageIndex < images.length - 1}
        />
      )}
    </div>
  )
}
