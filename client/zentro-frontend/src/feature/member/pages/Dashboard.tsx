import { useEffect, useState, useMemo } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import styled from 'styled-components'
import {
  Calendar,
  CalendarClock,
  FileStackIcon,
  Globe,
  Kanban,
  Play,
  Rows3Icon,
  Users,
  FileBarChart
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import SummaryTab from '../components/summary/SummaryTab'
import BoardTab from '../components/board/BoardTab'
import BacklogTab from '../components/board/BacklogTab'
import CalendarTab from '../components/calendar/CalendarTab'
import TaskListView from './project/TaskListView/TaskListView'
import MembersTab from '../components/members/MembersTab'
import TestCaseTab from '../components/testcase/TestCaseTab'
import TestRunTab from '../components/testrun/TestRunTab'
import ReportTab from '../components/report/ReportTab'
import { useProjectRole } from '../hooks/useProjectRole'
import AIFloatingButton from '../components/ai/AIFloatingButton'

const CssLayout = styled.div`
  .p-tabview .p-tabview-nav,
  .p-tabview .p-tabview-nav-link,
  .p-tabview .p-tabview-nav li,
  .p-tabview .p-tabview-nav li.p-highlight,
  .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
    font-family: 'Space Grotesk', sans-serif !important;
  }

  .p-tabview .p-tabview-nav {
    display: flex !important;
    border-bottom: 2px solid var(--color-primary) !important;
    overflow: hidden;
    justify-content: space-between
    background: #f8f9fb;
    margin: 0;
    gap: 0;
    padding: 0;
  }
  .p-tabview .p-tabview-nav li {
    flex: 1 1 0;
  }
  .p-tabview .p-tabview-nav-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%; 
    font-size: 20px; 
    font-weight: 700;
    color: var(--color-primary);
    padding: 11px 24px; /* Độ rộng tab phù hợp */
    background: transparent;
    border: none !important;
    border-radius: 0 !important;
    transition:
      background 0.2s,
      color 0.2s;
    min-width: 88px; 
    outline: none !important;
    box-shadow: none !important;
  }
  .p-tabview .p-tabview-nav li.p-highlight {
    background: var(--color-primary) !important;
    border-radius: 8px 8px 0 0;
    position: relative;
    z-index: 1;
  }
  .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
    color: #fff !important;
  }
  /* Lucide icon khi active */
  .p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link svg {
    color: #fff !important;
    stroke: #fff !important;
  }
  .p-tabview .p-tabview-nav .p-tabview-nav-link svg {
    color: var(--color-primary);
    stroke: var(--color-primary);
    transition:
      stroke 0.2s,
      color 0.2s;
  }
  .p-tabview .p-tabview-nav-container {
    background: #f8f9fb;
    overflow: hidden;
  }

  .fixed-tabview .p-tabview-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Nếu muốn nội dung bên dưới không bị che */
.fixed-tabview .p-tabview-panels {
  margin-top: 3.5rem; /* khoảng cao bằng chiều cao tab header */
}
`

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { permissions } = useProjectRole()

  // ánh xạ route <-> tab index
  const allTabs = [
    { path: '', component: <SummaryTab />, label: 'Tóm tắt', icon: <Globe size={20} /> },
    { path: 'board', component: <BoardTab />, label: 'Board', icon: <Kanban size={20} /> },
    { path: 'backlog', component: <BacklogTab />, label: 'Backlog', icon: <FileStackIcon size={20} /> },
    { path: 'list', component: <TaskListView />, label: 'List', icon: <Rows3Icon size={20} /> },
    { path: 'calendar', component: <CalendarTab />, label: 'Lịch', icon: <Calendar size={20} /> },
    { path: 'members', component: <MembersTab />, label: 'Thành viên', icon: <Users size={20} /> },
    {
      path: 'reports',
      component: <ReportTab />,
      label: 'Báo cáo',
      icon: <FileBarChart size={20} />,
      requiresLeader: true
    },
    { path: 'testcase', component: <TestCaseTab />, label: 'Testcase', icon: <CalendarClock size={20} /> },
    { path: 'test-runs', component: <TestRunTab />, label: 'Test Runs', icon: <Play size={20} /> }
  ]

  // Filter tabs based on permissions - hide Reports tab for non-leaders
  const tabs = useMemo(() => {
    return allTabs.filter((tab) => {
      if (tab.requiresLeader) {
        return permissions.canAccessReports
      }
      return true
    })
  }, [permissions.canAccessReports])

  // xác định tab hiện tại dựa vào URL
  const currentPath = location.pathname.split('/').pop() || ''
  const activeIndex = tabs.findIndex((t) => t.path === currentPath)
  const [index, setIndex] = useState(activeIndex === -1 ? 0 : activeIndex)

  useEffect(() => {
    setIndex(activeIndex === -1 ? 0 : activeIndex)
  }, [activeIndex])

  const handleTabChange = (e: { index: number }) => {
    setIndex(e.index)
    const path = tabs[e.index].path
    navigate(path ? `${path}` : ``)
  }

  return (
    <CssLayout>
      <TabView activeIndex={index} onTabChange={handleTabChange} className='mt-[20px] custom-tabview'>
        {tabs.map((tab, i) => (
          <TabPanel
            key={i}
            header={
              <span className='flex items-center gap-2'>
                {tab.icon} {tab.label}
              </span>
            }
          >
            {tab.component}
          </TabPanel>
        ))}
      </TabView>
      <AIFloatingButton />
    </CssLayout>
  )
}
