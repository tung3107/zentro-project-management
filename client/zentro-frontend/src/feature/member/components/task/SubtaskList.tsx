import { useState } from 'react'
import { CheckSquare } from 'lucide-react'
import type { Task } from '../../../../types/task'
import AddSubtaskInput from './AddSubtaskInput'
import SubtaskItem from './SubtaskItem'
import { type } from '../../../../types/type'

interface SubtaskListProps {
  subtasks?: Task[]
  parentTaskId: number
  projectId: string
  onSubtaskAdded?: () => void
  onSubtaskUpdated?: () => void
  onSubtaskDeleted?: () => void
}

export default function SubtaskList({
  subtasks = [],
  parentTaskId,
  projectId,
  onSubtaskAdded,
  onSubtaskUpdated,
  onSubtaskDeleted
}: SubtaskListProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleSubtaskAdded = () => {
    setIsAdding(false)
    onSubtaskAdded?.()
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
  }

  const subtaskIcon = type.find((t) => t.value === 'subtask')?.icon || <CheckSquare size={16} />

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-4'>
      <div className='flex items-center gap-2 mb-4'>
        {subtaskIcon}
        <h3 className='text-md font-bold text-gray-700'>Công việc phụ</h3>
        <span className='text-xs text-gray-500'>({subtasks.length})</span>
      </div>

      {/* Subtasks List */}
      <div className='space-y-3'>
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.task_id}
            subtask={subtask}
            projectId={projectId}
            onUpdated={onSubtaskUpdated}
            onDeleted={onSubtaskDeleted}
          />
        ))}

        {/* Add Subtask Input */}
        {isAdding ? (
          <AddSubtaskInput
            parentTaskId={parentTaskId}
            projectId={projectId}
            onAdded={handleSubtaskAdded}
            onCancel={handleCancelAdd}
          />
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className='w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors border border-transparent hover:border-gray-200'
          >
            <span>+</span>
            <span>Thêm công việc phụ</span>
          </button>
        )}
      </div>
    </div>
  )
}
