import PriorityCard from './PriorityCard'
import RecentActivityCard from './RecentActivityCard'
import SummaryCard from './SummaryCard'
import TaskProgressCard from './TaskProgressCard'
import WorkLoadCard from './WorkLoadCard'

export default function SummaryTab() {
  const totalTasks = 100
  const completedTasks = 100
  const inProgressTasks = 100
  const blockedTasks = 100
  const dueTasks = 100

  // APi nên query ra => cái này liên quan đến task => task

  const TASK_DATA = [
    { status: 'Đang thực hiện', value: 55 },
    { status: 'Hoàn thành', value: 20 },
    { status: 'Cần làm', value: 15 },
    { status: 'Bị chặn', value: 10 },
    { status: 'Bị hủy', value: 10 }
  ]

  const PRIORITY_DATA = [
    { label: 'Cần gấp', value: 100 },
    { label: 'Cao', value: 30 },
    { label: 'Trung bình', value: 40 },
    { label: 'Thấp', value: 20 }
  ]

  const WORK_LOAD = [
    { user_id: '123123', name: 'Thanh Hai', percent: 40, avatar: null },
    { user_id: '123994', name: 'Minh Tuấn', percent: 30, avatar: null },
    { user_id: '192939', name: 'Ngọc Trâm', percent: 30, avatar: null }
  ]

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

      {/* Sample data */}
      {/* const TASK_LABELS = ['Đang thực hiện', 'Đã xong', 'Cần làm', 'Bị chặn']

      const TASK_DATA = [55, 20, 15, 10, 1] // Thay bằng số thực tế */}
      <TaskProgressCard TASK_DATA={TASK_DATA} />
      <RecentActivityCard />
      <PriorityCard data={PRIORITY_DATA} />
      <WorkLoadCard data={WORK_LOAD} />
    </div>
  )
}
