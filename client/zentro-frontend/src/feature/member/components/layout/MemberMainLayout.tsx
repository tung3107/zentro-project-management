import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import MemberSideBar from './MemberSideBar'
import NotificationProvider from '../notification/NotificationProvider'

function MemberMainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  return (
    <NotificationProvider>
      <div style={{}}>
        <MemberSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div
          style={{
            flex: 1,
            backgroundColor: '#F8F8F8', // tương ứng bg-gray-50
            transition: 'all 300ms',
            marginLeft: isCollapsed ? '4rem' : '16rem',
            padding: location.pathname.includes('chat') ? '0px' : '30px 15px'
          }}
        >
          <Outlet />
        </div>
      </div>
    </NotificationProvider>
  )
}

export default MemberMainLayout
