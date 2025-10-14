import React, { useState } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { ColumnCard } from '../../../components/ColumnCard'
interface Task {
  id: string
  title: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

export default function DragnDropColumn() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: [
        { id: 't1', title: 'Component Library Documentation' },
        { id: 't2', title: 'Performance Optimization' }
      ]
    },
    {
      id: 'inreview',
      title: 'In Review',
      tasks: [
        { id: 't3', title: 'User Research Analysis' },
        { id: 't4', title: 'User Research Analysis' },
        { id: 't5', title: 'User Research Analysis' },
        { id: 't6', title: 'User Research Analysis' },
        { id: 't7', title: 'User Research Analysis' }
      ]
    }
  ])

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newCols = [...columns]
    const sourceCol = newCols.find((c) => c.id === source.droppableId)!
    const destCol = newCols.find((c) => c.id === destination.droppableId)!
    const [moved] = sourceCol.tasks.splice(source.index, 1)
    destCol.tasks.splice(destination.index, 0, moved)
    setColumns(newCols)
  }

  const moveColumn = (index: number, direction: 'left' | 'right') => {
    const newCols = [...columns]
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newCols.length) return
    const [moved] = newCols.splice(index, 1)
    newCols.splice(targetIndex, 0, moved)
    setColumns(newCols)
  }

  const deleteColumn = (id: string) => setColumns(columns.filter((c) => c.id !== id))

  return (
    <div className='flex gap-4 overflow-x-auto items-stretch'>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col, i) => (
          <ColumnCard key={col.id} col={col} colIndex={i} moveColumn={moveColumn} deleteColumn={deleteColumn} />
        ))}
      </DragDropContext>
    </div>
  )
}
