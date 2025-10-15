import React, { type Dispatch, type SetStateAction } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { ColumnCard } from '../../../components/ColumnCard'
import type { Task } from '../../../types/task'
import { updateTaskAPI } from '../service/task.service'
import { toast } from 'sonner'

export interface Column {
  id: string
  title: string
  tasks: Task[]
}

export default function DragnDropColumn({
  columns,
  setColumns
}: {
  columns: Column[]
  setColumns: Dispatch<SetStateAction<Column[]>>
}) {
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    // ✅ clone data để tránh mutate state gốc
    const newCols = [...columns]
    const sourceCol = newCols.find((c) => c.id === source.droppableId)!
    const destCol = newCols.find((c) => c.id === destination.droppableId)!
    const [movedTask] = sourceCol.tasks.splice(source.index, 1)
    destCol.tasks.splice(destination.index, 0, movedTask)
    setColumns(newCols)

    if (sourceCol.id !== destCol.id) {
      try {
        await updateTaskAPI({ ...movedTask, status_id: Number(destCol.id) })
        toast.success('Cập nhật trạng thái thành công 🎉')
      } catch (err) {
        // ❌ nếu lỗi thì rollback (hoàn tác)
        toast.error('Lỗi khi cập nhật trạng thái 😢')
        const rollbackCols = [...columns]
        setColumns(rollbackCols)
      }
    }
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
