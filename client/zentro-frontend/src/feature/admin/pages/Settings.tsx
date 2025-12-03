import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Moon,
  Eye,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Laptop,
  Trash2,
  Lock,
  MapPin,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import api from '../../../util/axiosClient'

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  task_assigned: boolean
  task_completed: boolean
  comment_mention: boolean
  sprint_updates: boolean
  project_updates: boolean
}

interface GeneralSettings {
  theme: 'light' | 'dark' | 'auto'
  timezone: string
}

interface Device {
  id: number
  device_name: string
  ip_address: string
  location: string
  last_active: string
  is_current?: boolean
}

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'notifications' | 'general' | 'security'>('notifications')
  const [isSaving, setIsSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    task_assigned: true,
    task_completed: true,
    comment_mention: true,
    sprint_updates: true,
    project_updates: true
  })

  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    theme: (localStorage.getItem('theme') as 'light' | 'dark' | 'auto') || 'light',
    timezone: 'Asia/Ho_Chi_Minh'
  })

  // Security Settings
  const [devices, setDevices] = useState<Device[]>([])
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement
    const theme = generalSettings.theme
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.remove('light', 'dark')
      root.classList.add(systemTheme)
    } else {
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }
    
    localStorage.setItem('theme', theme)
  }, [generalSettings.theme])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setGeneralSettings(prev => ({ ...prev, timezone: user.timezone || 'Asia/Ho_Chi_Minh' }))
      }
    } catch (error) {
      console.error('Error fetching initial data', error)
    }
  }

  const fetchDevices = async () => {
    try {
      const res = await api.get('/auth/devices')
      setDevices(res.data.data.devices)
    } catch (error) {
      toast.error('Không thể tải danh sách thiết bị')
    }
  }

  useEffect(() => {
    if (activeTab === 'security') {
      fetchDevices()
    }
  }, [activeTab])

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Đã lưu cài đặt thông báo!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveGeneral = async () => {
    setIsSaving(true)
    try {
      // Save timezone
      await api.put('/users/timezone', { timezone: generalSettings.timezone })
      
      // Update local storage user
      if (currentUser) {
        const updatedUser = { ...currentUser, timezone: generalSettings.timezone }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setCurrentUser(updatedUser)
      }

      toast.success('Đã lưu cài đặt chung!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    
    setIsSaving(true)
    try {
      await api.post('/auth/change-password', {
        email: currentUser?.email,
        password: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success('Đổi mật khẩu thành công!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRevokeDevice = async (deviceId: number) => {
    try {
      await api.delete(`/auth/devices/${deviceId}`)
      toast.success('Đã đăng xuất thiết bị!')
      fetchDevices()
    } catch (error) {
      toast.error('Lỗi khi đăng xuất thiết bị!')
    }
  }

  return (
    <div className='flex flex-col h-full' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            title='Quay lại'
          >
            <ArrowLeft size={20} className='text-gray-700' />
          </button>
          <h1 className='text-xl font-bold text-gray-900'>Cài đặt</h1>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 flex overflow-hidden bg-gray-50'>
        {/* Sidebar Tabs */}
        <div className='w-64 bg-white border-r border-gray-200 p-4'>
          <nav className='space-y-2'>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell size={18} />
              <span>Thông báo</span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye size={18} />
              <span>Cài đặt chung</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={18} />
              <span>Bảo mật & Đăng nhập</span>
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className='flex-1 overflow-auto p-6'>
          <div className='max-w-3xl'>
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>Cài đặt thông báo</h2>
                  <p className='text-sm text-gray-600'>Quản lý cách bạn nhận thông báo từ hệ thống</p>
                </div>

                {/* Notification Channels */}
                <div className='space-y-4 pb-6 border-b border-gray-200'>
                  <h3 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Kênh thông báo</h3>

                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center gap-3'>
                      <Mail size={20} className='text-gray-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>Email</p>
                        <p className='text-xs text-gray-500'>Nhận thông báo qua email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('email_notifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.email_notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center gap-3'>
                      <Smartphone size={20} className='text-gray-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>Push Notification</p>
                        <p className='text-xs text-gray-500'>Nhận thông báo đẩy trên trình duyệt</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('push_notifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationSettings.push_notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Notification Types */}
                <div className='space-y-4'>
                  <h3 className='text-sm font-semibold text-gray-700 uppercase tracking-wide'>Loại thông báo</h3>

                  <div className='space-y-3'>
                    <div className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                      <div className='flex items-center gap-3'>
                        <CheckCircle2 size={18} className='text-gray-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Task được gán</p>
                          <p className='text-xs text-gray-500'>Khi bạn được gán một task mới</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('task_assigned')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.task_assigned ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.task_assigned ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                      <div className='flex items-center gap-3'>
                        <CheckCircle2 size={18} className='text-gray-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Task hoàn thành</p>
                          <p className='text-xs text-gray-500'>Khi task của bạn được đánh dấu hoàn thành</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('task_completed')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.task_completed ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.task_completed ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                      <div className='flex items-center gap-3'>
                        <MessageSquare size={18} className='text-gray-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Được nhắc đến trong comment</p>
                          <p className='text-xs text-gray-500'>Khi ai đó @mention bạn trong comment</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('comment_mention')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.comment_mention ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.comment_mention ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                      <div className='flex items-center gap-3'>
                        <Calendar size={18} className='text-gray-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Cập nhật Sprint</p>
                          <p className='text-xs text-gray-500'>Khi sprint bắt đầu hoặc kết thúc</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('sprint_updates')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.sprint_updates ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.sprint_updates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors'>
                      <div className='flex items-center gap-3'>
                        <Bell size={18} className='text-gray-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>Cập nhật dự án</p>
                          <p className='text-xs text-gray-500'>Thông báo quan trọng về dự án</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationToggle('project_updates')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notificationSettings.project_updates ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notificationSettings.project_updates ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className='pt-6 border-t border-gray-200'>
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className='w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>Cài đặt chung</h2>
                  <p className='text-sm text-gray-600'>Tùy chỉnh giao diện và múi giờ</p>
                </div>

                <div className='space-y-4'>
                  {/* Theme */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-3'>Giao diện</label>
                    <div className='grid grid-cols-3 gap-3'>
                      {(['light', 'dark', 'auto'] as const).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setGeneralSettings((prev) => ({ ...prev, theme }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            generalSettings.theme === theme
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className='flex flex-col items-center gap-2'>
                            {theme === 'light' ? (
                              <Eye size={24} className='text-gray-700' />
                            ) : theme === 'dark' ? (
                              <Moon size={24} className='text-gray-700' />
                            ) : (
                              <Laptop size={24} className='text-gray-700' />
                            )}
                            <span className='text-sm font-medium text-gray-900 capitalize'>
                              {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-3'>Múi giờ</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='Asia/Ho_Chi_Minh'>Việt Nam (GMT+7)</option>
                      <option value='Asia/Bangkok'>Bangkok (GMT+7)</option>
                      <option value='Asia/Singapore'>Singapore (GMT+8)</option>
                      <option value='Asia/Tokyo'>Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <div className='pt-6 border-t border-gray-200'>
                  <button
                    onClick={handleSaveGeneral}
                    disabled={isSaving}
                    className='w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className='space-y-6'>
                {/* Change Password */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                  <div>
                    <h2 className='text-lg font-bold text-gray-900 mb-2'>Đổi mật khẩu</h2>
                    <p className='text-sm text-gray-600'>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu hiện tại</label>
                      <div className='relative'>
                        <Lock size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                          type='password'
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='Nhập mật khẩu hiện tại'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Mật khẩu mới</label>
                      <div className='relative'>
                        <Lock size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                          type='password'
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='Nhập mật khẩu mới'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Xác nhận mật khẩu mới</label>
                      <div className='relative'>
                        <Lock size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                        <input
                          type='password'
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className='w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                          placeholder='Nhập lại mật khẩu mới'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='pt-4'>
                    <button
                      onClick={handleChangePassword}
                      disabled={isSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                      className='px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </div>

                {/* Active Devices */}
                <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                  <div>
                    <h2 className='text-lg font-bold text-gray-900 mb-2'>Thiết bị đăng nhập</h2>
                    <p className='text-sm text-gray-600'>Danh sách các thiết bị đang đăng nhập vào tài khoản của bạn</p>
                  </div>

                  <div className='space-y-4'>
                    {devices.map((device) => (
                      <div key={device.id} className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                        <div className='flex items-center gap-4'>
                          <div className='p-2 bg-white rounded-lg border border-gray-200'>
                            {device.device_name.toLowerCase().includes('mobile') || device.device_name.toLowerCase().includes('phone') ? (
                              <Smartphone size={24} className='text-gray-600' />
                            ) : (
                              <Laptop size={24} className='text-gray-600' />
                            )}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900 flex items-center gap-2'>
                              {device.device_name}
                              {device.is_current && (
                                <span className='px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium'>
                                  Hiện tại
                                </span>
                              )}
                            </p>
                            <div className='flex items-center gap-4 text-xs text-gray-500 mt-1'>
                              <span className='flex items-center gap-1'>
                                <MapPin size={12} />
                                {device.location || 'Unknown'}
                              </span>
                              <span className='flex items-center gap-1'>
                                <Clock size={12} />
                                {new Date(device.last_active).toLocaleString('vi-VN')}
                              </span>
                              <span>IP: {device.ip_address}</span>
                            </div>
                          </div>
                        </div>
                        {!device.is_current && (
                          <button
                            onClick={() => handleRevokeDevice(device.id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title='Đăng xuất thiết bị này'
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}

                    {devices.length === 0 && (
                      <div className='text-center py-8 text-gray-500'>
                        Không có thông tin thiết bị
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
