import type { Task } from '../../../../types/task'
import InlineEditableSummary from './InlineEditableSummary'
import InlineEditableStatus from './InlineEditableStatus'
import InlineEditableAssignee from './InlineEditableAssignee'
import { priorityColors, type as taskTypes } from '../../../../types/type'
import { format } from 'date-fns'

interface SubtaskRowProps {
  subtask: Task
  projectId: string
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function SubtaskRow({ subtask, projectId, onTaskClick, onUpdate }: SubtaskRowProps) {
  const priority = priorityColors.find((p) => p.value === subtask.priority)
  const taskType = taskTypes.find((t) => t.value === subtask.type)
  const dueDate = subtask.due_date ? new Date(subtask.due_date) : null
  const isOverdue = dueDate && dueDate < new Date() && !subtask.status?.name?.toLowerCase().includes('hoàn thành')
  const statusName = subtask.status?.name?.toLowerCase() || ''
  const isDone = statusName.includes('done') || statusName.includes('hoàn thành')

  return (
    <div
      className='bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors grid grid-cols-[40px_400px_160px_160px_120px_140px_120px] items-center px-4 py-2.5'
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Checkbox - empty for subtasks */}
      <div className='w-[40px]'></div>

      {/* Work column - aligned with parent */}
      <div className='flex items-center gap-2'>
        <span className='w-[18px]' /> {/* Spacer for expand button */}
        <div className='flex-shrink-0'>{taskType?.icon || taskTypes[1].icon}</div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTaskClick(subtask)
          }}
          className='text-sm text-blue-600 underline hover:text-blue-700 font-medium flex-shrink-0'
        >
          {subtask.task_id}
        </button>
        <div className='flex-1 min-w-0'>
          <InlineEditableSummary task={subtask} onTaskClick={() => {}} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Assignee */}
      <div className='text-sm'>
        <InlineEditableAssignee task={subtask} projectId={projectId} onTaskClick={() => {}} onUpdate={onUpdate} />
      </div>

      {/* Reporter */}
      <div className='text-sm text-gray-700'>{subtask.reporter_id ? 'Duong Tung' : '—'}</div>

      {/* Priority */}
      <div className='text-sm'>
        {priority ? (
          <div className='flex items-center gap-1.5'>
            {priority.icon}
            <span style={{ color: priority.color }}>{priority.label}</span>
          </div>
        ) : (
          <span className='text-gray-400'>—</span>
        )}
      </div>

      {/* Status */}
      <div className='text-sm'>
        <InlineEditableStatus task={subtask} projectId={projectId} onTaskClick={() => {}} onUpdate={onUpdate} />
      </div>

      {/* Resolution */}
      <div className='text-sm text-gray-700'>{isDone ? 'Done' : 'Unresolved'}</div>
    </div>
  )
}
