import { BellDot, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { menuItems } from '../../../types/adminTab'
import styled from 'styled-components'

const NaviagtionStyle = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 600;
  font-size: 14px;
  a {
    color: #abb8bc;
    text-decoration: underline;
  }
  a:hover {
    color: #cb0404;
  }
  span {
    color: #cb0404;
  }
`
const HeaderStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    cursor: pointer;
    background-color: transparent;
    background-image: none;
    border: none;
    height: 24px;
    width: 24px;
  }
`

export default function AdminNavigation() {
  const location = useLocation()
  const currentPageName = menuItems.find((el) => el.path.match(location.pathname))?.label
  return (
    <HeaderStyle>
      <NaviagtionStyle>
        <Link to={'/admin/dashboard'}>Dashboard</Link>
        <ChevronRight color='#ABB8BC' strokeWidth={1.5} />
        <span>{currentPageName}</span>
      </NaviagtionStyle>
      <button>
        <BellDot color='#787486' strokeWidth={1.5} size={24} />
      </button>
    </HeaderStyle>
  )
}
