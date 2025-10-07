import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  path: string
}

interface NavigationMenuProps {
  menuItems: MenuItem[]
  isCollapsed: boolean
}

export default function Navigation({ menuItems, isCollapsed }: NavigationMenuProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <nav className='navigation'>
      <ul className='nav-list'>
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <li key={item.id} className={active ? 'active' : ''}>
              <Link to={item.path}>
                <div className='tab-container'>
                  <Icon size={24} className='icon-tab' strokeWidth={1.5} />
                  {!isCollapsed && <span className='tab-label'>{item.label}</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
