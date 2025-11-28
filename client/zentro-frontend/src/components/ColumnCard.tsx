import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { TaskItem } from './TaskItem'
import type { Task } from '../types/task'

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface Props {
  col: Column
  colIndex: number
  moveColumn: (index: number, direction: 'left' | 'right') => void
  deleteColumn: (id: string) => void
  onTaskClick?: (task: Task) => void
  onAddTask?: (statusId: number) => void
  statuses?: Array<{ status_id: number; name: string; color: string }>
  onStatusChange?: (taskId: string, newStatusId: number) => void
  onDelete?: (taskId: string) => void
  canDelete?: boolean
}

export const ColumnCard: React.FC<Props> = ({
  col,
  onTaskClick,
  onAddTask,
  statuses,
  onStatusChange,
  onDelete,
  canDelete = true
}) => {
  return (
    <div className='bg-slate-50 relative rounded-xl shadow w-80 flex-shrink-0 group border border-slate-200 flex flex-col'>
      {/* Header */}
      <div className='sticky top-0 z-19 rounded-t-xl px-4 py-3 flex items-center justify-between bg-slate-50'>
        <div className='flex flex-row gap-1'>
          <h2 className='font-semibold text-gray-800'>{col.title}</h2>
          <span className='ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 rounded-md min-w-[20px]'>
            {col.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        <Droppable droppableId={col.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className='min-h-[160px] flex flex-col gap-3'>
              {col.tasks.map((task, index) => (
                <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                  {(dragProvided) => (
                    <TaskItem
                      provided={dragProvided}
                      task={task}
                      onTaskClick={onTaskClick}
                      statuses={statuses}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                      canDelete={canDelete}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Footer */}
      <div className='sticky bottom-0 bg-gray-50 z-10 rounded-b-xl text-center py-3'>
        <button
          type='button'
          className='text-sm text-gray-500 hover:text-gray-700 cursor-pointer w-full py-2'
          onClick={(e) => {
            e.stopPropagation()
            onAddTask?.(Number(col.id))
          }}
        >
          + Thêm task
        </button>
      </div>
    </div>
  )
}
