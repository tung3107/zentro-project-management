import { useState } from 'react'
import Dropdown from '../../../../components/Dropdown'
import Avatar from '../../../../components/Avatar'
import type { Task } from '../../../../types/task'

interface InlineEditableAssigneeProps {
  task: Task
  projectId: string
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function InlineEditableAssignee({
  task,
  projectId,
  onTaskClick,
  onUpdate
}: InlineEditableAssigneeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const assignee = task.assignee

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
        <div onClick={(e) => e.stopPropagation()} className='min-w-[200px]'>
          <Dropdown
            placeholder='assignee'
            name='assignee_id'
            apiEndPoint={`/members/dropdown/${projectId}`}
            onChange={async (e) => {
              await onUpdate(task, 'assignee_id', e?.target?.value || null)
              setIsEditing(false)
            }}
            value={task.assignee_id ?? null}
            className='h-[40px]! w-[200px]!'
            avatar={true}
            showClear={false}
            avatarSize={22}
          />
        </div>
      ) : assignee ? (
        <div className='flex items-center gap-2' title={assignee.email || ''}>
          <Avatar
            name={`${assignee.first_name || ''} ${assignee.last_name || ''}`}
            size={24}
            avatarUrl={assignee.avatar}
          />
          <span className='text-sm text-gray-700 truncate'>
            {assignee.first_name} {assignee.last_name}
          </span>
        </div>
      ) : (
        <span className='text-sm text-gray-400'>—</span>
      )}
    </div>
  )
}
