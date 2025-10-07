import { useEffect, useRef, useState, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from 'react'
import styled, { css } from 'styled-components'
import { MenuIcon, SquareArrowRight, XIcon } from 'lucide-react'
import { useAuthStore } from '../../auth/stores/authStore'
import Avatar from '../../../components/Avatar'
import Logo from '../../../components/Logo'
import Navigation from '../../../components/Navigation'
import { menuItems } from '../../../types/adminTab'
import { NavLink } from 'react-router-dom'
import OverlayCenterModal from '../../../components/OverlayCenterModal'

const SideBarStyle = styled.div<{ isCollapsed: boolean; isActive?: void }>`
  background-color: white;
  color: black;
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: ease-in-out;
  min-height: 100vh;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  //   border-right: 1px solid rgb(106, 106, 106); /* slate-700 */
  position: fixed;
  z-index: 50;
  display: flex;
  flex-direction: column;

  ${({ isCollapsed }) =>
    isCollapsed
      ? css`
          width: 4rem;
        `
      : css`
          width: 16rem;
        `}

  .header {
    padding: 1rem 1.5rem;
    // border-bottom: 2px solid var(--var-header-border);
  }
  .header button {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 0.15s;
    cursor: pointer;
    background-color: transparent;
    background-image: none;
    border: none;
    height: 20px;
  }
  .navigation {
    padding: 1.5rem;
    ${({ isCollapsed }) =>
      isCollapsed &&
      `
      display: flex;
    justify-content: center;
  `}
    flex: 1;
  }
  .nav-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .nav-list li {
    list-style-type: none;

    a {
      text-decoration: none;
      color: inherit;
      display: block;
      padding: 0.5rem 0.75rem;
      transition:
        background-color 0.2s,
        color 0.2s;
      border-radius: 0.5rem;
    }

    &.active a {
      background-color: var(--primary);
      color: white;
    }

    a:hover {
      background-color: #cbd5e1; /* slate-300 */
    }

    .tab-container {
      display: flex;
      align-items: center;
      gap: 14px;
      span {
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  .user-profile-container {
    ${({ isCollapsed }) =>
      isCollapsed
        ? `padding: 0;
  `
        : `padding: 1rem 0.75rem 1rem 2rem;`}

    margin-bottom: 2rem;
  }
  .user-container {
    width: 100%;
    padding: 10px 0;
    border-top: 2px solid var(--var-header-border);
    ${({ isCollapsed }) =>
      isCollapsed &&
      `
    justify-content: center;
  `}

    .user-name {
      font-weight: 700;
    }
    .user-email {
      color: #808080;
      font-size: 12px;
    }
  }
`

const UserMenu = ({ menuRef, logout }: { menuRef: React.RefObject<HTMLDivElement>; logout: () => void }) => {
  return (
    <div
      ref={menuRef}
      className='absolute  mt-2 w-48 bg-white shadow-[4px_-4px_20px_2px_rgb(0,0,0,0.25)] rounded-xl'
      style={{
        position: 'absolute',
        left: '100%', // đẩy sang phải bên cạnh UserSection
        top: '10%', // giữa theo chiều dọc avatar
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
    <div className='user-profile-container'>
      <button
        className='user-container'
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        onClick={onProfileClick}
      >
        <Avatar size={34} name={`${user?.first_name} ${user?.last_name}`} />
        {!isCollapsed && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start'
              }}
            >
              <span className='user-name'>{`${user?.first_name} ${user?.last_name}`}</span>
              <span className='user-email'>{`${email}@...`}</span>
            </div>
            <SquareArrowRight size={24} className='icon-tab' strokeWidth={1.5} />
          </>
        )}
      </button>
    </div>
  )
}

interface SideBar {
  isCollapsed: boolean
  setIsCollapsed: Dispatch<SetStateAction<boolean>>
}

export default function AdminSideBar({ isCollapsed, setIsCollapsed }: SideBar) {
  const [menuOpened, setMenuOpened] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuthStore()

  const [logoutModalOpen, setLogOutModalOpen] = useState(false)
  const [logoutModalContent, setLogoutModalContent] = useState<React.ReactNode | null>(null)

  function handleOpen() {
    setMenuOpened((menuOpened) => !menuOpened)
  }

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
        <p className='subtitle'>{`Bạn chắc chắn muốn đăng xuất?`}</p>
      </>
    )
  }

  const handleLogoutConfirm = (logout: () => void) => {
    logout()
  }

  /// useRef to manipulate dom
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
  }, [menuRef, setMenuOpened])

  return (
    <>
      <SideBarStyle isCollapsed={isCollapsed}>
        <div className='header'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: `${isCollapsed ? 'center' : 'space-between'}`
            }}
          >
            {!isCollapsed && <Logo width={61} notext={true} />}
            <button onClick={() => setIsCollapsed(!isCollapsed)} className='x-button'>
              {isCollapsed ? <MenuIcon color='#717D84' /> : <XIcon color='#717D84' />}
            </button>
          </div>
        </div>
        <Navigation menuItems={menuItems} isCollapsed={isCollapsed} menuOpened={menuOpened} />
        <div style={{ position: 'relative' }}>
          <UserSection isCollapsed={isCollapsed} onProfileClick={() => setMenuOpened(!menuOpened)} />
          {menuOpened && <UserMenu menuRef={menuRef} logout={handleLogout} />}
        </div>
      </SideBarStyle>
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
    </>
  )
}
