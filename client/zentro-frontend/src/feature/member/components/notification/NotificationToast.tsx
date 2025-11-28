import { useEffect, useState } from 'react'
import { X, Bell, CheckCircle, MessageSquare, PlayCircle, CheckSquare2, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../../../types/notification'
import Avatar from '../../../../components/Avatar'

interface NotificationToastProps {
  notification: Notification
  onClose: () => void
  onClick: () => void
}

export default function NotificationToast({ notification, onClose, onClick }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Progress bar countdown
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressInterval)
          return 0
        }
        return prev - 2 // Decrease by 2% every 100ms (5 seconds total)
      })
    }, 100)

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const handleClick = () => {
    onClick()
    handleClose()
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'task_assigned':
        return <UserPlus size={20} className='text-blue-600' />
      case 'comment_mention':
        return <MessageSquare size={20} className='text-purple-600' />
      case 'comment_on_task':
        return <MessageSquare size={20} className='text-green-600' />
      case 'sprint_started':
        return <PlayCircle size={20} className='text-orange-600' />
      case 'sprint_completed':
        return <CheckSquare2 size={20} className='text-emerald-600' />
      default:
        return <Bell size={20} className='text-gray-600' />
    }
  }

  const getTypeColor = () => {
    switch (notification.type) {
      case 'task_assigned':
        return 'border-l-blue-600'
      case 'comment_mention':
        return 'border-l-purple-600'
      case 'comment_on_task':
        return 'border-l-green-600'
      case 'sprint_started':
        return 'border-l-orange-600'
      case 'sprint_completed':
        return 'border-l-emerald-600'
      default:
        return 'border-l-gray-600'
    }
  }

  return (
    <div
      className={`
        max-w-sm w-full
        bg-white rounded-lg shadow-2xl border-l-4 ${getTypeColor()}
        transition-all duration-300 ease-out cursor-pointer
        hover:shadow-3xl hover:scale-[1.02]
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      onClick={handleClick}
    >
      <div className='p-4'>
        {/* Header */}
        <div className='flex items-start gap-3 mb-2'>
          {/* Icon */}
          <div className='flex-shrink-0 mt-0.5'>{getIcon()}</div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <h4 className='text-sm font-semibold text-gray-900 mb-1'>{notification.title}</h4>
            <p className='text-sm text-gray-700 line-clamp-2'>{notification.message}</p>
          </div>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className='flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors'
          >
            <X size={16} className='text-gray-500' />
          </button>
        </div>

        {/* Actor info */}
        {notification.actor && (
          <div className='flex items-center gap-2 mt-3 pt-3 border-t border-gray-100'>
            <Avatar
              avatarUrl={notification.actor.avatar}
              name={`${notification.actor.first_name} ${notification.actor.last_name}`}
              size={24}
            />
            <span className='text-xs text-gray-600'>
              {notification.actor.first_name} {notification.actor.last_name}
            </span>
            <span className='text-xs text-gray-400 ml-auto'>
              {new Date(notification.created_at).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className='h-1 bg-gray-100 rounded-b-lg overflow-hidden'>
        <div className='h-full bg-blue-600 transition-all duration-100 ease-linear' style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
