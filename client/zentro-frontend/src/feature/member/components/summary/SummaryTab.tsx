import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import PriorityCard from './PriorityCard'
import RecentActivityCard from './RecentActivityCard'
import SummaryCard from './SummaryCard'
import TaskProgressCard from './TaskProgressCard'
import WorkLoadCard from './WorkLoadCard'
import { getProjectSummary, type ProjectSummary } from '../../service/project.service'

export default function SummaryTab() {
  const { projectId } = useParams<{ projectId: string }>()
  const [loading, setLoading] = useState(true)
  const [summaryData, setSummaryData] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    if (projectId) {
      loadSummary()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await getProjectSummary(projectId!)
      setSummaryData(data)
    } catch (error) {
      console.error('Failed to load project summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
          <p className='mt-4 text-gray-600'>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!summaryData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-gray-600'>Không thể tải dữ liệu tóm tắt</p>
      </div>
    )
  }

  const { summary, taskData, priorityData, workLoad } = summaryData
  const { totalTasks, completedTasks, inProgressTasks, blockedTasks, dueTasks } = summary

  return (
    <div className='grid grid-cols-5 gap-6'>
      <div className='col-span-5 flex gap-4 mt-[30px] mb-[20px]' style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <SummaryCard
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          blockedTasks={blockedTasks}
          dueTasks={dueTasks}
        />

        {/* Tien do cong viec */}
      </div>

      <TaskProgressCard TASK_DATA={taskData} />
      <RecentActivityCard />
      <PriorityCard data={priorityData} />
      <WorkLoadCard data={workLoad} />
    </div>
  )
}
