import { MenuIcon, SettingsIcon, SquareArrowRight, XIcon } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import Logo from '../../../components/Logo'
import Avatar from '../../../components/Avatar'
import { useAuthStore } from '../../auth/stores/authStore'
import { NavLink, useNavigate } from 'react-router-dom'
import OverlayCenterModal from '../../../components/OverlayCenterModal'
import type { Project } from '../../../types/project'
import { userProjectAPI } from '../../admin/service/project.service'

const UserMenu = ({ menuRef, logout }: { menuRef: React.RefObject<HTMLDivElement>; logout: () => void }) => {
  return (
    <div
      ref={menuRef}
      className='absolute mt-1 w-48 bg-white shadow-[4px_-4px_20px_2px_rgb(0,0,0,0.25)] rounded-xl'
      style={{
        position: 'absolute',
        left: '100%',
        top: '-80%',
        transform: 'translateY(-50%)',
        zIndex: 99
      }}
    >
      <ul className='flex flex-col items-start py-2'>
        <li className='w-full'>
          <NavLink className='px-4 py-2 hover:bg-gray-100 cursor-pointer block' to='/app/profile'>
            Profile
          </NavLink>
        </li>
        <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer'>
          <button className='w-full block'>Setting</button>
        </li>
        <li className='px-4 py-2 hover:bg-gray-100 cursor-pointer w-full'>
          <button className='block cursor-pointer' onClick={logout}>
            Logout
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
        className={`w-full flex items-center p-2.5 rounded-lg transition duration-150 ease-in-out 
                    hover:bg-gray-100 focus:outline-none ring-2 ring-gray-300
                ${isCollapsed ? 'justify-center' : 'justify-start'} `}
        onClick={onProfileClick}
      >
        <Avatar size={34} name={`${user?.first_name} ${user?.last_name}`} />
        {!isCollapsed && (
          <>
            <div className='flex flex-col justify-start items-start flex-grow min-w-0 ml-3'>
              <span
                className='user-name text-sm font-semibold text-gray-800 truncate w-full text-left'
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
  onClick
}: {
  icon: React.ReactNode
  text: string
  isCollapsed: boolean
  isActive: boolean
  onClick?: () => void
}) => (
  <div
    onClick={onClick}
    className={`flex items-center ${
      isCollapsed ? 'justify-center p-3' : 'p-3 pl-4'
    } mb-1 rounded-lg cursor-pointer transition-all ${
      isActive ? 'bg-gray-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    {!isCollapsed && <span className='ml-3 truncate'>{text}</span>}
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
  const menuRef = useRef(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<string | null>(null)
  const { logout, user } = useAuthStore()
  const [logoutModalOpen, setLogOutModalOpen] = useState(false)
  const [logoutModalContent, setLogoutModalContent] = useState<React.ReactNode | null>(null)
  const navigate = useNavigate()

  // ✅ Gọi API lấy danh sách project
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await userProjectAPI(user?.user_id)
        if (res?.data) setProjects(res.data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    fetchProjects()
  }, [user?.user_id])

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

  return (
    <div
      style={{
        width: isCollapsed ? '4rem' : '16rem',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        transition: 'width 300ms',
        zIndex: 20
      }}
    >
      <div className='header mb-4 flex items-center justify-between px-2'>
        {!isCollapsed && <Logo width={61} notext />}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className='p-2 rounded-full hover:bg-gray-100 transition'>
          {isCollapsed ? <MenuIcon color='#717D84' /> : <XIcon color='#717D84' />}
        </button>
      </div>

      {/* Projects */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: isCollapsed ? '0' : '0 0.5rem' }}>
        <h3
          className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ${
            isCollapsed ? 'text-center' : 'text-left'
          }`}
        >
          {isCollapsed ? 'P' : 'Projects'}
        </h3>

        {projects.length === 0 ? (
          <div className='flex flex-col items-center text-center mt-8 px-2'>
            <img src='/Not Found.png' alt='No Projects Found' className='w-40 h-40 object-contain opacity-90' />
            {!isCollapsed && (
              <p className='text-gray-600 text-sm  '>
                Bạn chưa được thêm vào dự án nào. <br />
                Liên hệ Admin để được thêm vào dự án.
              </p>
            )}
          </div>
        ) : (
          projects.map((project) => (
            <SidebarItem
              key={project.project_id}
              icon={<Avatar name={project.project_name} avatarUrl={project.avatar || undefined} size={30} />}
              text={project.project_name}
              isCollapsed={isCollapsed}
              isActive={activeProject === project.project_id}
              onClick={() => {
                setActiveProject(project.project_id)
                navigate(`/member/projects/${project.project_id}`)
              }}
            />
          ))
        )}

        <div className='my-4 h-px bg-gray-200'></div>

        <SidebarItem icon={<SettingsIcon />} text='Settings' isCollapsed={isCollapsed} isActive={false} />
      </div>

      {/* User */}
      <div style={{ position: 'relative', marginTop: '5rem', padding: isCollapsed ? '0' : '0 0.5rem' }}>
        <UserSection isCollapsed={isCollapsed} onProfileClick={() => setMenuOpened(!menuOpened)} />
        {menuOpened && <UserMenu menuRef={menuRef} logout={handleLogout} />}
      </div>

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
    </div>
  )
}
