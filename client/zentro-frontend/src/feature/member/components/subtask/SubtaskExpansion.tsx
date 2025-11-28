import type { Task } from '../../../../types/task'
import SubtaskRow from './SubtaskRow'

interface SubtaskExpansionProps {
  task: Task
  projectId: string
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function SubtaskExpansion({ task, projectId, onTaskClick, onUpdate }: SubtaskExpansionProps) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return <div className='px-4 py-3 text-sm text-gray-500 bg-gray-50 rounded mx-4 my-2'>Không có subtask nào</div>
  }

  return (
    <div className='px-4 py-3 bg-gray-50 rounded mx-4 my-2'>
      <div className='space-y-2'>
        {task.subtasks.map((subtask) => (
          <SubtaskRow
            key={subtask.task_id}
            subtask={subtask}
            projectId={projectId}
            onTaskClick={onTaskClick}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}
