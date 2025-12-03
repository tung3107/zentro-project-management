import {
  MenuIcon,
  MessageCircleMore,
  MessageCircleQuestionIcon,
  SettingsIcon,
  SquareArrowRight,
  XIcon,
  Home,
  Bell,
  HelpCircle,
  FolderKanban,
  LogOut,
  User
} from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../auth/stores/authStore'
import Avatar from '../../../../components/Avatar'
import type { Project } from '../../../../types/project'
import { userProjectAPI } from '../../../admin/service/project.service'
import Logo from '../../../../components/Logo'
import OverlayCenterModal from '../../../../components/OverlayCenterModal'
import { useNotification } from '../notification/NotificationProvider'
import NotificationModal from '../notification/NotificationModal'

const UserMenu = ({ menuRef, logout }: { menuRef: React.RefObject<HTMLDivElement | null>; logout: () => void }) => {
  const { user } = useAuthStore()
  return (
    <div
      ref={menuRef}
      className='absolute mt-1 w-56 bg-white shadow-xl border border-gray-200 rounded-xl z-50'
      style={{
        position: 'absolute',
        left: '100%',
        top: '-80%',
        transform: 'translateY(-50%)',
        zIndex: 99
      }}
    >
      <ul className='flex flex-col py-2'>
        <li className='w-full'>
          <NavLink
            className='px-4 py-2.5 hover:bg-gray-50 cursor-pointer block text-sm font-medium text-gray-700 transition-colors'
            to={`/member/profile/${user?.user_id}`}
          >
            <div className='flex items-center gap-3'>
              <User size={18} className='text-gray-500' />
              <span>Profile</span>
            </div>
          </NavLink>
        </li>
        <li className='w-full'>
          <NavLink
            className='px-4 py-2.5 hover:bg-gray-50 cursor-pointer block text-sm font-medium text-gray-700 transition-colors'
            to='/member/settings'
          >
            <div className='flex items-center gap-3'>
              <SettingsIcon size={18} className='text-gray-500' />
              <span>Settings</span>
            </div>
          </NavLink>
        </li>
        <li className='w-full border-t border-gray-200 mt-1 pt-1'>
          <button
            className='w-full px-4 py-2.5 hover:bg-red-50 cursor-pointer block text-sm font-medium text-red-600 transition-colors text-left'
            onClick={logout}
          >
            <div className='flex items-center gap-3'>
              <LogOut size={18} className='text-red-500' />
              <span>Logout</span>
            </div>
          </button>
        </li>
      </ul>
    </div>
  )
}

