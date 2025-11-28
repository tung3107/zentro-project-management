import React, { type Dispatch, type SetStateAction } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { toast } from 'sonner'
import type { Task } from '../../../../types/task'
import { updateTaskAPI, deleteTask } from '../../service/task.service'
import { ColumnCard, type Column as ColumnType } from '../../../../components/ColumnCard'

export type Column = ColumnType

export default function DragnDropColumn({
  columns,
  setColumns,
  onTaskClick,
  onAddTask,
  onTaskUpdate,
  canDelete = true,
  canEdit = true
}: {
  columns: Column[]
  setColumns: Dispatch<SetStateAction<Column[]>>
  onTaskClick?: (task: Task) => void
  onAddTask?: (statusId: number) => void
  onTaskUpdate?: () => void
  canDelete?: boolean
  canEdit?: boolean
}) {
  const onDragEnd = async (result: DropResult) => {
    // Check if user can edit (viewers can't drag)
    if (!canEdit) {
      toast.error('Bạn không có quyền thay đổi trạng thái công việc')
      return
    }

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
        onTaskUpdate?.()
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

  const handleStatusChange = async (taskId: string, newStatusId: number) => {
    // Check if user can edit
    if (!canEdit) {
      toast.error('Bạn không có quyền thay đổi trạng thái công việc')
      return
    }

    const oldColumns = [...columns]
    try {
      // Find the task and source column
      let taskToMove: Task | undefined
      let sourceColIndex = -1

      for (let i = 0; i < columns.length; i++) {
        // Compare both as strings since task_id might be string or number
        const task = columns[i].tasks.find((t) => String(t.task_id) === String(taskId))
        if (task) {
          taskToMove = task
          sourceColIndex = i
          break
        }
      }

      if (!taskToMove || sourceColIndex === -1) {
        return
      }

      // Find destination column index
      const destColIndex = columns.findIndex((c) => Number(c.id) === newStatusId)
      if (destColIndex === -1) {
        return
      }

      // Don't do anything if moving to same column
      if (sourceColIndex === destColIndex) {
        return
      }

      // Update UI optimistically - create new columns array
      const newCols = columns.map((col, idx) => {
        if (idx === sourceColIndex) {
          // Remove task from source column
          return {
            ...col,
            tasks: col.tasks.filter((t) => String(t.task_id) !== String(taskId))
          }
        } else if (idx === destColIndex) {
          // Add task to destination column with updated status
          return {
            ...col,
            tasks: [...col.tasks, { ...taskToMove!, status_id: newStatusId }]
          }
        }
        return col
      })

      setColumns(newCols)

      await updateTaskAPI({ ...taskToMove, status_id: newStatusId })
      console.log('API call successful')
      toast.success('Cập nhật trạng thái thành công 🎉')
      onTaskUpdate?.()
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error('Lỗi khi cập nhật trạng thái 😢')
      setColumns(oldColumns)
    }
  }

  const handleDelete = async (taskId: string) => {
    // Check if user can delete
    if (!canDelete) {
      toast.error('Bạn không có quyền xóa công việc')
      return
    }

    const oldColumns = [...columns]
    try {
      // Remove from UI optimistically
      const newCols = columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => String(t.task_id) !== String(taskId))
      }))
      setColumns(newCols)

      // Call API - convert to number for API
      const taskIdNum = typeof taskId === 'string' ? parseInt(taskId) : taskId
      await deleteTask(taskIdNum)
      toast.success('Xóa công việc thành công 🗑️')
      onTaskUpdate?.()
    } catch (err) {
      toast.error('Lỗi khi xóa công việc 😢')
      setColumns(oldColumns)
    }
  }

  // Get all unique statuses from columns
  const statuses = columns.map((col) => ({
    status_id: Number(col.id),
    name: col.title,
    color: (col as any).color || '#6b7280'
  }))

  return (
    <div className='flex gap-4 overflow-x-auto items-stretch'>
      <DragDropContext onDragEnd={onDragEnd}>
        {columns.map((col, i) => (
          <ColumnCard
            key={col.id}
            col={col}
            colIndex={i}
            moveColumn={moveColumn}
            deleteColumn={() => {}}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            statuses={statuses}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        ))}
      </DragDropContext>
    </div>
  )
}
