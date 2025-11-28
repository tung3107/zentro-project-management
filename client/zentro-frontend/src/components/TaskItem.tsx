import React, { useState } from 'react'
import { type DraggableProvided } from '@hello-pangea/dnd'
import Priority from './Priority'
import Avatar from './Avatar'
import { AlertTriangle, Calendar, CheckSquare, Copy, MoreHorizontal, Trash2, ChevronRight } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Task } from '../types/task'
import { type } from '../types/type'
import { toast } from 'sonner'

interface Props {
  provided: DraggableProvided
  task: Task
  onTaskClick?: (task: Task) => void
  statuses?: Array<{ status_id: number; name: string; color: string }>
  onStatusChange?: (taskId: string, newStatusId: number) => void
  onDelete?: (taskId: string) => void
  canDelete?: boolean
}

const TaskMenu = ({
  task,
  statuses,
  onStatusChange,
  onDelete,
  canDelete = true
}: {
  task: Task
  statuses?: Array<{ status_id: number; name: string; color: string }>
  onStatusChange?: (taskId: string, newStatusId: number) => void
  onDelete?: (taskId: string) => void
  canDelete?: boolean
}) => {
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/member/projects/${task.project_id}/board?task=${task.task_id}`
    navigator.clipboard.writeText(url)
    toast.success('Đã copy link công việc!')
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      onDelete?.(String(task.task_id))
    }
  }

  const handleStatusChange = (e: React.MouseEvent, statusId: number) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Changing status for task:', task.task_id, 'to status:', statusId)
    onStatusChange?.(String(task.task_id), statusId)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className='opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 p-1 hover:bg-gray-200 rounded'
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side='bottom'
          align='end'
          className='bg-white border border-gray-200 shadow-lg rounded-md text-sm min-w-[180px] z-50 m-h-auto'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Status Change Submenu */}
          {statuses && statuses.length > 0 && (
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between outline-none'>
                <span>Đổi trạng thái</span>
                <ChevronRight size={14} className='ml-2' />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  className='bg-white border border-gray-200 shadow-lg rounded-md text-sm min-w-[160px] z-50'
                  sideOffset={2}
                  alignOffset={-5}
                >
                  {statuses.map((status) => (
                    <DropdownMenu.Item
                      key={status.status_id}
                      className='px-3 py-2 hover:bg-gray-100 cursor-pointer outline-none flex items-center gap-2'
                      onClick={(e) => handleStatusChange(e, status.status_id)}
                    >
                      <div className='w-2 h-2 rounded-full' style={{ backgroundColor: status.color }} />
                      <span>{status.name}</span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          )}

          <DropdownMenu.Separator className='h-px bg-gray-200 my-1' />

          {/* Copy Link */}
          <DropdownMenu.Item
            className='px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 outline-none'
            onClick={handleCopyLink}
          >
            <Copy size={14} />
            <span>Copy link công việc</span>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className='h-px bg-gray-200 my-1' />

          {/* Delete Task - Only show if canDelete */}
          {canDelete && (
            <DropdownMenu.Item
              className='px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2 outline-none'
              onClick={handleDelete}
            >
              <Trash2 size={14} />
              <span>Xóa công việc</span>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const TaskItem: React.FC<Props> = ({
  provided,
  task,
  onTaskClick,
  statuses,
  onStatusChange,
  onDelete,
  canDelete = true
}) => {
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
        <TaskMenu
          task={task}
          statuses={statuses}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          canDelete={canDelete}
        />
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
