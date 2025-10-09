import { LayoutGrid, ListChecks, Settings, SquareChartGantt, Users } from 'lucide-react'
import type { MenuItem } from '../components/Navigation'

export const menuItems: MenuItem[] = [
  {
    id: 'users',
    label: 'Người Dùng',
    icon: Users,
    path: '/admin/users'
  },
  {
    id: 'roles',
    label: 'Quyền',
    icon: ListChecks,
    path: '/admin/roles'
  },
  {
    id: 'projects',
    label: 'Dự Án',
    icon: SquareChartGantt,
    path: '/admin/projects'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    path: '/admin/settings'
  }
]
