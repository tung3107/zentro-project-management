import { createContext, useContext, useEffect, useState, useRef } from 'react'
import type { ReactNode } from 'react'
import socketClient from '../../../../util/socketClient'
import { useAuthStore } from '../../../auth/stores/authStore'
import type { Notification } from '../../../../types/notification'
import { getUnreadCount } from '../../service/notification.service'
import NotificationToast from './NotificationToast'
import { useNavigate } from 'react-router-dom'

interface NotificationContextType {
  unreadCount: number
  refreshUnreadCount: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {}
})

export const useNotification = () => useContext(NotificationContext)

interface NotificationProviderProps {
  children: ReactNode
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [toastQueue, setToastQueue] = useState<Notification[]>([])
  const { user, accessToken } = useAuthStore()
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize notification sound
  useEffect(() => {
    // Create notification sound
    const audio = new Audio()
    // Simple beep sound data URL
    audio.volume = 0.5
    audioRef.current = audio
  }, [])

  // Initialize socket connection
  useEffect(() => {
    socketClient.connect()

    const handleNewNotification = (notification: Notification) => {
      console.log('🔔 New notification received:', notification)

      // Add to toast queue
      setToastQueue((prev) => [...prev, notification])

      // Update unread count immediately
      setUnreadCount((prev) => prev + 1)

      // Play notification sound
      playNotificationSound()
    }

    socketClient.onNewNotification(handleNewNotification)

    return () => {
      socketClient.offNewNotification()
    }
  }, [])

  // Load initial unread count
  useEffect(() => {
    refreshUnreadCount()
  }, [])

  const playNotificationSound = () => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  const refreshUnreadCount = async () => {
    try {
      const response = await getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const handleToastClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link)
    }
    removeToast(notification.notification_id)
  }

  const removeToast = (notificationId: number) => {
    setToastQueue((prev) => prev.filter((n) => n.notification_id !== notificationId))
  }

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}

      {/* Toast notifications - stacked */}
      <div className='fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none'>
        {toastQueue.map((notification, index) => (
          <div
            key={notification.notification_id}
            className='pointer-events-auto'
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <NotificationToast
              notification={notification}
              onClose={() => removeToast(notification.notification_id)}
              onClick={() => handleToastClick(notification)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
