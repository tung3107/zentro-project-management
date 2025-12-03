import { format } from 'date-fns'
import StatusLabel from '../../../../components/StatusLabel'
import Avatar from '../../../../components/Avatar'
import type { Task } from '../../../../types/task'

interface TaskCardProps {
  task: Task
  projectId: string
  isSelected: boolean
  onClick: () => void
}

export default function TaskCard({ task, projectId, isSelected, onClick }: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white'
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-sm text-gray-600 font-semibold'>{task.task_id}</span>
            <StatusLabel apiEndPoint={`/status/${projectId}`} value={task.status_id ?? null} />
          </div>
          <h3 className='text-base font-bold text-gray-900 mb-2'>{task.title}</h3>
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            {task.assignee && (
              <div className='flex items-center gap-1.5'>
                <div className='relative'>
                  <Avatar
                    name={`${task.assignee.first_name || ''} ${task.assignee.last_name || ''}`}
                    size={20}
                    avatarUrl={task.assignee.avatar}
                  />
                  {task.assignee.memberships?.[0]?.is_delete && (
                    <span
                      className='absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500 ring-1 ring-white'
                      title='Đã rời dự án'
                    />
                  )}
                </div>
                <div className='flex flex-col'>
                  <span className='leading-none'>
                    {task.assignee.first_name} {task.assignee.last_name}
                  </span>
                  {task.assignee.memberships?.[0]?.is_delete && (
                    <span className='text-[10px] text-red-500 font-normal leading-none'>Đã rời dự án</span>
                  )}
                </div>
              </div>
            )}
            {task.due_date && <span>{format(new Date(task.due_date), 'dd/MM/yyyy')}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
