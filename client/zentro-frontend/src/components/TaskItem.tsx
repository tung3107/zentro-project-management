import React from 'react'
import { type DraggableProvided } from '@hello-pangea/dnd'
import Priority from './Priority'
import Avatar from './Avatar'
import { AlertTriangle, Bookmark, Calendar, CheckSquare, MessageCircle, MoreHorizontal, Paperclip } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Task } from '../types/task'
import { type } from '../types/type'

interface Props {
  provided: DraggableProvided
  task: Task
  onTaskClick?: (task: Task) => void
}

const ColumnMenu = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className='opacity-0 group-hover/item:opacity-100 transition-opacity duration-150'>
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side='bottom' align='end' className='bg-white border shadow-md rounded-md text-sm'>
        <DropdownMenu.Item className='px-3 py-2 hover:bg-gray-100 cursor-pointer'>Move Left</DropdownMenu.Item>
        <DropdownMenu.Item className='px-3 py-2 hover:bg-gray-100 cursor-pointer'>Move Right</DropdownMenu.Item>
        <DropdownMenu.Item className='px-3 py-2 text-red-600 hover:bg-gray-100 cursor-pointer'>
          Delete Column
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export const TaskItem: React.FC<Props> = ({ provided, task, onTaskClick }) => {
  const priorityColors = ['#22c55e', '#facc15', '#fa7115ff', '#ef4444']

  const currentPriority = task.priority !== undefined ? task.priority : 0

  const formatDate = (date: Date | undefined) => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getDate()} Th${d.getMonth() + 1} ${d.getFullYear()}`
  }

  const getTypeIcon = () => {
    const found = type.find((t) => t.value === task.type)
    return found ? found.icon : <CheckSquare size={16} color='#4F83C1' />
  }

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={() => onTaskClick?.(task)}
      className='group/item p-3 rounded-lg border bg-white hover:bg-gray-50 hover:shadow-md transition flex-col flex gap-2 cursor-pointer'
    >
      <div className='flex flex-row justify-between items-start'>
        <div className='flex items-center gap-2 flex-1'>
          <div
            className='w-2 h-2 rounded-full flex-shrink-0'
            style={{ backgroundColor: priorityColors[currentPriority] }}
          />
          <p className='text-sm font-medium text-gray-800 line-clamp-2'>{task.title}</p>
        </div>
        <ColumnMenu />
      </div>

      {task.assignee && (
        <div className='flex flex-row justify-between mt-1'>
          <div className='flex flex-row items-center gap-2'>
            <Avatar
              name={`${task.assignee.first_name} ${task.assignee.last_name}`}
              avatarUrl={task.assignee.avatar}
              size={24}
            />
            <span className='text-xs font-medium text-gray-700'>
              {task.assignee.first_name} {task.assignee.last_name}
            </span>
          </div>
          {task.due_date && (
            <div
              className={`px-2 py-0.5 rounded-full font-medium  flex flex-row items-center gap-1 text-xs ${
                new Date(task.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                  ? 'border border-red-300! text-red-600! bg-red-50!'
                  : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              {new Date(task.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? (
                <AlertTriangle size={12} className='flex-shrink-0' />
              ) : (
                <Calendar size={12} className='text-gray-400 flex-shrink-0' />
              )}
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
      )}

      <div className='flex flex-row justify-between items-center mt-1'>
        <div className='flex flex-row items-center gap-1 text-xs font-medium text-gray-600'>
          {getTypeIcon()} {task.task_id}
        </div>
        {task.type && (
          <span className='px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize'>
            {task.type}
          </span>
        )}
      </div>
    </div>
  )
}
