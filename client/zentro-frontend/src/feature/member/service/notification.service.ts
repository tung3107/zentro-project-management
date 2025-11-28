import api from '../../../util/axiosClient'
import type { Notification, NotificationResponse } from '../../../types/notification'

export const getNotifications = async (params?: {
  limit?: number
  offset?: number
  unread_only?: boolean
}): Promise<{ data: NotificationResponse }> => {
  const queryParams = new URLSearchParams()
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.offset) queryParams.append('offset', params.offset.toString())
  if (params?.unread_only) queryParams.append('unread_only', 'true')

  const response = await api.get(`/notifications?${queryParams.toString()}`)
  return response.data
}

export const getUnreadCount = async (): Promise<{ data: { count: number } }> => {
  const response = await api.get('/notifications/unread-count')
  return response.data
}

export const markAsRead = async (notificationId: number): Promise<{ data: Notification }> => {
  const response = await api.patch(`/notifications/${notificationId}/read`)
  return response.data
}

export const markAllAsRead = async (): Promise<{ data: null }> => {
  const response = await api.patch('/notifications/mark-all-read')
  return response.data
}

export const deleteNotification = async (notificationId: number): Promise<{ data: null }> => {
  const response = await api.delete(`/notifications/${notificationId}`)
  return response.data
}