const UserSection = ({ isCollapsed, onProfileClick }: { isCollapsed: boolean; onProfileClick: () => void }) => {
  const { user } = useAuthStore()
  const email = user?.email.split('@')[0]
  return (
    <div className='user-container mb-4'>
      <button
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer
                    hover:bg-gray-50 focus:outline-none border border-transparent hover:border-gray-200
                ${isCollapsed ? 'justify-center' : 'justify-start'} `}
        onClick={onProfileClick}
      >
        <Avatar size={36} name={`${user?.first_name} ${user?.last_name}`} />
        {!isCollapsed && (
          <>
            <div className='flex flex-col justify-start items-start flex-grow min-w-0 ml-3'>
              <span
                className='user-name text-sm font-semibold text-gray-900 truncate w-full text-left'
                title={`${user?.first_name} ${user?.last_name}`}
              >
                {`${user?.first_name} ${user?.last_name}`}
              </span>
              <span className='user-email text-xs text-gray-500 truncate w-full text-left' title={`${user?.email}`}>
                {`${email}@...`}
              </span>
            </div>
            <SquareArrowRight size={18} className='icon-tab text-gray-400 flex-shrink-0 ml-auto' strokeWidth={1.5} />
          </>
        )}
      </button>
    </div>
  )
}

const SidebarItem = ({
  icon,
  text,
  isCollapsed,
  isActive,
  onClick,
  badge
}: {
  icon: React.ReactNode
  text: string
  isCollapsed: boolean
  isActive: boolean
  onClick?: () => void
  badge?: number
}) => (
  <div
    onClick={onClick}
    className={`flex items-center ${
      isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'
    } mb-1 rounded-lg cursor-pointer transition-all duration-200 relative ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
        : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
    }`}
    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
  >
    <div className='flex items-center' style={{ color: isActive ? '#1d4ed8' : '#374151' }}>
      {icon}
    </div>
    {!isCollapsed && (
      <div className='flex items-center justify-between flex-1 ml-3 min-w-0'>
        <span className='text-sm font-medium truncate'>{text}</span>
        {badge !== undefined && badge > 0 && (
          <span className='ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold min-w-[20px] text-center animate-pulse'>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
    )}
    {/* Badge for collapsed state */}
    {isCollapsed && badge !== undefined && badge > 0 && (
      <span className='absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full font-semibold min-w-[18px] text-center animate-pulse'>
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </div>
)

export default function MemberSideBar({
  isCollapsed,
  setIsCollapsed
}: {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [menuOpened, setMenuOpened] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const { logout, user } = useAuthStore()
  const [logoutModalOpen, setLogOutModalOpen] = useState(false)
  const [logoutModalContent, setLogoutModalContent] = useState<React.ReactNode | null>(null)
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { unreadCount, refreshUnreadCount } = useNotification()

  // ✅ Gọi API lấy danh sách project
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.user_id) return
      try {
        const res = await userProjectAPI(user.user_id)
        if (res?.data) setProjects(res.data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    fetchProjects()
  }, [user?.user_id])

  // Xác định active project từ URL
  useEffect(() => {
    const projectMatch = location.pathname.match(/\/member\/projects\/([^/]+)/)
    if (projectMatch) {
      setActiveProject(projectMatch[1])
    }
  }, [location.pathname])

  const openLogoutModal = (element: ReactNode) => {
    setLogoutModalContent(element)
    setLogOutModalOpen(true)
  }

  const closeLogoutModal = () => {
    setLogoutModalContent(null)
    setLogOutModalOpen(false)
  }

  const handleLogout = () => {
    openLogoutModal(
      <>
        <h2 className='title'>Bạn chắc chắn chưa?</h2>
        <p className='subtitle'>Bạn chắc chắn muốn đăng xuất?</p>
      </>
    )
  }

  const handleLogoutConfirm = (logout: () => void) => {
    logout()
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menuBtn = document.getElementsByClassName('user-container')[0] as HTMLElement | undefined
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuBtn &&
        !menuBtn.contains(event.target as Node)
      ) {
        setMenuOpened(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuRef])

  // Xác định active route
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div
      className='bg-white border-r border-gray-200'
      style={{
        width: isCollapsed ? '4rem' : '16rem',
        minHeight: '100vh',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        transition: 'width 300ms ease-in-out',
        zIndex: 20,
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header */}
      <div className='header mb-6 flex items-center justify-between px-1'>
        {!isCollapsed && <Logo width={61} notext />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? (
            <MenuIcon size={20} className='text-gray-700' />
          ) : (
            <XIcon size={20} className='text-gray-700' />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: isCollapsed ? '0' : '0 0.25rem' }}>
        {/* Quick Actions */}
        <div className='mb-6'>
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 ${
              isCollapsed ? 'text-center' : 'text-left'
            }`}
          >
            {isCollapsed ? 'TT' : 'Thao tác nhanh'}
          </h3>
          <SidebarItem
            icon={<Home size={20} />}
            text='Trang chủ'
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/member/') && !location.pathname.includes('/projects')}
            onClick={() => navigate('/member/')}
          />
          <SidebarItem
            icon={<Bell size={20} />}
            text='Thông báo'
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/member/notifications')}
            badge={unreadCount}
            onClick={() => {
              setNotificationModalOpen(true)
            }}
          />
        </div>

        {/* Projects Section */}
        <div className='mb-6'>
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 ${
              isCollapsed ? 'text-center' : 'text-left'
            }`}
          >
            {isCollapsed ? 'D' : 'Dự án'}
          </h3>

          {projects.length === 0 ? (
            <div className='flex flex-col items-center text-center mt-8 px-2'>
              <img src='/Not Found.png' alt='Không tìm thấy dự án' className='w-32 h-32 object-contain opacity-70' />
              {!isCollapsed && (
                <p className='text-gray-500 text-xs mt-4 leading-relaxed'>
                  Bạn chưa được thêm vào dự án nào. <br />
                  <span className='text-gray-400'>Liên hệ Admin để được thêm vào dự án.</span>
                </p>
              )}
            </div>
          ) : (
            <div className='space-y-1'>
              {projects.map((project) => (
                <SidebarItem
                  key={project.project_id}
                  icon={<Avatar name={project.project_name} avatarUrl={project.avatar || undefined} size={28} />}
                  text={project.project_name}
                  isCollapsed={isCollapsed}
                  isActive={activeProject === project.project_id}
                  onClick={() => {
                    setActiveProject(project.project_id)
                    navigate(`/member/projects/${project.project_id}`)
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Communication Section */}
        <div className='mb-6'>
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 ${
              isCollapsed ? 'text-center' : 'text-left'
            }`}
          >
            {isCollapsed ? 'K' : 'Kết nối'}
          </h3>
          <SidebarItem
            icon={<MessageCircleMore size={20} />}
            text='Tin nhắn'
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/member/chat')}
            onClick={() => {
              navigate('/member/chat')
            }}
          />
          <SidebarItem
            icon={<MessageCircleQuestionIcon size={20} />}
            text='AI Chatbot'
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/member/ai-chatbot')}
            onClick={() => {
              navigate('/member/ai-chatbot')
            }}
          />
        </div>

        {/* Tools & Settings */}
        <div className='mb-6'>
          <h3
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1 ${
              isCollapsed ? 'text-center' : 'text-left'
            }`}
          >
            {isCollapsed ? 'T' : 'Cài đặt và tiện ích'}
          </h3>
          <SidebarItem
            icon={<SettingsIcon size={20} />}
            text='Cài đặt'
            isCollapsed={isCollapsed}
            isActive={isActiveRoute('/member/settings')}
            onClick={() => {
              navigate('/member/settings')
            }}
          />
        </div>
      </div>

      {/* User Section */}
      <div style={{ position: 'relative', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <UserSection isCollapsed={isCollapsed} onProfileClick={() => setMenuOpened(!menuOpened)} />
        {menuOpened && <UserMenu menuRef={menuRef} logout={handleLogout} />}
      </div>

      {/* Logout Modal */}
      <OverlayCenterModal
        isOpen={logoutModalOpen}
        onClose={closeLogoutModal}
        setModalOpen={setLogOutModalOpen}
        setModalContent={setLogoutModalContent}
        onSubmit={() => handleLogoutConfirm(logout)}
        title='Xác nhận'
        formable={false}
      >
        {logoutModalContent}
      </OverlayCenterModal>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        onUnreadCountChange={refreshUnreadCount}
      />
    </div>
  )
}
