import React from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { TaskItem } from './TaskItem'
import { ColumnMenu } from './ColumnMenu'

interface Task {
  id: string
  title: string
}
interface Column {
  id: string
  title: string
  tasks: Task[]
}

interface Props {
  col: Column
  colIndex: number
  moveColumn: (index: number, direction: 'left' | 'right') => void
  deleteColumn: (id: string) => void
}

export const ColumnCard: React.FC<Props> = ({ col, colIndex, moveColumn, deleteColumn }) => {
  return (
    <div className='bg-slate-50 relative rounded-xl shadow w-80 flex-shrink-0 group border border-slate-200 flex flex-col'>
      {/* Header */}
      <div className='sticky top-0 z-20 rounded-t-xl px-4 py-3 flex items-center justify-between bg-slate-50 '>
        <div className='flex flex-row gap-1'>
          <h2 className='font-semibold text-gray-800'>{col.title}</h2>
          <span className='ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 rounded-md min-w-[20px]'>
            {col.tasks.length}
          </span>
        </div>
        <ColumnMenu colIndex={colIndex} colId={col.id} moveColumn={moveColumn} deleteColumn={deleteColumn} />
      </div>

      {/* Tasks */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        <Droppable droppableId={col.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className='min-h-[200px] flex flex-col gap-3'>
              {col.tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(dragProvided) => <TaskItem provided={dragProvided} title={task.title} />}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Footer */}
      <div className='sticky bottom-0 bg-gray-50 z-10 rounded-b-xl text-center py-3 cursor-pointer hover:bg-gray-50'>
        <button className='text-sm text-gray-500 hover:text-gray-700'>+ Add task</button>
      </div>
    </div>
  )
}
