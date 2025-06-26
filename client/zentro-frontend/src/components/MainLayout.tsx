import styled from 'styled-components'
import SideBar from './SideBar'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <SideBar />
      <Outlet />
    </div>
  )
}

export default MainLayout
