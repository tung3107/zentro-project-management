import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '../service/user.service'
import type { User } from '../../../types/user'
import Avatar from '../../../components/Avatar'
import { Skeleton } from 'primereact/skeleton'
import { Mail, Phone, User as UserIcon, ArrowLeft, Edit, Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '../../auth/stores/authStore'

export default function Profile() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const isOwnProfile = userId === currentUser?.user_id

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        if (userId) {
          const data = await getUserProfile(userId)
          setUser(data)
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  if (loading) {
    return (
      <div className='flex-1 bg-white rounded-xl border border-gray-200 p-6'>
        <div className='flex items-center gap-4 mb-6'>
          <Skeleton shape='circle' size='5rem' />
          <div className='flex-1 space-y-2'>
            <Skeleton width='200px' height='1.5rem' />
            <Skeleton width='150px' height='1rem' />
          </div>
        </div>
        <div className='space-y-4'>
          <Skeleton width='100%' height='4rem' />
          <Skeleton width='100%' height='4rem' />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center'>
        <img src='/Not Found.png' alt='User not found' className='w-[200px] h-[200px] object-contain opacity-90' />
        <h1 className='text-xl font-semibold text-gray-800 mt-4'>Không tìm thấy người dùng</h1>
        <button
          onClick={() => navigate(-1)}
          className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className='flex-1 bg-white rounded-xl border border-gray-200 overflow-visible'>
      {/* Header with back button */}
      <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
            title='Quay lại'
          >
            <ArrowLeft size={20} className='text-gray-700' />
          </button>
          <h1 className='text-xl font-semibold text-gray-800'>Thông tin người dùng</h1>
        </div>
        {isOwnProfile && (
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/member/settings')}
              className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium'
            >
              <SettingsIcon size={18} />
              Cài đặt
            </button>
            <button
              onClick={() => navigate('/member/profile/edit')}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className='p-6'>
        {/* Profile Header */}
        <div className='flex items-start gap-6 mb-8 pb-6 border-b border-gray-200'>
          <div className='flex-shrink-0'>
            <Avatar
              avatarUrl={user?.user?.avatar}
              name={`${user?.user?.first_name} ${user?.user?.last_name}`}
              size={120}
            />
          </div>
          <div className='flex-1'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              {user?.user?.first_name} {user?.user?.last_name}
            </h2>
            {user.role?.role_name && (
              <div className='inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4'>
                <UserIcon size={16} />
                <span>{user.role?.role_name}</span>
              </div>
            )}
            <div className='space-y-2 mt-4'>
              <div className='flex items-center gap-3 text-gray-700'>
                <Mail size={18} className='text-gray-500' />
                <span className='text-sm'>{user.user?.email}</span>
              </div>
              {user.user?.phone && (
                <div className='flex items-center gap-3 text-gray-700'>
                  <Phone size={18} className='text-gray-500' />
                  <span className='text-sm'>{user.user?.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Information Card */}
          <div className='bg-gray-50 rounded-lg border border-gray-200 p-4'>
            <h3 className='text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide'>Thông tin cá nhân</h3>
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-gray-500 uppercase tracking-wide'>Họ</label>
                <p className='text-sm font-medium text-gray-900 mt-1'>{user?.user?.first_name || 'N/A'}</p>
              </div>
              <div>
                <label className='text-xs text-gray-500 uppercase tracking-wide'>Tên</label>
                <p className='text-sm font-medium text-gray-900 mt-1'>{user?.user?.last_name || 'N/A'}</p>
              </div>
              <div>
                <label className='text-xs text-gray-500 uppercase tracking-wide'>Email</label>
                <p className='text-sm font-medium text-gray-900 mt-1'>{user?.user?.email || 'N/A'}</p>
              </div>
              {user.user?.phone && (
                <div>
                  <label className='text-xs text-gray-500 uppercase tracking-wide'>Số điện thoại</label>
                  <p className='text-sm font-medium text-gray-900 mt-1'>{user?.user?.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Information Card */}
          <div className='bg-gray-50 rounded-lg border border-gray-200 p-4'>
            <h3 className='text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide'>Vai trò trong dự án</h3>
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-gray-500 uppercase tracking-wide'>Vai trò trong dự án</label>
                <p className='text-sm font-medium text-gray-900 mt-1'>
                  {user.role_name || user.role?.role_name || 'N/A'}
                </p>
              </div>
              <div>
                <label className='text-xs text-gray-500 uppercase tracking-wide'>ID người dùng</label>
                <p className='text-sm font-medium text-gray-900 mt-1 font-mono'>{user.user_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
