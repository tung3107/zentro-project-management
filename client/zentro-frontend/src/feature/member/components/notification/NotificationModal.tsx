import { useEffect, useState, useRef } from 'react'
import { X, Bell, CheckCircle, Trash2, MessageSquare, PlayCircle, CheckSquare2, UserPlus, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Notification } from '../../../../types/notification'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../service/notification.service'
import Avatar from '../../../../components/Avatar'
import { Skeleton } from 'primereact/skeleton'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../../../auth/stores/authStore'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

export default function NotificationModal({ isOpen, onClose, onUnreadCountChange }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const navigate = useNavigate()
  const modalRef = useRef<HTMLDivElement>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      loadNotifications()

      // Connect socket for realtime updates when modal is open
      if (accessToken) {
        const newSocket = io('http://localhost:5000', {
          auth: { token: accessToken }
        })

        newSocket.on('new_notification', (notification: Notification) => {
          console.log('🔔 New notification in modal:', notification)
          // Add new notification to the list
          setNotifications((prev) => [notification, ...prev])
        })

        setSocket(newSocket)

        return () => {
          newSocket.disconnect()
        }
      }
    }
  }, [isOpen, filter, accessToken])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await getNotifications({
        limit: 50,
        offset: 0,
        unread_only: filter === 'unread'
      })
      setNotifications(response.data.rows)

      // Update unread count
      if (onUnreadCountChange) {
        const unreadCount = response.data.rows.filter((n) => !n.is_read).length
        onUnreadCountChange(unreadCount)
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await markAsRead(notification.notification_id)
        setNotifications((prev) =>
          prev.map((n) => (n.notification_id === notification.notification_id ? { ...n, is_read: true } : n))
        )

        // Update unread count
        if (onUnreadCountChange) {
          const unreadCount = notifications.filter(
            (n) => !n.is_read && n.notification_id !== notification.notification_id
          ).length
          onUnreadCountChange(unreadCount)
        }
      }

      // Navigate to link
      if (notification.link) {
        navigate(notification.link)
        onClose()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      if (onUnreadCountChange) {
        onUnreadCountChange(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.notification_id !== notificationId))

      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find((n) => n.notification_id === notificationId)
      if (deletedNotification && !deletedNotification.is_read && onUnreadCountChange) {
        const unreadCount = notifications.filter((n) => !n.is_read && n.notification_id !== notificationId).length
        onUnreadCountChange(unreadCount)
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_assigned':
        return <UserPlus size={18} className='text-blue-600' />
      case 'comment_mention':
        return <MessageSquare size={18} className='text-purple-600' />
      case 'comment_on_task':
        return <MessageSquare size={18} className='text-green-600' />
      case 'sprint_started':
        return <PlayCircle size={18} className='text-orange-600' />
      case 'sprint_completed':
        return <CheckSquare2 size={18} className='text-emerald-600' />
      default:
        return <Bell size={18} className='text-gray-600' />
    }
  }

  const formatTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-200'>
      {/* Transparent backdrop */}
      <div className='fixed inset-0' onClick={onClose} />

      {/* Modal positioned near notification bell */}
      <div
        ref={modalRef}
        className='fixed top-20 z-100 left-72 bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-gray-200'
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {/* Arrow pointing to notification bell */}
        <div className='absolute -left-3 top-8 w-6 h-6 bg-white border-l border-t border-gray-200 transform rotate-45' />

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 relative z-10 bg-white rounded-t-xl'>
          <div className='flex items-center gap-3'>
            <Bell size={24} className='text-gray-700' />
            <h2 className='text-xl font-bold text-gray-900'>Thông báo</h2>
          </div>
          <button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
            <X size={20} className='text-gray-600' />
          </button>
        </div>

        {/* Filter tabs */}
        <div className='flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 relative z-10'>
          <div className='flex gap-2'>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Chưa đọc
            </button>
          </div>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className='px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium'
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className='flex-1 overflow-y-auto'>
          {isLoading ? (
            <div className='p-6 space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex gap-3'>
                  <Skeleton shape='circle' size='3rem' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton width='100%' height='1.5rem' />
                    <Skeleton width='80%' height='1rem' />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
              <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <Inbox size={40} className='text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Không có thông báo</h3>
              <p className='text-sm text-gray-500'>
                {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào'}
              </p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {notifications.map((notification) => (
                <div
                  key={notification.notification_id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className='flex items-start gap-3'>
                    {/* Icon */}
                    <div className='flex-shrink-0 mt-1'>{getIcon(notification.type)}</div>

                    {/* Actor Avatar */}
                    {notification.actor && (
                      <div className='flex-shrink-0'>
                        <Avatar
                          avatarUrl={notification.actor.avatar}
                          name={`${notification.actor.first_name} ${notification.actor.last_name}`}
                          size={40}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-semibold text-gray-900 mb-1'>{notification.title}</h4>
                      <p className='text-sm text-gray-700 mb-2'>{notification.message}</p>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <span>{formatTime(notification.created_at)}</span>
                        {notification.project && (
                          <>
                            <span>•</span>
                            <span className='text-blue-600'>{notification.project.project_name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator & Actions */}
                    <div className='flex items-center gap-2 flex-shrink-0'>
                      {!notification.is_read && (
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse' title='Chưa đọc' />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDelete(notification.notification_id, e)}
                        className='p-1.5 hover:bg-red-50 rounded transition-colors'
                        title='Xóa'
                      >
                        <Trash2 size={14} className='text-red-600' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
