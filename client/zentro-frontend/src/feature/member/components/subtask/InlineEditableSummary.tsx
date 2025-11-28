import { useState, useEffect } from 'react'
import { InputText } from 'primereact/inputtext'
import type { Task } from '../../../../types/task'

interface InlineEditableSummaryProps {
  task: Task
  onTaskClick: (task: Task) => void
  onUpdate: (task: Task, field: keyof Task, value: any) => Promise<void>
}

export default function InlineEditableSummary({ task, onTaskClick, onUpdate }: InlineEditableSummaryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title || '')

  useEffect(() => {
    setEditValue(task.title || '')
  }, [task.title])

  const handleBlur = async () => {
    if (editValue.trim() && editValue !== task.title) {
      await onUpdate(task, 'title', editValue.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(task.title || '')
      setIsEditing(false)
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <InputText
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className='w-full text-sm border-2 border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
          onClick={(e) => e.stopPropagation()}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          className='text-sm font-medium text-gray-900 truncate'
        >
          {task.title || 'Untitled'}
        </div>
      )}
    </div>
  )
}
