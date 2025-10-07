import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import AdminSideBar from './AdminSideBar'

function AdminMainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  return (
    <div style={{}}>
      <AdminSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        style={{
          flex: 1,
          backgroundColor: '#F8F8F8', // tương ứng bg-gray-50
          transition: 'all 300ms',
          marginLeft: isCollapsed ? '4rem' : '16rem' // lg:ml-16 = 64px = 4rem, lg:ml-64 = 256px = 16rem
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default AdminMainLayout
