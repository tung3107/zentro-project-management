import PriorityCard from './PriorityCard'
import RecentActivityCard from './RecentActivityCard'
import SummaryCard from './SummaryCard'
import TaskProgressCard from './TaskProgressCard'

export default function SummaryTab() {
  const totalTasks = 100
  const completedTasks = 100
  const inProgressTasks = 100
  const blockedTasks = 100
  const dueTasks = 100

  const TASK_DATA = [55, 20, 15, 10] // Thay bằng số thực tế

  const priorityCard = [100, 30, 40, 20]

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

      const TASK_DATA = [55, 20, 15, 10] // Thay bằng số thực tế */}
      <TaskProgressCard TASK_DATA={TASK_DATA} />
      <RecentActivityCard />
      <PriorityCard percentList={priorityCard} />
    </div>
  )
}
