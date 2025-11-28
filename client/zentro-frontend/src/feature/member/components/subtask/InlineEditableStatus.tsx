import { useState } from 'react'
import Dropdown from '../../../../components/Dropdown'
import StatusLabel from '../../../../components/StatusLabel'
import type { Task } from '../../../../types/task'
import api from '../../../../util/axiosClient'
import { toast } from 'sonner'

interface InlineEditableStatusProps {
  task: Task
  projectId: string
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function InlineEditableStatus({ task, projectId, onTaskClick, onUpdate }: InlineEditableStatusProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleStatusChange = async (newStatusId: any) => {
    try {
      if (task.subtasks && task.subtasks.length > 0 && task.type !== 'subtask') {
        // Fetch the status to check if it's a completed status
        const statusRes = await api.get(`/status/${projectId}`)
        const statuses = statusRes.data.data || []
        const selectedStatus = statuses.find((s: any) => s.id === Number(newStatusId))

        if (selectedStatus) {
          const statusName = selectedStatus.name.toLowerCase()
          const isCompletedStatus =
            statusName.includes('hoàn thành') ||
            statusName.includes('done') ||
            statusName.includes('complete') ||
            statusName.includes('closed')

          if (isCompletedStatus) {
            // Check if all subtasks are completed
            const incompleteSubtasks = task.subtasks.filter((subtask) => {
              if (!subtask.status) return true
              const subtaskStatusName = subtask.status.name.toLowerCase()
              return !(
                subtaskStatusName.includes('hoàn thành') ||
                subtaskStatusName.includes('done') ||
                subtaskStatusName.includes('complete') ||
                subtaskStatusName.includes('closed')
              )
            })

            if (incompleteSubtasks.length > 0) {
              toast.error(
                `Không thể chuyển trạng thái sang hoàn thành. Bạn cần hoàn thành tất cả ${incompleteSubtasks.length} công việc con trước.`
              )
              setIsEditing(false)
              return
            }
          }
        }
      }

      await onUpdate(task, 'status_id', newStatusId)
      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating status:', error)
      if (error.response?.data?.error?.message) {
        toast.error(error.response.data.error.message)
      }
      setIsEditing(false)
    }
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (!isEditing && onTaskClick) {
          onTaskClick(task)
        }
      }}
      className={onTaskClick ? 'cursor-pointer' : ''}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
    >
      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()} className='min-w-[180px]'>
          <Dropdown
            placeholder='status'
            name='status_id'
            apiEndPoint={`/status/${projectId}`}
            onChange={async (e) => {
              await handleStatusChange(e?.target?.value)
            }}
            value={task.status_id ?? null}
            className='h-[40px]!'
            showClear={false}
          />
        </div>
      ) : (
        <StatusLabel apiEndPoint={`/status/${projectId}`} value={task.status_id ?? null} />
      )}
    </div>
  )
}
