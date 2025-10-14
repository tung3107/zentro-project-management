import React from 'react'
import type { Task } from '../../../types/task'
import Avatar from '../../../components/Avatar'
import { CheckSquare, Flame, ArrowUp, Minus, Calendar, AlertTriangle } from 'lucide-react'
import { type } from '../../../types/type'
import Priority from '../../../components/Priority'
import StatusLabel from '../../../components/StatusLabel'
import { useParams } from 'react-router-dom'
import { Tooltip } from 'primereact/tooltip'

export interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export default function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { projectId } = useParams()
  const getTypeIcon = () => {
    const found = type.find((t) => t.value === task.type)
    return found ? found.icon : <CheckSquare size={16} color='#4F83C1' />
  }

  return (
    <div
      className={`w-full border border-gray-200 rounded-md px-4 py-2 bg-white hover:shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-between ${
        isDragging ? 'bg-blue-50 shadow-md scale-[1.01]' : ''
      }`}
    >
      {/* Left: Type + Title */}
      <div className='flex items-center gap-2 min-w-0 flex-1'>
        {getTypeIcon()}
        <span className='font-medium text-gray-800 truncate'>{task.title}</span>
      </div>

      {/* Middle: Status + Due date + Estimate */}
      <div className='flex items-center gap-3 text-sm text-gray-600 mx-6'>
        <StatusLabel value={task.status_id} apiEndPoint={`/status/${projectId}`} />
        {task.due_date && (
          <div
            className={`flex items-center gap-1 px-2 py-[2px] rounded-md text-sm ${
              new Date(task.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                ? 'border border-red-300 text-red-600 bg-red-50'
                : 'text-gray-700'
            }`}
          >
            {new Date(task.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
              <AlertTriangle size={14} className='flex-shrink-0' />
            ) : (
              <Calendar size={14} className='text-gray-400 flex-shrink-0' />
            )}
            <span>{new Date(task.due_date).toLocaleDateString('vi-VN')}</span>
          </div>
        )}
        {task.estimate && (
          <div className='flex items-center gap-1'>
            <span>{task.estimate}h</span>
          </div>
        )}
      </div>

      <div className='flex flex-row gap-2'>
        {/* Right: Priority + Assignee */}
        <div className='flex items-center gap-4'>
          <Tooltip target='.assignee_avatar' />
          <Priority priority={task.priority} center />
          <div
            className='assignee_avatar flex items-center gap-2 '
            data-pr-tooltip={`${task.assignee?.assignee_name} (${task.assignee?.email})`}
            data-pr-position='bottom'
          >
            <Avatar avatarUrl={task.assignee?.avatar} name={task.assignee?.assignee_name} size={22} />
            <span className='text-gray-700 text-sm truncate max-w-[100px]'>
              {task.assignee?.assignee_name || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
