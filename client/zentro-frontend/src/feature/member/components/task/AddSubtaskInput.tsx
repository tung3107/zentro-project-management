import { useState, useEffect } from 'react'
import { createSubtaskAPI } from '../../service/task.service'
import api from '../../../../util/axiosClient'

interface AddSubtaskInputProps {
  parentTaskId: number
  projectId: string
  onAdded?: () => void
  onCancel?: () => void
}

export default function AddSubtaskInput({ parentTaskId, projectId, onAdded, onCancel }: AddSubtaskInputProps) {
  const [title, setTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [firstStatusId, setFirstStatusId] = useState<number | null>(null)

  useEffect(() => {
    const fetchFirstStatus = async () => {
      try {
        const response = await api.get(`/status/${projectId}`)
        const statuses = response.data.data
        if (statuses && statuses.length > 0) {
          setFirstStatusId(statuses[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch statuses:', error)
      }
    }
    fetchFirstStatus()
  }, [projectId])

  const handleSubmit = async () => {
    if (!title.trim() || isCreating) return

    setIsCreating(true)
    try {
      await createSubtaskAPI({
        parent_id: parentTaskId.toString(),
        project_id: projectId,
        title: title.trim(),
        type: 'subtask',
        priority: 0, // Lowest priority
        assignee_id: undefined,
        status_id: firstStatusId ?? undefined
      })
      setTitle('')
      onAdded?.()
    } catch (error) {
      console.error('Failed to create subtask:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <div className='flex items-center gap-2 px-3 py-2'>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={isCreating}
        placeholder='Nhập tiêu đề công việc phụ...'
        className='flex-1 px-2 py-1.5 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50'
      />
    </div>
  )
}
