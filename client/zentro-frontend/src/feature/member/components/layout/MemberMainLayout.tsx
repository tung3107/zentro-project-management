import { Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import MemberSideBar from './MemberSideBar'

function MemberMainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  return (
    <div style={{}}>
      <MemberSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        style={{
          flex: 1,
          backgroundColor: '#F8F8F8', // tương ứng bg-gray-50
          transition: 'all 300ms',
          marginLeft: isCollapsed ? '4rem' : '16rem',
          padding: location.pathname.includes('chat') ? '0px' : '30px 40px'
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default MemberMainLayout
