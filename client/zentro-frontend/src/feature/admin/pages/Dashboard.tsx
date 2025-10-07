import React, { useState } from 'react'
import { TabPanel, TabView } from 'primereact/tabview'
import styled from 'styled-components'
import { CalendarClock, Kanban, KanbanSquareIcon } from 'lucide-react'
import SummaryTab from '../components/SummaryTab'

const priorityColors = [
  '#cb0404', // Highest
  '#f37121', // High
  '#d23232', // Medium
  '#3498db', // Low
  '#95a5a6' // Lowest
]

const CssLayout = styled.div`
  padding: 30px 40px;
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
`

const Dashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  // Data dummy, bạn thay bằng data thực của bạn
  const totalTasks = 100
  const completedTasks = 100
  const inProgressTasks = 100
  const blockedTasks = 100
  const dueTasks = 100

  // ChartJS data
  const doughnutData = {
    labels: ['Hoàn thành', 'Chưa hoàn thành'],
    datasets: [
      {
        data: [completedTasks, totalTasks - completedTasks],
        backgroundColor: ['var(--primary)', '#e0e0e0'],
        borderWidth: 0
      }
    ]
  }

  const barData = {
    labels: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
    datasets: [
      {
        label: 'Số lượng',
        backgroundColor: priorityColors,
        data: [80, 80, 80, 80, 80],
        borderRadius: 8
      }
    ]
  }

  const groupWorkData = {
    labels: ['Thanh Hai', 'Thanh Hai', 'Thanh Hai'],
    datasets: [
      {
        label: 'Khối lượng (%)',
        backgroundColor: 'var(--primary-light)',
        data: [80, 80, 80],
        borderRadius: 8
      }
    ]
  }

  return (
    <CssLayout>
      <h2 style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Dự án Zentro</h2>

      <TabView
        className='mt-[30px] custom-tabview'
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel
          header={
            <span className='flex items-center gap-2'>
              <Kanban size={20} /> Summary
            </span>
          }
        >
          {/* Các thống kê tổng quan */}
          <SummaryTab />
        </TabPanel>
        <TabPanel
          header={
            <span className='flex items-center gap-2'>
              <Kanban size={20} /> Board
            </span>
          }
        >
          {/* Tab Board content */}
        </TabPanel>
        <TabPanel
          header={
            <span className='flex items-center gap-2'>
              <CalendarClock size={20} /> Timeline
            </span>
          }
        >
          {/* Tab Timeline content */}
        </TabPanel>
        <TabPanel
          header={
            <span className='flex items-center gap-2'>
              <CalendarClock size={20} /> Timeline
            </span>
          }
        >
          {/* Tab Timeline content */}
        </TabPanel>
      </TabView>
    </CssLayout>
  )
}

export default Dashboard
