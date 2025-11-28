import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Smartphone,
  Mail,
  MessageSquare,
  Calendar,
  CheckCircle2
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
  language: 'vi' | 'en'
  timezone: string
}

export default function Settings() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'notifications' | 'general' | 'security' | 'privacy'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

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
    theme: 'light',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh'
  })

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      // TODO: Add API call to save notification settings
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
      // TODO: Add API call to save general settings
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('Đã lưu cài đặt chung!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt!')
    } finally {
      setIsSaving(false)
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
              <Globe size={18} />
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
              <Lock size={18} />
              <span>Bảo mật</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={18} />
              <span>Quyền riêng tư</span>
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
                  <p className='text-sm text-gray-600'>Tùy chỉnh giao diện và ngôn ngữ</p>
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
                              <Globe size={24} className='text-gray-700' />
                            )}
                            <span className='text-sm font-medium text-gray-900 capitalize'>
                              {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Tự động'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-3'>Ngôn ngữ</label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({ ...prev, language: e.target.value as 'vi' | 'en' }))
                      }
                      className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='vi'>Tiếng Việt</option>
                      <option value='en'>English</option>
                    </select>
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
              <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>Bảo mật</h2>
                  <p className='text-sm text-gray-600'>Quản lý mật khẩu và bảo mật tài khoản</p>
                </div>

                <div className='space-y-4'>
                  <button className='w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Lock size={20} className='text-gray-600' />
                      <div className='text-left'>
                        <p className='text-sm font-medium text-gray-900'>Đổi mật khẩu</p>
                        <p className='text-xs text-gray-500'>Cập nhật mật khẩu của bạn</p>
                      </div>
                    </div>
                    <ArrowLeft size={18} className='text-gray-400 rotate-180' />
                  </button>

                  <button className='w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Shield size={20} className='text-gray-600' />
                      <div className='text-left'>
                        <p className='text-sm font-medium text-gray-900'>Xác thực hai yếu tố</p>
                        <p className='text-xs text-gray-500'>Tăng cường bảo mật tài khoản</p>
                      </div>
                    </div>
                    <ArrowLeft size={18} className='text-gray-400 rotate-180' />
                  </button>

                  <button className='w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Smartphone size={20} className='text-gray-600' />
                      <div className='text-left'>
                        <p className='text-sm font-medium text-gray-900'>Thiết bị đã đăng nhập</p>
                        <p className='text-xs text-gray-500'>Quản lý các phiên đăng nhập</p>
                      </div>
                    </div>
                    <ArrowLeft size={18} className='text-gray-400 rotate-180' />
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-6'>
                <div>
                  <h2 className='text-lg font-bold text-gray-900 mb-2'>Quyền riêng tư</h2>
                  <p className='text-sm text-gray-600'>Quản lý quyền riêng tư và dữ liệu cá nhân</p>
                </div>

                <div className='space-y-4'>
                  <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex items-start gap-3'>
                      <Shield size={20} className='text-blue-600 mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-blue-900 mb-1'>Dữ liệu của bạn được bảo vệ</p>
                        <p className='text-xs text-blue-700'>
                          Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý của
                          bạn.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button className='w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Eye size={20} className='text-gray-600' />
                      <div className='text-left'>
                        <p className='text-sm font-medium text-gray-900'>Ai có thể xem profile của bạn</p>
                        <p className='text-xs text-gray-500'>Quản lý quyền xem thông tin cá nhân</p>
                      </div>
                    </div>
                    <span className='text-sm text-gray-500'>Tất cả thành viên</span>
                  </button>

                  <button className='w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'>
                    <div className='flex items-center gap-3'>
                      <Mail size={20} className='text-gray-600' />
                      <div className='text-left'>
                        <p className='text-sm font-medium text-gray-900'>Chia sẻ email với team</p>
                        <p className='text-xs text-gray-500'>Cho phép thành viên khác xem email</p>
                      </div>
                    </div>
                    <span className='text-sm text-gray-500'>Đã bật</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
